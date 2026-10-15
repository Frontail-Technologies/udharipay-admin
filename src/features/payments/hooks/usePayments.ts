"use client";

import { useDeferredValue, useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { getPayment, listAllPayments, listPlanPayments } from "@/api/generated/payments";
import type { ListAllPaymentsParams, ListAllPaymentsType, ListPlanPaymentsParams } from "@/api/generated/contracts/payments";
import { ListAllPaymentsType as PaymentTypeEnum } from "@/api/generated/contracts/payments";
import { readCursorState, writeCursorState, type CursorState } from "@/shared/utils/url";

const PAGE_SIZE = 25;

export const paymentKeys = {
  all: ["payments"] as const,
  lists: () => [...paymentKeys.all, "list"] as const,
  globalList: (params: ListAllPaymentsParams) => [...paymentKeys.lists(), "global", params] as const,
  planLists: (planId: string) => [...paymentKeys.lists(), planId] as const,
  list: (planId: string, params: ListPlanPaymentsParams) => [...paymentKeys.planLists(planId), params] as const,
  details: () => [...paymentKeys.all, "detail"] as const,
  detail: (paymentId: string) => [...paymentKeys.details(), paymentId] as const,
};

export function usePayments(planId: string | undefined, params: ListPlanPaymentsParams) {
  return useQuery({
    queryKey: paymentKeys.list(planId ?? "unselected", params),
    queryFn: ({ signal }) => listPlanPayments(planId ?? "", params, { signal }),
    enabled: Boolean(planId),
  });
}

export function usePayment(paymentId: string) {
  return useQuery({
    queryKey: paymentKeys.detail(paymentId),
    queryFn: ({ signal }) => getPayment(paymentId, { signal }),
  });
}

export function usePlanPaymentHistory(planId: string) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const state = readCursorState(new URLSearchParams(searchParams.toString()));
  const params: ListPlanPaymentsParams = { limit: PAGE_SIZE, cursor: state.paymentCursor };
  const query = usePayments(planId, params);
  const goNext = (paymentCursor: string) => {
    const queryString = writeCursorState(new URLSearchParams(searchParams.toString()), { paymentCursor });
    const next = new URLSearchParams(queryString);
    next.set("tab", "payments");
    router.push(`${pathname}?${next.toString()}`, { scroll: false });
  };
  return { query, payments: query.data?.data.items ?? [], nextCursor: query.data?.data.pagination.nextCursor ?? null, hasPrevious: Boolean(state.paymentCursor), goPrevious: router.back, goNext };
}

export function useAllPayments(params: ListAllPaymentsParams) {
  return useQuery({
    queryKey: paymentKeys.globalList(params),
    queryFn: ({ signal }) => listAllPayments(params, { signal }),
  });
}

export function useGlobalPaymentsDirectory() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const state = readCursorState(new URLSearchParams(searchParams.toString()));
  const type = parsePaymentType(state.status);
  const deferredMerchantId = useDeferredValue(state.search ?? "");
  const params = useMemo<ListAllPaymentsParams>(() => ({
    limit: PAGE_SIZE,
    cursor: state.cursor,
    type: type ?? undefined,
    merchantId: deferredMerchantId || undefined,
  }), [state.cursor, type, deferredMerchantId]);
  const query = useAllPayments(params);
  const replaceState = (next: CursorState) => {
    const queryString = writeCursorState(new URLSearchParams(searchParams.toString()), next);
    router.replace(queryString ? `${pathname}?${queryString}` : pathname, { scroll: false });
  };
  const goNext = (cursor: string) => {
    const queryString = writeCursorState(new URLSearchParams(searchParams.toString()), { cursor, status: state.status });
    router.push(`${pathname}?${queryString}`, { scroll: false });
  };
  return {
    query,
    payments: query.data?.data.items ?? [],
    nextCursor: query.data?.data.pagination.nextCursor ?? null,
    state,
    type,
    replaceState,
    goPrevious: router.back,
    goNext,
  };
}

function parsePaymentType(value: string | undefined): ListAllPaymentsType | undefined {
  return Object.values(PaymentTypeEnum).find((t) => t === value) as ListAllPaymentsType | undefined;
}
