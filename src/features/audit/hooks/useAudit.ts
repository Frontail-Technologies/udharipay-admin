"use client";

import { useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { getAuditEvent, listAuditEvents } from "@/api/generated/audit";
import type { ListAuditEventsParams } from "@/api/generated/contracts/audit";
import { readCursorState, writeCursorState, type CursorState } from "@/shared/utils/url";

const PAGE_SIZE = 25;

export const auditKeys = {
  all: ["audit"] as const,
  lists: () => [...auditKeys.all, "list"] as const,
  list: (params: ListAuditEventsParams) => [...auditKeys.lists(), params] as const,
  details: () => [...auditKeys.all, "detail"] as const,
  detail: (auditEventId: string) => [...auditKeys.details(), auditEventId] as const,
};

export function useAuditEvents(params: ListAuditEventsParams) {
  return useQuery({ queryKey: auditKeys.list(params), queryFn: ({ signal }) => listAuditEvents(params, { signal }) });
}

export function useAuditEvent(auditEventId: string) {
  return useQuery({ queryKey: auditKeys.detail(auditEventId), queryFn: ({ signal }) => getAuditEvent(auditEventId, { signal }) });
}

export function useAuditDirectory() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const state = readCursorState(new URLSearchParams(searchParams.toString()));

  const params = useMemo<ListAuditEventsParams>(() => ({
    limit: PAGE_SIZE,
    cursor: state.auditCursor,
    action: state.action,
    actorUserId: state.actorUserId,
    entityType: state.entityType,
    entityId: state.entityType ? state.entityId : undefined,
    dateFrom: state.dateFrom,
    dateTo: state.dateTo,
  }), [state.action, state.actorUserId, state.auditCursor, state.dateFrom, state.dateTo, state.entityId, state.entityType]);

  const query = useAuditEvents(params);

  const replaceState = (next: CursorState) => {
    const queryString = writeCursorState(new URLSearchParams(searchParams.toString()), next);
    router.replace(queryString ? `${pathname}?${queryString}` : pathname, { scroll: false });
  };

  const setFilters = (next: Partial<CursorState>) => replaceState({ action: state.action, actorUserId: state.actorUserId, entityType: state.entityType, entityId: state.entityId, dateFrom: state.dateFrom, dateTo: state.dateTo, ...next, auditCursor: undefined });

  const goNext = (auditCursor: string) => replaceState({ action: state.action, actorUserId: state.actorUserId, entityType: state.entityType, entityId: state.entityId, dateFrom: state.dateFrom, dateTo: state.dateTo, auditCursor });

  return {
    query,
    events: query.data?.data.items ?? [],
    nextCursor: query.data?.data.pagination.nextCursor ?? null,
    state,
    setFilters,
    goPrevious: router.back,
    goNext,
  };
}
