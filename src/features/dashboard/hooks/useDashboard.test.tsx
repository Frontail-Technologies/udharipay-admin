import type { ReactNode } from "react";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useDashboard } from "./useDashboard";

const api = vi.hoisted(() => ({
  getReport: vi.fn(),
  listCollectionQueue: vi.fn(),
  listKycReviews: vi.fn(),
  listBillingInvoices: vi.fn(),
  listAuditEvents: vi.fn(),
}));
vi.mock("@/api/generated/reports", () => ({ getReport: api.getReport, exportReport: vi.fn() }));
vi.mock("@/api/generated/collections", () => ({ listCollectionQueue: api.listCollectionQueue }));
vi.mock("@/api/generated/kyc", () => ({ listKycReviews: api.listKycReviews }));
vi.mock("@/api/generated/billing", () => ({ listBillingInvoices: api.listBillingInvoices }));
vi.mock("@/api/generated/audit", () => ({ listAuditEvents: api.listAuditEvents }));

function setup() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const wrapper = ({ children }: { children: ReactNode }) => <QueryClientProvider client={client}>{children}</QueryClientProvider>;
  return { wrapper };
}

beforeEach(() => {
  vi.clearAllMocks();
  const emptyReport = { data: { kind: "collections", title: "", generatedAt: "", period: { from: "", to: "", timeZone: "Asia/Kolkata" }, filters: {}, metrics: [], columns: [], rows: [], pagination: { nextCursor: null } } };
  api.getReport.mockResolvedValue(emptyReport);
  api.listCollectionQueue.mockResolvedValue({ data: { items: [], pagination: { nextCursor: null } } });
  api.listKycReviews.mockResolvedValue({ data: { items: [], pagination: { nextCursor: null } } });
  api.listBillingInvoices.mockResolvedValue({ data: { items: [], pagination: { nextCursor: null } } });
  api.listAuditEvents.mockResolvedValue({ data: { items: [], pagination: { nextCursor: null } } });
});

describe("useDashboard", () => {
  it("requests exactly four bounded canonical reports for the initial default period", async () => {
    const { wrapper } = setup();
    const { result } = renderHook(() => useDashboard(), { wrapper });
    await waitFor(() => expect(result.current.collectionsReport.isSuccess).toBe(true));
    await waitFor(() => expect(result.current.merchantsReport.isSuccess).toBe(true));
    await waitFor(() => expect(result.current.customersReport.isSuccess).toBe(true));
    await waitFor(() => expect(result.current.mandatesReport.isSuccess).toBe(true));

    expect(api.getReport).toHaveBeenCalledTimes(4);
    const kinds = api.getReport.mock.calls.map(([kind]) => kind).sort();
    expect(kinds).toEqual(["collections", "customers", "mandates", "merchants"]);
    for (const [, params] of api.getReport.mock.calls) {
      expect(params).toMatchObject({ limit: 1 });
      expect(params.dateFrom).toBeTruthy();
      expect(params.dateTo).toBeTruthy();
    }
  });

  it("requests small bounded attention and activity lists, not full datasets", async () => {
    const { wrapper } = setup();
    const { result } = renderHook(() => useDashboard(), { wrapper });
    await waitFor(() => expect(result.current.collectionAttention.isSuccess).toBe(true));
    await waitFor(() => expect(result.current.kycAttention.isSuccess).toBe(true));
    await waitFor(() => expect(result.current.billingAttention.isSuccess).toBe(true));
    await waitFor(() => expect(result.current.activity.isSuccess).toBe(true));

    expect(api.listCollectionQueue).toHaveBeenCalledWith({ state: "overdue", limit: 5 }, { signal: expect.any(AbortSignal) });
    expect(api.listKycReviews).toHaveBeenCalledWith({ status: "pending", limit: 5 }, { signal: expect.any(AbortSignal) });
    expect(api.listBillingInvoices).toHaveBeenCalledWith({ status: "pending", limit: 5 }, { signal: expect.any(AbortSignal) });
    expect(api.listAuditEvents).toHaveBeenCalledWith({ limit: 8 }, { signal: expect.any(AbortSignal) });
  });

  it("refresh() refetches every dashboard source without reloading the page", async () => {
    const { wrapper } = setup();
    const { result } = renderHook(() => useDashboard(), { wrapper });
    await waitFor(() => expect(result.current.activity.isSuccess).toBe(true));
    vi.clearAllMocks();

    result.current.refresh();

    await waitFor(() => expect(api.getReport).toHaveBeenCalledTimes(4));
    expect(api.listCollectionQueue).toHaveBeenCalledOnce();
    expect(api.listKycReviews).toHaveBeenCalledOnce();
    expect(api.listBillingInvoices).toHaveBeenCalledOnce();
    expect(api.listAuditEvents).toHaveBeenCalledOnce();
  });
});
