import type { ReactNode } from "react";
import fs from "node:fs";
import path from "node:path";
import { act, renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { collectionItem, followUp } from "@/test/fixtures/collections";
import { collectionKeys, useCollectionQueue, useCreateFollowUp, useFollowUps } from "./useCollections";

const api = vi.hoisted(() => ({ listCollectionQueue: vi.fn(), listFollowUps: vi.fn(), createFollowUp: vi.fn() }));
vi.mock("@/api/generated/collections", () => api);
vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

function setup() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
  const wrapper = ({ children }: { children: ReactNode }) => <QueryClientProvider client={client}>{children}</QueryClientProvider>;
  return { client, wrapper };
}

beforeEach(() => {
  vi.clearAllMocks();
  api.listCollectionQueue.mockResolvedValue({ data: { items: [collectionItem], pagination: { nextCursor: "next-queue" } } });
  api.listFollowUps.mockResolvedValue({ data: { items: [followUp], pagination: { nextCursor: "next-follow-up" } } });
  api.createFollowUp.mockResolvedValue({ data: followUp });
});

describe("Collection API hooks", () => {
  it("keeps the real Collection screen independent from fixtures and financial APIs", () => {
    const files = ["src/app/(admin)/collections/page.tsx", ...fs.readdirSync("src/features/collections/components").filter((name) => name.endsWith(".tsx") && !name.endsWith(".test.tsx")).map((name) => path.join("src/features/collections/components", name))];
    const source = files.map((file) => fs.readFileSync(file, "utf8")).join("\n");
    expect(source).not.toMatch(/useAdminEntities|data\/admin|api\/generated\/(payments|mandates|plans|customers)|mark as paid|retry autopay|change due date/i);
  });

  it("sends every supported queue filter and preserves canonical response values", async () => {
    const { wrapper } = setup();
    const params = { limit: 25, cursor: "queue-cursor", state: "partially_paid" as const, timingState: "overdue" as const, merchantId: collectionItem.merchantId, assignedEmployeeId: "66666666-6666-4666-8666-666666666666", dateFrom: "2026-08-01", dateTo: "2026-08-31", search: "Rahul" };
    const { result } = renderHook(() => useCollectionQueue(params), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(api.listCollectionQueue).toHaveBeenCalledWith(params, { signal: expect.any(AbortSignal) });
    expect(result.current.data?.data.items[0]).toMatchObject({ collectionState: "partially_paid", timingState: "overdue", daysOverdue: 3, outstandingAmountPaise: "800000", riskSignals: collectionItem.riskSignals });
  });

  it("returns real empty and error queue states without fixture fallback", async () => {
    api.listCollectionQueue.mockResolvedValueOnce({ data: { items: [], pagination: { nextCursor: null } } });
    const emptySetup = setup();
    const empty = renderHook(() => useCollectionQueue({ limit: 25 }), { wrapper: emptySetup.wrapper });
    await waitFor(() => expect(empty.result.current.isSuccess).toBe(true));
    expect(empty.result.current.data?.data.items).toEqual([]);
    api.listCollectionQueue.mockRejectedValueOnce(new Error("Unavailable"));
    const errorSetup = setup();
    const failed = renderHook(() => useCollectionQueue({ limit: 20 }), { wrapper: errorSetup.wrapper });
    await waitFor(() => expect(failed.result.current.isError).toBe(true));
    expect(failed.result.current.data).toBeUndefined();
  });

  it("loads one installment-scoped follow-up page only when selected", async () => {
    const { wrapper } = setup();
    const disabled = renderHook(() => useFollowUps(undefined, { limit: 25 }), { wrapper });
    expect(disabled.result.current.fetchStatus).toBe("idle");
    const selected = renderHook(() => useFollowUps(collectionItem.installmentId, { limit: 25, cursor: "history-cursor" }), { wrapper });
    await waitFor(() => expect(selected.result.current.isSuccess).toBe(true));
    expect(api.listFollowUps).toHaveBeenCalledOnce();
    expect(api.listFollowUps).toHaveBeenCalledWith(collectionItem.installmentId, { limit: 25, cursor: "history-cursor" }, { signal: expect.any(AbortSignal) });
  });

  it("creates an exact operational follow-up and invalidates only history and queue lists", async () => {
    const { client, wrapper } = setup();
    const invalidate = vi.spyOn(client, "invalidateQueries");
    const { result } = renderHook(() => useCreateFollowUp(), { wrapper });
    const input = { type: "will_pay" as const, note: "Will pay tomorrow", promisedDate: "2026-08-30T18:30:00.000Z", nextFollowUpAt: "2026-08-31T04:30:00.000Z" };
    await act(() => result.current.mutateAsync({ installmentId: collectionItem.installmentId, input }));
    expect(api.createFollowUp).toHaveBeenCalledWith(collectionItem.installmentId, input);
    expect(invalidate).toHaveBeenCalledWith({ queryKey: collectionKeys.followUpLists(collectionItem.installmentId) });
    expect(invalidate).toHaveBeenCalledWith({ queryKey: collectionKeys.lists() });
    expect(invalidate).toHaveBeenCalledTimes(2);
  });
});
