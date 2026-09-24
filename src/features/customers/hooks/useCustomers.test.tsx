import type { ReactNode } from "react";
import fs from "node:fs";
import path from "node:path";
import { act, renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Customer } from "@/api/generated/contracts/customers";
import { customerKeys, useChangeCustomerStatus, useCreateCustomer, useCustomer, useCustomers, useUpdateCustomer } from "./useCustomers";

const api = vi.hoisted(() => ({ createCustomer: vi.fn(), getCustomer: vi.fn(), listCustomers: vi.fn(), updateCustomer: vi.fn() }));
const confirm = vi.hoisted(() => vi.fn());
const toast = vi.hoisted(() => ({ success: vi.fn(), error: vi.fn() }));

vi.mock("@/api/generated/customers", () => api);
vi.mock("@/shared/hooks/useConfirm", () => ({ useConfirm: () => confirm }));
vi.mock("sonner", () => ({ toast }));

const customer: Customer = { id: "8d25b5aa-34e1-4c47-93b2-97bb946e1f71", publicId: "CUS-1001", merchantId: "9d25b5aa-34e1-4c47-93b2-97bb946e1f72", name: "Rahul Verma", phone: "+919000000001", alternatePhone: "+919000000002", address: "12 Market Road", city: "Jaipur", state: "Rajasthan", pincode: "302001", notes: null, status: "active", createdAt: "2026-09-20T00:00:00.000Z", updatedAt: "2026-09-20T00:00:00.000Z" };

function setup() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
  const wrapper = ({ children }: { children: ReactNode }) => <QueryClientProvider client={client}>{children}</QueryClientProvider>;
  return { client, wrapper };
}

beforeEach(() => {
  vi.clearAllMocks();
  const response = { data: customer };
  api.listCustomers.mockResolvedValue({ data: { items: [customer], pagination: { nextCursor: "next-cursor" } } });
  api.getCustomer.mockResolvedValue(response);
  api.createCustomer.mockResolvedValue(response);
  api.updateCustomer.mockResolvedValue(response);
});

describe("Customer API hooks", () => {
  it("keeps real Customer screens independent from demo state and direct query orchestration", () => {
    const files = ["src/app/(admin)/customers/page.tsx", "src/app/(admin)/customers/[customerId]/page.tsx", ...fs.readdirSync("src/features/customers/components").filter((name) => name.endsWith(".tsx") && !name.endsWith(".test.tsx")).map((name) => path.join("src/features/customers/components", name))];
    const source = files.map((file) => fs.readFileSync(file, "utf8")).join("\n");
    expect(source).not.toMatch(/useAdminEntities|adminDemoStore|data\/admin|useQuery\(|useMutation\(|URLSearchParams|invalidateQueries|activePlanCount|outstanding|mandateStatus|kycStatus/);
  });

  it("loads one Merchant-scoped list with search, status, and cursor", async () => {
    const { wrapper } = setup();
    const params = { limit: 25, search: "Rahul", status: "active" as const, cursor: "current-cursor" };
    const { result } = renderHook(() => useCustomers(customer.merchantId, params), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(api.listCustomers).toHaveBeenCalledOnce();
    expect(api.listCustomers).toHaveBeenCalledWith(customer.merchantId, params, { signal: expect.any(AbortSignal) });
  });

  it("does not query without Merchant context", () => {
    const { wrapper } = setup();
    const { result } = renderHook(() => useCustomers(undefined, { limit: 25 }), { wrapper });
    expect(result.current.fetchStatus).toBe("idle");
    expect(api.listCustomers).not.toHaveBeenCalled();
  });

  it("returns empty and error states without fixture fallback", async () => {
    api.listCustomers.mockResolvedValueOnce({ data: { items: [], pagination: { nextCursor: null } } });
    const first = setup();
    const empty = renderHook(() => useCustomers(customer.merchantId, { limit: 25 }), { wrapper: first.wrapper });
    await waitFor(() => expect(empty.result.current.isSuccess).toBe(true));
    expect(empty.result.current.data?.data.items).toEqual([]);
    api.listCustomers.mockRejectedValueOnce(new Error("Unavailable"));
    const second = setup();
    const failed = renderHook(() => useCustomers(customer.merchantId, { limit: 20 }), { wrapper: second.wrapper });
    await waitFor(() => expect(failed.result.current.isError).toBe(true));
    expect(failed.result.current.data).toBeUndefined();
  });

  it("loads Customer detail once without child-domain requests", async () => {
    const { wrapper } = setup();
    const { result } = renderHook(() => useCustomer(customer.id), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(api.getCustomer).toHaveBeenCalledOnce();
    expect(api.getCustomer).toHaveBeenCalledWith(customer.id, { signal: expect.any(AbortSignal) });
  });

  it("creates under the actual Merchant and invalidates only that Merchant list", async () => {
    const { client, wrapper } = setup();
    client.setQueryData(customerKeys.list(customer.merchantId, { limit: 25 }), { data: { items: [], pagination: { nextCursor: null } } });
    client.setQueryData(customerKeys.list("other-merchant", { limit: 25 }), { data: { items: [], pagination: { nextCursor: null } } });
    const { result } = renderHook(() => useCreateCustomer(), { wrapper });
    const input = { name: customer.name, phone: customer.phone, address: customer.address, city: customer.city, state: customer.state, pincode: customer.pincode };
    await act(() => result.current.mutateAsync({ merchantId: customer.merchantId, input }));
    expect(api.createCustomer).toHaveBeenCalledWith(customer.merchantId, input);
    expect(toast.success).toHaveBeenCalledWith("Customer created");
    expect(client.getQueryState(customerKeys.list(customer.merchantId, { limit: 25 }))?.isInvalidated).toBe(true);
    expect(client.getQueryState(customerKeys.list("other-merchant", { limit: 25 }))?.isInvalidated).toBe(false);
  });

  it("updates changed fields, clears alternate phone with null, and invalidates detail and list", async () => {
    const { client, wrapper } = setup();
    client.setQueryData(customerKeys.list(customer.merchantId, { limit: 25 }), { data: { items: [customer], pagination: { nextCursor: null } } });
    client.setQueryData(customerKeys.detail(customer.id), { data: customer });
    const { result } = renderHook(() => useUpdateCustomer(), { wrapper });
    await act(() => result.current.mutateAsync({ customerId: customer.id, merchantId: customer.merchantId, input: { city: "Pune", alternatePhone: null } }));
    expect(api.updateCustomer).toHaveBeenCalledWith(customer.id, { city: "Pune", alternatePhone: null });
    expect(client.getQueryState(customerKeys.list(customer.merchantId, { limit: 25 }))?.isInvalidated).toBe(true);
    expect(client.getQueryState(customerKeys.detail(customer.id))?.isInvalidated).toBe(true);
  });

  it("cancels and confirms blocked status through shared confirmation", async () => {
    confirm.mockResolvedValueOnce(false).mockResolvedValueOnce(true);
    const { wrapper } = setup();
    const { result } = renderHook(() => useChangeCustomerStatus(), { wrapper });
    await act(() => result.current.changeStatus(customer, "blocked"));
    expect(api.updateCustomer).not.toHaveBeenCalled();
    await act(() => result.current.changeStatus(customer, "blocked"));
    expect(api.updateCustomer).toHaveBeenCalledWith(customer.id, { status: "blocked" });
  });
});
