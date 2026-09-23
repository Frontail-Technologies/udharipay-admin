import type { ReactNode } from "react";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { CanonicalReport } from "@/api/generated/contracts/reports";
import { useReportDirectory } from "./useReports";

const api = vi.hoisted(() => ({ getReport: vi.fn(), exportReport: vi.fn() }));
vi.mock("@/api/generated/reports", () => api);

const replace = vi.hoisted(() => vi.fn());
const back = vi.hoisted(() => vi.fn());
const push = vi.hoisted(() => vi.fn());
let search = vi.hoisted(() => new URLSearchParams());
vi.mock("next/navigation", () => ({
  usePathname: () => "/reports",
  useRouter: () => ({ replace, back, push }),
  useSearchParams: () => search,
}));

const report: CanonicalReport = { kind: "collections", title: "Collection Report", generatedAt: "2026-09-22T08:30:00.000Z", period: { from: "2026-09-01", to: "2026-09-22", timeZone: "Asia/Kolkata" }, filters: {}, metrics: [], columns: [], rows: [], pagination: { nextCursor: null } };

function setup() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const wrapper = ({ children }: { children: ReactNode }) => <QueryClientProvider client={client}>{children}</QueryClientProvider>;
  return { wrapper };
}

beforeEach(() => {
  vi.clearAllMocks();
  search = new URLSearchParams();
  api.getReport.mockResolvedValue({ data: report });
  api.exportReport.mockResolvedValue(new Blob(["ok"], { type: "application/octet-stream" }));
});

describe("useReportDirectory", () => {
  it("loads exactly one active report query, not all report kinds", async () => {
    const { wrapper } = setup();
    const { result } = renderHook(() => useReportDirectory(), { wrapper });
    await waitFor(() => expect(result.current.query.isSuccess).toBe(true));
    expect(api.getReport).toHaveBeenCalledOnce();
    expect(api.getReport).toHaveBeenCalledWith("collections", expect.any(Object), { signal: expect.any(AbortSignal) });
  });

  it("drops a filter incompatible with the new report kind on switch", async () => {
    search = new URLSearchParams({ reportKind: "kyc", subjectType: "merchant" });
    const { wrapper } = setup();
    const { result } = renderHook(() => useReportDirectory(), { wrapper });
    await waitFor(() => expect(result.current.query.isSuccess).toBe(true));

    result.current.setKind("billing");

    expect(replace).toHaveBeenCalledOnce();
    const [calledUrl] = replace.mock.calls[0];
    expect(calledUrl).toContain("reportKind=billing");
    expect(calledUrl).not.toContain("subjectType=");
  });

  it("exports XLSX using the currently active report kind and filters", async () => {
    search = new URLSearchParams({ reportKind: "collections", merchantId: "merchant-1", dateFrom: "2026-09-01", dateTo: "2026-09-22" });
    const { wrapper } = setup();
    const { result } = renderHook(() => useReportDirectory(), { wrapper });
    await waitFor(() => expect(result.current.query.isSuccess).toBe(true));

    await result.current.runExport("xlsx");

    expect(api.exportReport).toHaveBeenCalledWith("collections", expect.objectContaining({ merchantId: "merchant-1", dateFrom: "2026-09-01", dateTo: "2026-09-22", format: "xlsx" }));
  });

  it("exports PDF using the currently active report kind and filters", async () => {
    search = new URLSearchParams({ reportKind: "collections", merchantId: "merchant-1", dateFrom: "2026-09-01", dateTo: "2026-09-22" });
    const { wrapper } = setup();
    const { result } = renderHook(() => useReportDirectory(), { wrapper });
    await waitFor(() => expect(result.current.query.isSuccess).toBe(true));

    await result.current.runExport("pdf");

    expect(api.exportReport).toHaveBeenCalledWith("collections", expect.objectContaining({ merchantId: "merchant-1", dateFrom: "2026-09-01", dateTo: "2026-09-22", format: "pdf" }));
  });

  it("never sends the page cursor or limit into an export request", async () => {
    search = new URLSearchParams({ reportKind: "collections", reportCursor: "some-cursor" });
    const { wrapper } = setup();
    const { result } = renderHook(() => useReportDirectory(), { wrapper });
    await waitFor(() => expect(result.current.query.isSuccess).toBe(true));

    await result.current.runExport("xlsx");

    const [, exportParams] = api.exportReport.mock.calls[0];
    expect(exportParams).not.toHaveProperty("cursor");
    expect(exportParams).not.toHaveProperty("limit");
  });
});
