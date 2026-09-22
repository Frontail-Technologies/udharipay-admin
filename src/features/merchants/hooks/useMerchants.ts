"use client";

import { useDeferredValue, useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  assignMerchant,
  createMerchant,
  getMerchant,
  listMerchants,
  provisionMerchantAccount,
  updateMerchant,
} from "@/api/generated/merchants";
import { MerchantStatus } from "@/api/generated/contracts/merchants";
import type {
  AssignMerchantBody,
  CreateMerchantBody,
  ListMerchantsParams,
  Merchant,
  ProvisionMerchantAccountBody,
  UpdateMerchantBody,
} from "@/api/generated/contracts/merchants";
import { normalizeApiError } from "@/api/http/errors";
import { useConfirm } from "@/shared/hooks/useConfirm";
import { readCursorState, writeCursorState, type CursorState } from "@/shared/utils/url";

const PAGE_SIZE = 25;

export const merchantKeys = {
  all: ["merchants"] as const,
  lists: () => [...merchantKeys.all, "list"] as const,
  list: (params: ListMerchantsParams) => [...merchantKeys.lists(), params] as const,
  details: () => [...merchantKeys.all, "detail"] as const,
  detail: (merchantId: string) => [...merchantKeys.details(), merchantId] as const,
};

export function useMerchants(params: ListMerchantsParams) {
  return useQuery({
    queryKey: merchantKeys.list(params),
    queryFn: ({ signal }) => listMerchants(params, { signal }),
  });
}

export function useMerchant(merchantId: string) {
  return useQuery({
    queryKey: merchantKeys.detail(merchantId),
    queryFn: ({ signal }) => getMerchant(merchantId, { signal }),
  });
}

export function useMerchantDirectory() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const state = readCursorState(new URLSearchParams(searchParams.toString()));
  const search = state.search ?? "";
  const status = parseMerchantStatus(state.status);
  const deferredSearch = useDeferredValue(search);
  const params = useMemo<ListMerchantsParams>(() => ({ limit: PAGE_SIZE, cursor: state.cursor, search: deferredSearch || undefined, status, businessCategory: state.category }), [deferredSearch, state.category, state.cursor, status]);
  const query = useMerchants(params);
  const replaceState = (next: CursorState) => {
    const queryString = writeCursorState(new URLSearchParams(searchParams.toString()), next);
    router.replace(queryString ? `${pathname}?${queryString}` : pathname, { scroll: false });
  };
  const goNext = (cursor: string) => {
    const queryString = writeCursorState(new URLSearchParams(searchParams.toString()), { cursor, search: state.search, status: state.status, category: state.category });
    router.push(`${pathname}?${queryString}`, { scroll: false });
  };
  return { query, merchants: query.data?.data.items ?? [], nextCursor: query.data?.data.pagination.nextCursor ?? null, state, search, status, category: state.category, replaceState, goPrevious: router.back, goNext };
}

export function useCreateMerchant() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateMerchantBody) => createMerchant(input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: merchantKeys.lists() });
      toast.success("Merchant created");
    },
  });
}

export function useUpdateMerchant() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ merchantId, input }: { merchantId: string; input: UpdateMerchantBody }) => updateMerchant(merchantId, input),
    onSuccess: async (response, variables) => {
      queryClient.setQueryData(merchantKeys.detail(variables.merchantId), response);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: merchantKeys.lists() }),
        queryClient.invalidateQueries({ queryKey: merchantKeys.detail(variables.merchantId) }),
      ]);
      toast.success(variables.input.status ? "Merchant status updated" : "Merchant details updated");
    },
  });
}

export function useChangeMerchantStatus() {
  const confirm = useConfirm();
  const update = useUpdateMerchant();
  const changeStatus = async (merchant: Merchant, status: MerchantStatus) => {
    if (merchant.status === status || update.isPending) return false;
    if (status === "restricted" || status === "suspended") {
      const approved = await confirm({
        title: status === "suspended" ? "Suspend merchant?" : "Restrict merchant?",
        description: `${merchant.businessName} will move to ${status} status. Merchant account status remains separate.`,
        confirmLabel: status === "suspended" ? "Suspend" : "Restrict",
        destructive: true,
      });
      if (!approved) return false;
    }
    try {
      await update.mutateAsync({ merchantId: merchant.id, input: { status } });
      return true;
    } catch (error) {
      toast.error(normalizeApiError(error).message);
      return false;
    }
  };
  return { changeStatus, isPending: update.isPending };
}

export function useAssignMerchant() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ merchantId, input }: { merchantId: string; input: AssignMerchantBody }) => assignMerchant(merchantId, input),
    onSuccess: async (response, variables) => {
      queryClient.setQueryData(merchantKeys.detail(variables.merchantId), response);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: merchantKeys.lists() }),
        queryClient.invalidateQueries({ queryKey: merchantKeys.detail(variables.merchantId) }),
      ]);
      toast.success(response.data.assignedEmployeeId ? "Merchant assignment updated" : "Merchant unassigned");
    },
  });
}

export function useUnassignMerchant() {
  const confirm = useConfirm();
  const assignment = useAssignMerchant();
  const unassign = async (merchant: Pick<Merchant, "id" | "businessName" | "assignedEmployeeId">) => {
    if (!merchant.assignedEmployeeId || assignment.isPending) return false;
    const approved = await confirm({
      title: "Remove employee assignment?",
      description: `${merchant.businessName} will no longer be assigned to its current employee.`,
      confirmLabel: "Remove assignment",
      destructive: true,
    });
    if (!approved) return false;
    try {
      await assignment.mutateAsync({ merchantId: merchant.id, input: { assignedEmployeeId: null } });
      return true;
    } catch (error) {
      toast.error(normalizeApiError(error).message);
      return false;
    }
  };
  return { unassign, isPending: assignment.isPending };
}

export function useProvisionMerchantAccount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ merchantId, input }: { merchantId: string; input: ProvisionMerchantAccountBody }) => provisionMerchantAccount(merchantId, input),
    onSuccess: async (response, variables) => {
      queryClient.setQueryData(merchantKeys.detail(variables.merchantId), response);
      await queryClient.invalidateQueries({ queryKey: merchantKeys.detail(variables.merchantId) });
      toast.success("Merchant account provisioned");
    },
  });
}

function parseMerchantStatus(value: string | undefined): MerchantStatus | undefined {
  return Object.values(MerchantStatus).find((status) => status === value);
}
