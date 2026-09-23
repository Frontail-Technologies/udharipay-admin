import type { ReactNode } from "react";
import fs from "node:fs";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { AuditEvent } from "@/api/generated/contracts/audit";
import { useAuditEvent, useAuditEvents } from "./useAudit";

const api = vi.hoisted(() => ({ listAuditEvents: vi.fn(), getAuditEvent: vi.fn() }));
vi.mock("@/api/generated/audit", () => api);

const event: AuditEvent = { id: "8d25b5aa-34e1-4c47-93b2-97bb946e1f71", actorUserId: "7d25b5aa-34e1-4c47-93b2-97bb946e1f72", actorRole: "admin", requestId: "req-1", action: "merchant.updated", entityType: "merchant", entityId: "6d25b5aa-34e1-4c47-93b2-97bb946e1f73", changes: { statusFrom: "draft", statusTo: "active" }, metadata: { fields: ["status"] }, createdAt: "2026-09-22T08:30:00.000Z" };

function setup() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const wrapper = ({ children }: { children: ReactNode }) => <QueryClientProvider client={client}>{children}</QueryClientProvider>;
  return { wrapper };
}

beforeEach(() => {
  vi.clearAllMocks();
  api.listAuditEvents.mockResolvedValue({ data: { items: [event], pagination: { nextCursor: "next-audit" } } });
  api.getAuditEvent.mockResolvedValue({ data: event });
});

describe("Audit API hooks", () => {
  it("keeps the real Audit path independent from useAdminEntities and demo fixtures", () => {
    const source = fs.readFileSync("src/app/(admin)/events/page.tsx", "utf8")
      + fs.readFileSync("src/features/audit/hooks/useAudit.ts", "utf8")
      + fs.readFileSync("src/features/audit/components/AuditWorkspace.tsx", "utf8")
      + fs.readFileSync("src/features/audit/components/AuditTable.tsx", "utf8")
      + fs.readFileSync("src/features/audit/components/AuditDetailSheet.tsx", "utf8");
    expect(source).not.toMatch(/useAdminEntities|data\/admin|adminAuditStore|resolveEventEntity/);
  });

  it("loads one filtered cursor page and maps items", async () => {
    const { wrapper } = setup();
    const params = { limit: 25, cursor: "cursor", entityType: "merchant", entityId: event.entityId, action: "merchant.updated" };
    const { result } = renderHook(() => useAuditEvents(params), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(api.listAuditEvents).toHaveBeenCalledWith(params, { signal: expect.any(AbortSignal) });
    expect(result.current.data?.data.items[0]).toMatchObject({ action: "merchant.updated", entityType: "merchant" });
  });

  it("sends only actor/date filters that were actually set, no offset params", async () => {
    const { wrapper } = setup();
    const params = { limit: 25, actorUserId: event.actorUserId ?? undefined, dateFrom: "2026-09-01T00:00:00.000+05:30", dateTo: "2026-09-22T23:59:00.000+05:30" };
    const { result } = renderHook(() => useAuditEvents(params), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(api.listAuditEvents).toHaveBeenCalledWith(params, { signal: expect.any(AbortSignal) });
    const [[calledParams]] = api.listAuditEvents.mock.calls;
    expect(calledParams).not.toHaveProperty("page");
    expect(calledParams).not.toHaveProperty("offset");
  });

  it("returns true empty and error states without fixture fallback", async () => {
    api.listAuditEvents.mockResolvedValueOnce({ data: { items: [], pagination: { nextCursor: null } } });
    const empty = setup();
    const emptyResult = renderHook(() => useAuditEvents({ limit: 25 }), { wrapper: empty.wrapper });
    await waitFor(() => expect(emptyResult.result.current.isSuccess).toBe(true));
    expect(emptyResult.result.current.data?.data.items).toEqual([]);

    api.listAuditEvents.mockRejectedValueOnce(new Error("Unavailable"));
    const failed = setup();
    const failedResult = renderHook(() => useAuditEvents({ limit: 25 }), { wrapper: failed.wrapper });
    await waitFor(() => expect(failedResult.result.current.isError).toBe(true));
    expect(failedResult.result.current.data).toBeUndefined();
  });

  it("loads one audit event detail request when used", async () => {
    const { wrapper } = setup();
    const { result } = renderHook(() => useAuditEvent(event.id), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(api.getAuditEvent).toHaveBeenCalledOnce();
    expect(api.getAuditEvent).toHaveBeenCalledWith(event.id, { signal: expect.any(AbortSignal) });
  });
});
