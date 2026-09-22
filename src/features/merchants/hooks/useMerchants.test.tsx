import type { ReactNode } from "react";
import fs from "node:fs";
import path from "node:path";
import { act, renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Merchant } from "@/api/generated/contracts/merchants";
import { merchantKeys, useAssignMerchant, useChangeMerchantStatus, useCreateMerchant, useMerchant, useMerchants, useProvisionMerchantAccount, useUnassignMerchant, useUpdateMerchant } from "./useMerchants";

const api = vi.hoisted(() => ({ assignMerchant: vi.fn(), createMerchant: vi.fn(), getMerchant: vi.fn(), listMerchants: vi.fn(), provisionMerchantAccount: vi.fn(), updateMerchant: vi.fn() }));
const confirm = vi.hoisted(() => vi.fn());

vi.mock("@/api/generated/merchants", () => api);
vi.mock("@/shared/hooks/useConfirm", () => ({ useConfirm: () => confirm }));
vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

const merchant: Merchant = {
  id: "8d25b5aa-34e1-4c47-93b2-97bb946e1f71",
  publicId: "MER-1001",
  businessName: "Amit Traders",
  ownerName: "Amit Verma",
  businessCategory: "Wholesale Provisions",
  phone: "+919000000001",
  email: "amit@example.test",
  address: "12 Market Road",
  city: "Jaipur",
  state: "Rajasthan",
  pincode: "302001",
  status: "active",
  assignedEmployeeId: "9d25b5aa-34e1-4c47-93b2-97bb946e1f72",
  accounts: [],
  createdAt: "2026-09-20T00:00:00.000Z",
  updatedAt: "2026-09-20T00:00:00.000Z",
};

function setup() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
  const wrapper = ({ children }: { children: ReactNode }) => <QueryClientProvider client={client}>{children}</QueryClientProvider>;
  return { client, wrapper };
}

beforeEach(() => {
  vi.clearAllMocks();
  const response = { data: merchant };
  api.getMerchant.mockResolvedValue(response);
  api.listMerchants.mockResolvedValue({ data: { items: [merchant], pagination: { nextCursor: "next-cursor" } } });
  api.createMerchant.mockResolvedValue(response);
  api.updateMerchant.mockResolvedValue(response);
  api.assignMerchant.mockResolvedValue(response);
  api.provisionMerchantAccount.mockResolvedValue(response);
});

