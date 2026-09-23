"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { getPayment, listPlanPayments } from "@/api/generated/payments";
import type { ListPlanPaymentsParams } from "@/api/generated/contracts/payments";
import { readCursorState, writeCursorState } from "@/shared/utils/url";

const PAGE_SIZE = 25;

export const paymentKeys = {
  all: ["payments"] as const,
  lists: () => [...paymentKeys.all, "list"] as const,
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
