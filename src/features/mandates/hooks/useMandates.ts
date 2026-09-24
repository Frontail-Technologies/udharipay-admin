"use client";

import { useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { getMandate, listCustomerMandates, listMandateAttempts } from "@/api/generated/mandates";
import { MandateStatus } from "@/api/generated/common";
import type { ListCustomerMandatesParams, ListMandateAttemptsParams } from "@/api/generated/contracts/mandates";
import { readCursorState, writeCursorState, type CursorState } from "@/shared/utils/url";

const PAGE_SIZE = 25;

export const mandateKeys = {
  all: ["mandates"] as const,
  lists: () => [...mandateKeys.all, "list"] as const,
  customerLists: (customerId: string) => [...mandateKeys.lists(), customerId] as const,
  list: (customerId: string, params: ListCustomerMandatesParams) => [...mandateKeys.customerLists(customerId), params] as const,
  details: () => [...mandateKeys.all, "detail"] as const,
  detail: (mandateId: string) => [...mandateKeys.details(), mandateId] as const,
  attempts: (mandateId: string) => [...mandateKeys.detail(mandateId), "attempts"] as const,
  attemptList: (mandateId: string, params: ListMandateAttemptsParams) => [...mandateKeys.attempts(mandateId), params] as const,
};

export function useMandates(customerId: string | undefined, params: ListCustomerMandatesParams) {
  return useQuery({ queryKey: mandateKeys.list(customerId ?? "unselected", params), queryFn: ({ signal }) => listCustomerMandates(customerId ?? "", params, { signal }), enabled: Boolean(customerId) });
}

export function useMandate(mandateId: string) {
  return useQuery({ queryKey: mandateKeys.detail(mandateId), queryFn: ({ signal }) => getMandate(mandateId, { signal }) });
}

export function useMandateAttempts(mandateId: string, params: ListMandateAttemptsParams) {
  return useQuery({ queryKey: mandateKeys.attemptList(mandateId, params), queryFn: ({ signal }) => listMandateAttempts(mandateId, params, { signal }) });
}

export function useMandateDirectory() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const state = readCursorState(new URLSearchParams(searchParams.toString()));
  const status = parseMandateStatus(state.status);
  const params = useMemo<ListCustomerMandatesParams>(() => ({ limit: PAGE_SIZE, cursor: state.mandateCursor, status }), [state.mandateCursor, status]);
  const query = useMandates(state.customerId, params);
  const replaceState = (next: CursorState) => { const queryString = writeCursorState(new URLSearchParams(searchParams.toString()), next); router.replace(queryString ? `${pathname}?${queryString}` : pathname, { scroll: false }); };
  const setMerchantId = (merchantId: string) => replaceState({ merchantId, customerId: undefined, status: undefined, mandateCursor: undefined });
  const setCustomerId = (customerId: string) => replaceState({ merchantId: state.merchantId, customerId, status: undefined, mandateCursor: undefined });
  const goNext = (mandateCursor: string) => replaceState({ merchantId: state.merchantId, customerId: state.customerId, status: state.status, mandateCursor });
  return { query, mandates: query.data?.data.items ?? [], nextCursor: query.data?.data.pagination.nextCursor ?? null, merchantId: state.merchantId, customerId: state.customerId, state, status, replaceState, setMerchantId, setCustomerId, goPrevious: router.back, goNext };
}

export function useAttemptHistory(mandateId: string) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const state = readCursorState(new URLSearchParams(searchParams.toString()));
  const query = useMandateAttempts(mandateId, { limit: PAGE_SIZE, cursor: state.attemptCursor });
  const goNext = (attemptCursor: string) => { const queryString = writeCursorState(new URLSearchParams(searchParams.toString()), { attemptCursor }); const next = new URLSearchParams(queryString); next.set("tab", "attempts"); router.push(`${pathname}?${next.toString()}`, { scroll: false }); };
  return { query, attempts: query.data?.data.items ?? [], nextCursor: query.data?.data.pagination.nextCursor ?? null, hasPrevious: Boolean(state.attemptCursor), goPrevious: router.back, goNext };
}

function parseMandateStatus(value: string | undefined) {
  return Object.values(MandateStatus).find((status) => status === value);
}