describe("Merchant API hooks", () => {
  it("keeps Merchant screens independent from demo Merchant state and unsupported aggregates", () => {
    const files = ["src/app/(admin)/merchants/page.tsx", "src/app/(admin)/merchants/[merchantId]/page.tsx", ...fs.readdirSync("src/features/merchants/components").filter((name) => name.endsWith(".tsx") && !name.endsWith(".test.tsx")).map((name) => path.join("src/features/merchants/components", name))];
    const source = files.map((file) => fs.readFileSync(file, "utf8")).join("\n");
    expect(source).not.toMatch(/useAdminEntities|adminDemoStore|data\/admin\/merchants|customerCount|outstanding|collectedThisMonth|kycStatus|subscriptionStatus/);
  });

  it("loads merchants with search, status, category, and cursor", async () => {
    const { wrapper } = setup();
    const params = { limit: 25, search: "Amit", status: "active" as const, businessCategory: "Wholesale Provisions", cursor: "current-cursor" };
    const { result } = renderHook(() => useMerchants(params), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(api.listMerchants).toHaveBeenCalledWith(params, { signal: expect.any(AbortSignal) });
    expect(result.current.data?.data.pagination.nextCursor).toBe("next-cursor");
  });

  it("returns empty and error states without a demo fallback", async () => {
    api.listMerchants.mockResolvedValueOnce({ data: { items: [], pagination: { nextCursor: null } } });
    const first = setup();
    const empty = renderHook(() => useMerchants({ limit: 25 }), { wrapper: first.wrapper });
    await waitFor(() => expect(empty.result.current.isSuccess).toBe(true));
    expect(empty.result.current.data?.data.items).toEqual([]);
    api.listMerchants.mockRejectedValueOnce(new Error("Unavailable"));
    const second = setup();
    const failed = renderHook(() => useMerchants({ limit: 20 }), { wrapper: second.wrapper });
    await waitFor(() => expect(failed.result.current.isError).toBe(true));
    expect(failed.result.current.data).toBeUndefined();
  });

  it("loads one Merchant detail request with its UUID", async () => {
    const { wrapper } = setup();
    const { result } = renderHook(() => useMerchant(merchant.id), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(api.getMerchant).toHaveBeenCalledOnce();
    expect(api.getMerchant).toHaveBeenCalledWith(merchant.id, { signal: expect.any(AbortSignal) });
  });

  it("creates a Merchant and invalidates lists", async () => {
    const { client, wrapper } = setup();
    client.setQueryData(merchantKeys.list({ limit: 25 }), { data: { items: [], pagination: { nextCursor: null } } });
    const { result } = renderHook(() => useCreateMerchant(), { wrapper });
    const input = { businessName: "Amit Traders", ownerName: "Amit Verma", businessCategory: "Wholesale Provisions", phone: "+919000000001", address: "12 Market Road", city: "Jaipur", state: "Rajasthan", pincode: "302001" };
    await act(() => result.current.mutateAsync(input));
    expect(api.createMerchant).toHaveBeenCalledWith(input);
    expect(client.getQueryState(merchantKeys.list({ limit: 25 }))?.isInvalidated).toBe(true);
  });

  it("updates supported fields and invalidates detail and lists", async () => {
    const { client, wrapper } = setup();
    client.setQueryData(merchantKeys.list({ limit: 25 }), { data: { items: [merchant], pagination: { nextCursor: null } } });
    client.setQueryData(merchantKeys.detail(merchant.id), { data: merchant });
    const { result } = renderHook(() => useUpdateMerchant(), { wrapper });
    await act(() => result.current.mutateAsync({ merchantId: merchant.id, input: { city: "Pune" } }));
    expect(api.updateMerchant).toHaveBeenCalledWith(merchant.id, { city: "Pune" });
    expect(client.getQueryState(merchantKeys.list({ limit: 25 }))?.isInvalidated).toBe(true);
    expect(client.getQueryState(merchantKeys.detail(merchant.id))?.isInvalidated).toBe(true);
  });

  it("requires confirmation for sensitive status changes", async () => {
    confirm.mockResolvedValueOnce(false).mockResolvedValueOnce(true);
    const { wrapper } = setup();
    const { result } = renderHook(() => useChangeMerchantStatus(), { wrapper });
    await act(() => result.current.changeStatus(merchant, "suspended"));
    expect(api.updateMerchant).not.toHaveBeenCalled();
    await act(() => result.current.changeStatus(merchant, "restricted"));
    expect(api.updateMerchant).toHaveBeenCalledWith(merchant.id, { status: "restricted" });
  });

  it("assigns and reassigns using the nullable assignment contract", async () => {
    const { wrapper } = setup();
    const { result } = renderHook(() => useAssignMerchant(), { wrapper });
    await act(() => result.current.mutateAsync({ merchantId: merchant.id, input: { assignedEmployeeId: "employee-a" } }));
    await act(() => result.current.mutateAsync({ merchantId: merchant.id, input: { assignedEmployeeId: "employee-b" } }));
    expect(api.assignMerchant).toHaveBeenNthCalledWith(1, merchant.id, { assignedEmployeeId: "employee-a" });
    expect(api.assignMerchant).toHaveBeenNthCalledWith(2, merchant.id, { assignedEmployeeId: "employee-b" });
  });

  it("confirms and sends null when unassigning", async () => {
    confirm.mockResolvedValueOnce(true);
    const { wrapper } = setup();
    const { result } = renderHook(() => useUnassignMerchant(), { wrapper });
    await act(() => result.current.unassign(merchant));
    expect(api.assignMerchant).toHaveBeenCalledWith(merchant.id, { assignedEmployeeId: null });
  });

  it("provisions an account and invalidates only the Merchant detail", async () => {
    const { client, wrapper } = setup();
    client.setQueryData(merchantKeys.detail(merchant.id), { data: merchant });
    client.setQueryData(merchantKeys.list({ limit: 25 }), { data: { items: [merchant], pagination: { nextCursor: null } } });
    const { result } = renderHook(() => useProvisionMerchantAccount(), { wrapper });
    const input = { email: "login@example.test", initialPassword: "secure-password" };
    await act(() => result.current.mutateAsync({ merchantId: merchant.id, input }));
    expect(api.provisionMerchantAccount).toHaveBeenCalledWith(merchant.id, input);
    expect(client.getQueryState(merchantKeys.detail(merchant.id))?.isInvalidated).toBe(true);
    expect(client.getQueryState(merchantKeys.list({ limit: 25 }))?.isInvalidated).toBe(false);
  });
});
