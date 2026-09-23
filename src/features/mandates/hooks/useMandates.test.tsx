import type { ReactNode } from "react";
import fs from "node:fs";
import path from "node:path";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Mandate, MandateAttempt } from "@/api/generated/contracts/mandates";
import { useMandate, useMandateAttempts, useMandates } from "./useMandates";

const api = vi.hoisted(() => ({ getMandate: vi.fn(), listCustomerMandates: vi.fn(), listMandateAttempts: vi.fn() }));
vi.mock("@/api/generated/mandates", () => api);

export const mandate: Mandate = { id: "8d25b5aa-34e1-4c47-93b2-97bb946e1f71", publicId: "MAN-1001", merchantId: "7d25b5aa-34e1-4c47-93b2-97bb946e1f72", customerId: "6d25b5aa-34e1-4c47-93b2-97bb946e1f73", planId: null, provider: null, method: "enach", status: "authorization_pending", providerReference: null, authorizedAt: null, activatedAt: null, expiresAt: null, maxAmountPaise: "9007199254740993", createdAt: "2026-09-22T08:30:00.000Z", updatedAt: "2026-09-22T08:30:00.000Z" };
export const attempts: MandateAttempt[] = [{ id: "5d25b5aa-34e1-4c47-93b2-97bb946e1f74", mandateId: mandate.id, planId: null, installmentId: null, amountPaise: null, status: "successful", provider: null, providerReference: null, failureCode: null, failureReason: null, attemptedAt: "2026-09-22T08:30:00.000Z", createdAt: "2026-09-22T08:30:00.000Z", updatedAt: "2026-09-22T08:30:00.000Z" }, { id: "4d25b5aa-34e1-4c47-93b2-97bb946e1f75", mandateId: mandate.id, planId: "3d25b5aa-34e1-4c47-93b2-97bb946e1f76", installmentId: "2d25b5aa-34e1-4c47-93b2-97bb946e1f77", amountPaise: "10000", status: "failed", provider: "provider", providerReference: "attempt-ref", failureCode: "BANK_DECLINED", failureReason: "Bank declined the debit", attemptedAt: "2026-09-23T08:30:00.000Z", createdAt: "2026-09-23T08:30:00.000Z", updatedAt: "2026-09-23T08:30:00.000Z" }];

function setup() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const wrapper = ({ children }: { children: ReactNode }) => <QueryClientProvider client={client}>{children}</QueryClientProvider>;
  return { wrapper };
}

beforeEach(() => {
  vi.clearAllMocks();
  api.listCustomerMandates.mockResolvedValue({ data: { items: [mandate], pagination: { nextCursor: "next-mandate" } } });
  api.getMandate.mockResolvedValue({ data: mandate });
  api.listMandateAttempts.mockResolvedValue({ data: { items: attempts, pagination: { nextCursor: "next-attempt" } } });
});

describe("Mandate API hooks", () => {
  it("keeps real Mandate screens independent from fixtures and financial APIs", () => {
    const files = ["src/app/(admin)/mandates/page.tsx", "src/app/(admin)/mandates/[mandateId]/page.tsx", ...fs.readdirSync("src/features/mandates/components").filter((name) => name.endsWith(".tsx") && !name.endsWith(".test.tsx")).map((name) => path.join("src/features/mandates/components", name))];
    const source = files.map((file) => fs.readFileSync(file, "utf8")).join("\n");
    expect(source).not.toMatch(/useAdminEntities|data\/admin|api\/generated\/(payments|razorpay|collections)|activateMandate|retryMandate|executeMandate|deleteMandate/);
  });

  it("loads one Customer-scoped status and cursor page", async () => {
    const { wrapper } = setup();
    const params = { limit: 25, cursor: "cursor", status: "active" as const };
    const { result } = renderHook(() => useMandates(mandate.customerId, params), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(api.listCustomerMandates).toHaveBeenCalledWith(mandate.customerId, params, { signal: expect.any(AbortSignal) });
  });

  it("does not query without Customer context", () => {
    const { wrapper } = setup();
    const { result } = renderHook(() => useMandates(undefined, { limit: 25 }), { wrapper });
    expect(result.current.fetchStatus).toBe("idle");
    expect(api.listCustomerMandates).not.toHaveBeenCalled();
  });

  it("returns true empty and error states without fixture fallback", async () => {
    api.listCustomerMandates.mockResolvedValueOnce({ data: { items: [], pagination: { nextCursor: null } } });
    const emptySetup = setup();
    const empty = renderHook(() => useMandates(mandate.customerId, { limit: 25 }), { wrapper: emptySetup.wrapper });
    await waitFor(() => expect(empty.result.current.isSuccess).toBe(true));
    expect(empty.result.current.data?.data.items).toEqual([]);
    api.listCustomerMandates.mockRejectedValueOnce(new Error("Unavailable"));
    const errorSetup = setup();
    const failed = renderHook(() => useMandates(mandate.customerId, { limit: 20 }), { wrapper: errorSetup.wrapper });
    await waitFor(() => expect(failed.result.current.isError).toBe(true));
    expect(failed.result.current.data).toBeUndefined();
  });

  it("loads Mandate detail once", async () => {
    const { wrapper } = setup();
    const { result } = renderHook(() => useMandate(mandate.id), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(api.getMandate).toHaveBeenCalledOnce();
    expect(api.getMandate).toHaveBeenCalledWith(mandate.id, { signal: expect.any(AbortSignal) });
  });

  it("loads one paginated attempt history with nullable links intact", async () => {
    const { wrapper } = setup();
    const params = { limit: 25, cursor: "attempt-cursor" };
    const { result } = renderHook(() => useMandateAttempts(mandate.id, params), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(api.listMandateAttempts).toHaveBeenCalledWith(mandate.id, params, { signal: expect.any(AbortSignal) });
    expect(result.current.data?.data.items[0]).toMatchObject({ planId: null, installmentId: null, status: "successful" });
  });

  it("integrates Customer detail through the Mandate feature", () => {
    const source = fs.readFileSync("src/features/customers/components/CustomerDetailView.tsx", "utf8");
    expect(source).toContain('import { CustomerMandatesSection } from "@/features/mandates/components/CustomerMandatesSection"');
    expect(source).not.toMatch(/api\/generated\/mandates|listCustomerMandates/);
  });
});
