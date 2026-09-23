import type { ReactNode } from "react";
import fs from "node:fs";
import path from "node:path";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { PaymentDetail } from "@/api/generated/contracts/payments";
import { usePayment, usePayments } from "./usePayments";

const api = vi.hoisted(() => ({ getPayment: vi.fn(), listPlanPayments: vi.fn() }));
vi.mock("@/api/generated/payments", () => api);

export const payment: PaymentDetail = { id: "8d25b5aa-34e1-4c47-93b2-97bb946e1f71", publicId: "PAY-1001", merchantId: "7d25b5aa-34e1-4c47-93b2-97bb946e1f72", customerId: "6d25b5aa-34e1-4c47-93b2-97bb946e1f73", planId: "5d25b5aa-34e1-4c47-93b2-97bb946e1f74", amountPaise: "9007199254740993", method: "upi", source: "provider", status: "successful", provider: "razorpay", providerReference: "pay_reference", paidAt: "2026-09-22T08:30:00.000Z", createdAt: "2026-09-22T08:30:00.000Z", updatedAt: "2026-09-22T08:30:00.000Z", allocations: [{ id: "4d25b5aa-34e1-4c47-93b2-97bb946e1f75", installmentId: "3d25b5aa-34e1-4c47-93b2-97bb946e1f76", installmentNumber: 1, dueDate: "2026-09-20", amountPaise: "4503599627370496", createdAt: "2026-09-22T08:30:00.000Z" }, { id: "2d25b5aa-34e1-4c47-93b2-97bb946e1f77", installmentId: "1d25b5aa-34e1-4c47-93b2-97bb946e1f78", installmentNumber: 2, dueDate: "2026-10-20", amountPaise: "4503599627370497", createdAt: "2026-09-22T08:30:00.000Z" }] };

function setup() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const wrapper = ({ children }: { children: ReactNode }) => <QueryClientProvider client={client}>{children}</QueryClientProvider>;
  return { wrapper };
}

beforeEach(() => {
  vi.clearAllMocks();
  api.listPlanPayments.mockResolvedValue({ data: { items: [payment], pagination: { nextCursor: "next-cursor" } } });
  api.getPayment.mockResolvedValue({ data: payment });
});

describe("Payment API hooks", () => {
  it("keeps real Payment screens independent from demo state and unsupported mutations", () => {
    const files = ["src/app/(admin)/payments/[paymentId]/page.tsx", ...fs.readdirSync("src/features/payments/components").filter((name) => name.endsWith(".tsx") && !name.endsWith(".test.tsx")).map((name) => path.join("src/features/payments/components", name))];
    const source = files.map((file) => fs.readFileSync(file, "utf8")).join("\n");
    expect(source).not.toMatch(/useAdminEntities|data\/admin|createPayment|updatePayment|deletePayment|mark as paid|refund payment|razorpay/i);
  });

  it("integrates Plan detail through the Payment feature without duplicate query ownership", () => {
    const source = fs.readFileSync("src/features/plans/components/PlanDetailView.tsx", "utf8");
    expect(source).toContain('import { PaymentHistory } from "@/features/payments/components/PaymentHistory"');
    expect(source).not.toMatch(/api\/generated\/payments|useQuery\(|listPlanPayments/);
  });

  it("loads one Plan-scoped cursor page", async () => {
    const { wrapper } = setup();
    const params = { limit: 25, cursor: "current-cursor" };
    const { result } = renderHook(() => usePayments(payment.planId, params), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(api.listPlanPayments).toHaveBeenCalledOnce();
    expect(api.listPlanPayments).toHaveBeenCalledWith(payment.planId, params, { signal: expect.any(AbortSignal) });
  });

  it("does not query without Plan context", () => {
    const { wrapper } = setup();
    const { result } = renderHook(() => usePayments(undefined, { limit: 25 }), { wrapper });
    expect(result.current.fetchStatus).toBe("idle");
    expect(api.listPlanPayments).not.toHaveBeenCalled();
  });

  it("returns true empty and error states without fixture fallback", async () => {
    api.listPlanPayments.mockResolvedValueOnce({ data: { items: [], pagination: { nextCursor: null } } });
    const emptySetup = setup();
    const empty = renderHook(() => usePayments(payment.planId, { limit: 25 }), { wrapper: emptySetup.wrapper });
    await waitFor(() => expect(empty.result.current.isSuccess).toBe(true));
    expect(empty.result.current.data?.data.items).toEqual([]);
    api.listPlanPayments.mockRejectedValueOnce(new Error("Unavailable"));
    const errorSetup = setup();
    const failed = renderHook(() => usePayments(payment.planId, { limit: 20 }), { wrapper: errorSetup.wrapper });
    await waitFor(() => expect(failed.result.current.isError).toBe(true));
    expect(failed.result.current.data).toBeUndefined();
  });

  it("loads Payment detail once with all allocations and no child requests", async () => {
    const { wrapper } = setup();
    const { result } = renderHook(() => usePayment(payment.id), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(api.getPayment).toHaveBeenCalledOnce();
    expect(api.getPayment).toHaveBeenCalledWith(payment.id, { signal: expect.any(AbortSignal) });
    expect(result.current.data?.data.allocations).toHaveLength(2);
  });
});
