import type { ReactNode } from "react";
import fs from "node:fs";
import path from "node:path";
import { act, renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { PlanDetail } from "@/api/generated/contracts/plans";
import { planKeys, useCreatePlan, usePlan, usePlans } from "./usePlans";

const api = vi.hoisted(() => ({ createPlan: vi.fn(), getPlan: vi.fn(), listPlans: vi.fn() }));
const toast = vi.hoisted(() => ({ success: vi.fn() }));
vi.mock("@/api/generated/plans", () => api);
vi.mock("sonner", () => ({ toast }));

const customerId = "8d25b5aa-34e1-4c47-93b2-97bb946e1f71";
const plan: PlanDetail = { id: "9d25b5aa-34e1-4c47-93b2-97bb946e1f72", publicId: "PLN-1001", merchantId: "7d25b5aa-34e1-4c47-93b2-97bb946e1f73", customerId, description: "Inventory", invoiceNumber: null, originalAmountPaise: "100001", numberOfCollections: 3, frequency: "monthly", startDate: "2026-01-31", status: "active", createdAt: "2026-01-01T00:00:00.000Z", updatedAt: "2026-01-01T00:00:00.000Z", completedAt: null, purchase: { purchaseDate: null, totalPurchasePaise: null, paidAtPurchasePaise: null, notes: null }, items: [], documents: [], cancelledAt: null, consent: null, installments: [{ id: "6d25b5aa-34e1-4c47-93b2-97bb946e1f74", installmentNumber: 1, dueDate: "2026-01-31", amountPaise: "33333", paidAmountPaise: "0", outstandingAmountPaise: "33333", displayState: "scheduled" }, { id: "5d25b5aa-34e1-4c47-93b2-97bb946e1f75", installmentNumber: 2, dueDate: "2026-02-28", amountPaise: "33333", paidAmountPaise: "10000", outstandingAmountPaise: "23333", displayState: "partially_paid" }, { id: "4d25b5aa-34e1-4c47-93b2-97bb946e1f76", installmentNumber: 3, dueDate: "2026-03-31", amountPaise: "33335", paidAmountPaise: "33335", outstandingAmountPaise: "0", displayState: "paid" }] };

function setup() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
  const wrapper = ({ children }: { children: ReactNode }) => <QueryClientProvider client={client}>{children}</QueryClientProvider>;
  return { client, wrapper };
}

beforeEach(() => {
  vi.clearAllMocks();
  api.listPlans.mockResolvedValue({ data: { items: [plan], pagination: { nextCursor: "next-cursor" } } });
  api.getPlan.mockResolvedValue({ data: plan });
  api.createPlan.mockResolvedValue({ data: plan });
});

describe("Plan API hooks", () => {
  it("keeps real Plan screens independent from demo and other financial domains", () => {
    const files = ["src/app/(admin)/plans/page.tsx", "src/app/(admin)/plans/[planId]/page.tsx", ...fs.readdirSync("src/features/plans/components").filter((name) => name.endsWith(".tsx")).map((name) => path.join("src/features/plans/components", name))];
    const source = files.map((file) => fs.readFileSync(file, "utf8")).join("\n");
    expect(source).not.toMatch(/useAdminEntities|data\/admin|generated\/payments|generated\/mandates|generated\/collections|useQuery\(|useMutation\(|calculateInstallment|pause plan|cancel plan|delete plan/i);
  });

  it("loads one Customer-scoped list with supported filters and cursor", async () => {
    const { wrapper } = setup();
    const params = { limit: 25, status: "active" as const, frequency: "monthly" as const, cursor: "cursor" };
    const { result } = renderHook(() => usePlans(customerId, params), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(api.listPlans).toHaveBeenCalledWith(customerId, params, { signal: expect.any(AbortSignal) });
  });

  it("does not query without Customer context", () => {
    const { wrapper } = setup();
    const { result } = renderHook(() => usePlans(undefined, { limit: 25 }), { wrapper });
    expect(result.current.fetchStatus).toBe("idle");
    expect(api.listPlans).not.toHaveBeenCalled();
  });

  it("loads detail once with its canonical installments", async () => {
    const { wrapper } = setup();
    const { result } = renderHook(() => usePlan(plan.id), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(api.getPlan).toHaveBeenCalledOnce();
    expect(result.current.data?.data.installments).toEqual(plan.installments);
  });

  it("creates with the exact generated body and invalidates only the Customer list", async () => {
    const { client, wrapper } = setup();
    client.setQueryData(planKeys.list(customerId, { limit: 25 }), { data: { items: [], pagination: { nextCursor: null } } });
    client.setQueryData(planKeys.list("other-customer", { limit: 25 }), { data: { items: [], pagination: { nextCursor: null } } });
    const input = { description: "Inventory", invoiceNumber: null, originalAmountPaise: "100001", numberOfCollections: 3, frequency: "monthly" as const, startDate: "2026-01-31" };
    const { result } = renderHook(() => useCreatePlan(), { wrapper });
    await act(() => result.current.mutateAsync({ customerId, input }));
    expect(api.createPlan).toHaveBeenCalledWith(customerId, input);
    expect(client.getQueryState(planKeys.list(customerId, { limit: 25 }))?.isInvalidated).toBe(true);
    expect(client.getQueryState(planKeys.list("other-customer", { limit: 25 }))?.isInvalidated).toBe(false);
    expect(toast.success).toHaveBeenCalledWith("Plan created");
  });
});
