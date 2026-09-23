"use client";

import { useDeferredValue, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { createFollowUp, listCollectionQueue, listFollowUps } from "@/api/generated/collections";
import { CollectionState, CollectionTimingState, type CreateFollowUpBody, type ListCollectionQueueParams, type ListFollowUpsParams } from "@/api/generated/contracts/collections";
import { useEmployees } from "@/features/employees/hooks/useEmployees";
import { useMerchants } from "@/features/merchants/hooks/useMerchants";
import { readCursorState, writeCursorState, type CursorState } from "@/shared/utils/url";

const PAGE_SIZE = 25;

export const collectionKeys = {
  all: ["collections"] as const,
  lists: () => [...collectionKeys.all, "list"] as const,
  list: (params: ListCollectionQueueParams) => [...collectionKeys.lists(), params] as const,
  followUps: () => [...collectionKeys.all, "follow-ups"] as const,
  followUpLists: (installmentId: string) => [...collectionKeys.followUps(), installmentId] as const,
  followUpList: (installmentId: string, params: ListFollowUpsParams) => [...collectionKeys.followUpLists(installmentId), params] as const,
};

export function useCollectionQueue(params: ListCollectionQueueParams) {
  return useQuery({ queryKey: collectionKeys.list(params), queryFn: ({ signal }) => listCollectionQueue(params, { signal }) });
}

export function useFollowUps(installmentId: string | undefined, params: ListFollowUpsParams) {
  return useQuery({ queryKey: collectionKeys.followUpList(installmentId ?? "unselected", params), queryFn: ({ signal }) => listFollowUps(installmentId ?? "", params, { signal }), enabled: Boolean(installmentId) });
}

export function useCreateFollowUp() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ installmentId, input }: { installmentId: string; input: CreateFollowUpBody }) => createFollowUp(installmentId, input),
    onSuccess: async (_, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: collectionKeys.followUpLists(variables.installmentId) }),
        queryClient.invalidateQueries({ queryKey: collectionKeys.lists() }),
      ]);
      toast.success("Follow-up added");
    },
  });
}

export function useCollectionDirectory() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const state = readCursorState(new URLSearchParams(searchParams.toString()));
  const deferredSearch = useDeferredValue(state.search ?? "");
  const collectionState = parseCollectionState(state.collectionState);
  const timingState = parseTimingState(state.timingState);
  const params = useMemo<ListCollectionQueueParams>(() => ({ limit: PAGE_SIZE, cursor: state.collectionCursor, search: deferredSearch || undefined, state: collectionState, timingState, merchantId: state.merchantId, assignedEmployeeId: state.employeeId, dateFrom: state.dateFrom, dateTo: state.dateTo }), [collectionState, deferredSearch, state.collectionCursor, state.dateFrom, state.dateTo, state.employeeId, state.merchantId, timingState]);
  const query = useCollectionQueue(params);
  const merchantsQuery = useMerchants({ limit: 100 });
  const employeesQuery = useEmployees({ limit: 100 });
  const navigate = (patch: CursorState, push = false) => {
    const queryString = writeCursorState(new URLSearchParams(searchParams.toString()), patch);
    const target = queryString ? `${pathname}?${queryString}` : pathname;
    if (push) router.push(target, { scroll: false });
    else router.replace(target, { scroll: false });
  };
  const setFilters = (patch: CursorState) => navigate({ ...patch, collectionCursor: undefined });
  const goNext = (collectionCursor: string) => navigate({ collectionCursor }, true);
  return {
    query,
    rows: query.data?.data.items ?? [],
    nextCursor: query.data?.data.pagination.nextCursor ?? null,
    hasPrevious: Boolean(state.collectionCursor),
    state,
    collectionState,
    timingState,
    merchantOptions: merchantsQuery.data?.data.items ?? [],
    employeeOptions: employeesQuery.data?.data.items ?? [],
    filterOptionsPending: merchantsQuery.isPending || employeesQuery.isPending,
    setFilters,
    goPrevious: router.back,
    goNext,
  };
}

export function useFollowUpHistory(installmentId: string | undefined) {
  const [cursor, setCursor] = useState<string>();
  const [history, setHistory] = useState<string[]>([]);
  const query = useFollowUps(installmentId, { limit: PAGE_SIZE, cursor });
  const goNext = (nextCursor: string) => { setHistory((current) => [...current, cursor ?? ""]); setCursor(nextCursor); };
  const goPrevious = () => { const next = [...history]; const previous = next.pop(); setHistory(next); setCursor(previous || undefined); };
  return { query, followUps: query.data?.data.items ?? [], nextCursor: query.data?.data.pagination.nextCursor ?? null, hasPrevious: history.length > 0, goNext, goPrevious };
}

function parseCollectionState(value: string | undefined) {
  return Object.values(CollectionState).find((state) => state === value);
}

function parseTimingState(value: string | undefined) {
  return Object.values(CollectionTimingState).find((state) => state === value);
}
