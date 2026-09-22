"use client";

import { useDeferredValue, useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { createCustomer, getCustomer, listCustomers, updateCustomer } from "@/api/generated/customers";
import { CustomerStatus } from "@/api/generated/contracts/customers";
import type { CreateCustomerBody, Customer, CustomerStatus as CustomerStatusType, ListCustomersParams, UpdateCustomerBody } from "@/api/generated/contracts/customers";
import { normalizeApiError } from "@/api/http/errors";
import { useConfirm } from "@/shared/hooks/useConfirm";
import { readCursorState, writeCursorState, type CursorState } from "@/shared/utils/url";

const PAGE_SIZE = 25;

export const customerKeys = {
  all: ["customers"] as const,
  lists: () => [...customerKeys.all, "list"] as const,
  merchantLists: (merchantId: string) => [...customerKeys.lists(), merchantId] as const,
  list: (merchantId: string, params: ListCustomersParams) => [...customerKeys.merchantLists(merchantId), params] as const,
  details: () => [...customerKeys.all, "detail"] as const,
  detail: (customerId: string) => [...customerKeys.details(), customerId] as const,
};

export function useCustomers(merchantId: string | undefined, params: ListCustomersParams) {
  return useQuery({
    queryKey: customerKeys.list(merchantId ?? "unselected", params),
    queryFn: ({ signal }) => listCustomers(merchantId ?? "", params, { signal }),
    enabled: Boolean(merchantId),
  });
}

export function useCustomer(customerId: string) {
  return useQuery({
    queryKey: customerKeys.detail(customerId),
    queryFn: ({ signal }) => getCustomer(customerId, { signal }),
  });
}

export function useCustomerDirectory() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const state = readCursorState(new URLSearchParams(searchParams.toString()));
  const search = state.search ?? "";
  const status = parseCustomerStatus(state.status);
  const deferredSearch = useDeferredValue(search);
  const params = useMemo<ListCustomersParams>(() => ({ limit: PAGE_SIZE, cursor: state.cursor, search: deferredSearch || undefined, status }), [deferredSearch, state.cursor, status]);
  const query = useCustomers(state.merchantId, params);
  const replaceState = (next: CursorState) => {
    const queryString = writeCursorState(new URLSearchParams(searchParams.toString()), next);
    router.replace(queryString ? `${pathname}?${queryString}` : pathname, { scroll: false });
  };
  const setMerchantId = (merchantId: string) => replaceState({ merchantId, search: undefined, status: undefined, cursor: undefined });
  const goNext = (cursor: string) => {
    const queryString = writeCursorState(new URLSearchParams(searchParams.toString()), { cursor, merchantId: state.merchantId, search: state.search, status: state.status });
    router.push(`${pathname}?${queryString}`, { scroll: false });
  };
  return { query, customers: query.data?.data.items ?? [], nextCursor: query.data?.data.pagination.nextCursor ?? null, merchantId: state.merchantId, state, search, status, replaceState, setMerchantId, goPrevious: router.back, goNext };
}

export function useCreateCustomer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ merchantId, input }: { merchantId: string; input: CreateCustomerBody }) => createCustomer(merchantId, input),
    onSuccess: async (_, variables) => {
      await queryClient.invalidateQueries({ queryKey: customerKeys.merchantLists(variables.merchantId) });
      toast.success("Customer created");
    },
  });
}

export function useUpdateCustomer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ customerId, input }: { customerId: string; merchantId: string; input: UpdateCustomerBody }) => updateCustomer(customerId, input),
    onSuccess: async (response, variables) => {
      queryClient.setQueryData(customerKeys.detail(variables.customerId), response);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: customerKeys.merchantLists(variables.merchantId) }),
        queryClient.invalidateQueries({ queryKey: customerKeys.detail(variables.customerId) }),
      ]);
      toast.success(variables.input.status ? "Customer status updated" : "Customer details updated");
    },
  });
}

export function useChangeCustomerStatus() {
  const confirm = useConfirm();
  const update = useUpdateCustomer();
  const changeStatus = async (customer: Customer, status: CustomerStatusType) => {
    if (customer.status === status || update.isPending) return false;
    if (status === "blocked") {
      const approved = await confirm({ title: "Block customer?", description: `${customer.name} will be marked as blocked for this merchant.`, confirmLabel: "Block", destructive: true });
      if (!approved) return false;
    }
    try {
      await update.mutateAsync({ customerId: customer.id, merchantId: customer.merchantId, input: { status } });
      return true;
    } catch (error) {
      toast.error(normalizeApiError(error).message);
      return false;
    }
  };
  return { changeStatus, isPending: update.isPending };
}

function parseCustomerStatus(value: string | undefined): CustomerStatusType | undefined {
  return Object.values(CustomerStatus).find((status) => status === value);
}
