"use client";

import { useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { createPlan, getPlan, listPlans } from "@/api/generated/plans";
import { PlanFrequency } from "@/api/generated/common";
import { PlanStatus, type CreatePlanBody, type ListPlansParams } from "@/api/generated/contracts/plans";
import { readCursorState, writeCursorState, type CursorState } from "@/shared/utils/url";

const PAGE_SIZE = 25;

export const planKeys = {
  all: ["plans"] as const,
  lists: () => [...planKeys.all, "list"] as const,
  customerLists: (customerId: string) => [...planKeys.lists(), customerId] as const,
  list: (customerId: string, params: ListPlansParams) => [...planKeys.customerLists(customerId), params] as const,
  details: () => [...planKeys.all, "detail"] as const,
  detail: (planId: string) => [...planKeys.details(), planId] as const,
};

export function usePlans(customerId: string | undefined, params: ListPlansParams) {
  return useQuery({
    queryKey: planKeys.list(customerId ?? "unselected", params),
    queryFn: ({ signal }) => listPlans(customerId ?? "", params, { signal }),
    enabled: Boolean(customerId),
  });
}

export function usePlan(planId: string) {
  return useQuery({
    queryKey: planKeys.detail(planId),
    queryFn: ({ signal }) => getPlan(planId, { signal }),
  });
}

export function usePlanDirectory() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const state = readCursorState(new URLSearchParams(searchParams.toString()));
  const status = parsePlanStatus(state.status);
  const frequency = parsePlanFrequency(state.frequency);
  const params = useMemo<ListPlansParams>(() => ({ limit: PAGE_SIZE, cursor: state.cursor, status, frequency }), [frequency, state.cursor, status]);
  const query = usePlans(state.customerId, params);
  const replaceState = (next: CursorState) => {
    const queryString = writeCursorState(new URLSearchParams(searchParams.toString()), next);
    router.replace(queryString ? `${pathname}?${queryString}` : pathname, { scroll: false });
  };
  const setMerchantId = (merchantId: string) => replaceState({ merchantId, customerId: undefined, status: undefined, frequency: undefined, cursor: undefined });
  const setCustomerId = (customerId: string) => replaceState({ merchantId: state.merchantId, customerId, status: undefined, frequency: undefined, cursor: undefined });
  const goNext = (cursor: string) => {
    const queryString = writeCursorState(new URLSearchParams(searchParams.toString()), { merchantId: state.merchantId, customerId: state.customerId, status: state.status, frequency: state.frequency, cursor });
    router.push(`${pathname}?${queryString}`, { scroll: false });
  };
  return { query, plans: query.data?.data.items ?? [], nextCursor: query.data?.data.pagination.nextCursor ?? null, merchantId: state.merchantId, customerId: state.customerId, state, status, frequency, replaceState, setMerchantId, setCustomerId, goPrevious: router.back, goNext };
}

export function useCreatePlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ customerId, input }: { customerId: string; input: CreatePlanBody }) => createPlan(customerId, input),
    onSuccess: async (response, variables) => {
      queryClient.setQueryData(planKeys.detail(response.data.id), response);
      await queryClient.invalidateQueries({ queryKey: planKeys.customerLists(variables.customerId) });
      toast.success("Plan created");
    },
  });
}

function parsePlanStatus(value: string | undefined) {
  return Object.values(PlanStatus).find((status) => status === value);
}

function parsePlanFrequency(value: string | undefined) {
  return Object.values(PlanFrequency).find((frequency) => frequency === value);
}
