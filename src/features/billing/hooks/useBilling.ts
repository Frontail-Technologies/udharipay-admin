"use client";

import { useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { createMerchantSubscription, getBillingSettings, getMerchantSubscription, getSubscriptionInvoice, listBillingInvoices, listBillingPlans, listMerchantInvoices, updateBillingPlan, updateBillingSettings } from "@/api/generated/billing";
import { SubscriptionInvoiceType, type CreateMerchantSubscriptionBody, type ListBillingInvoicesParams, type ListMerchantInvoicesParams, type UpdateBillingPlanBody, type UpdateBillingSettingsBody } from "@/api/generated/contracts/billing";
import { SubscriptionInvoiceStatus } from "@/api/generated/common";
import { readCursorState, writeCursorState, type CursorState } from "@/shared/utils/url";

const PAGE_SIZE = 25;

export const billingKeys = {
  all: ["billing"] as const,
  invoiceLists: () => [...billingKeys.all, "invoice-list"] as const,
  invoiceList: (params: ListBillingInvoicesParams) => [...billingKeys.invoiceLists(), params] as const,
  invoiceDetails: () => [...billingKeys.all, "invoice-detail"] as const,
  invoiceDetail: (invoiceId: string) => [...billingKeys.invoiceDetails(), invoiceId] as const,
  merchantSubscriptions: () => [...billingKeys.all, "merchant-subscription"] as const,
  merchantSubscription: (merchantId: string) => [...billingKeys.merchantSubscriptions(), merchantId] as const,
  merchantInvoiceLists: (merchantId: string) => [...billingKeys.all, "merchant-invoice-list", merchantId] as const,
  merchantInvoiceList: (merchantId: string, params: ListMerchantInvoicesParams) => [...billingKeys.merchantInvoiceLists(merchantId), params] as const,
  settings: () => [...billingKeys.all, "settings"] as const,
  plans: () => [...billingKeys.all, "plans"] as const,
};

export function useBillingInvoices(params: ListBillingInvoicesParams) {
  return useQuery({ queryKey: billingKeys.invoiceList(params), queryFn: ({ signal }) => listBillingInvoices(params, { signal }) });
}

export function useSubscriptionInvoice(invoiceId: string) {
  return useQuery({ queryKey: billingKeys.invoiceDetail(invoiceId), queryFn: ({ signal }) => getSubscriptionInvoice(invoiceId, { signal }) });
}

export function useMerchantSubscription(merchantId: string) {
  return useQuery({ queryKey: billingKeys.merchantSubscription(merchantId), queryFn: ({ signal }) => getMerchantSubscription(merchantId, { signal }), retry: false });
}

export function useMerchantInvoices(merchantId: string, params: ListMerchantInvoicesParams) {
  return useQuery({ queryKey: billingKeys.merchantInvoiceList(merchantId, params), queryFn: ({ signal }) => listMerchantInvoices(merchantId, params, { signal }) });
}

export function useCreateMerchantSubscription() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ merchantId, input }: { merchantId: string; input: CreateMerchantSubscriptionBody }) => createMerchantSubscription(merchantId, input),
    onSuccess: async (response, variables) => {
      queryClient.setQueryData(billingKeys.merchantSubscription(variables.merchantId), response);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: billingKeys.merchantInvoiceLists(variables.merchantId) }),
        queryClient.invalidateQueries({ queryKey: billingKeys.invoiceLists() }),
      ]);
      toast.success("Subscription created");
    },
  });
}

export function useBillingSettings() {
  return useQuery({ queryKey: billingKeys.settings(), queryFn: ({ signal }) => getBillingSettings({ signal }) });
}

export function useBillingPlans() {
  return useQuery({ queryKey: billingKeys.plans(), queryFn: ({ signal }) => listBillingPlans({ signal }) });
}

export function useUpdateBillingSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateBillingSettingsBody) => updateBillingSettings(input),
    onSuccess: async (response) => {
      queryClient.setQueryData(billingKeys.settings(), response);
      await queryClient.invalidateQueries({ queryKey: billingKeys.settings() });
      toast.success("Billing settings updated");
    },
  });
}

export function useUpdateBillingPlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ planCode, input }: { planCode: string; input: UpdateBillingPlanBody }) => updateBillingPlan(planCode, input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: billingKeys.plans() });
      toast.success("Billing plan updated");
    },
  });
}

export function useBillingDirectory() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const state = readCursorState(new URLSearchParams(searchParams.toString()));
  const status = parseInvoiceStatus(state.status);
  const invoiceType = parseInvoiceType(state.invoiceType);
  const params = useMemo<ListBillingInvoicesParams>(() => ({ limit: PAGE_SIZE, cursor: state.invoiceCursor, status, invoiceType, merchantId: state.merchantId, dueFrom: state.dueFrom, dueTo: state.dueTo }), [invoiceType, state.dueFrom, state.dueTo, state.invoiceCursor, state.merchantId, status]);
  const query = useBillingInvoices(params);
  const replaceState = (next: CursorState) => {
    const queryString = writeCursorState(new URLSearchParams(searchParams.toString()), next);
    router.replace(queryString ? `${pathname}?${queryString}` : pathname, { scroll: false });
  };
  const setMerchantId = (merchantId: string | undefined) => replaceState({ merchantId, status: state.status, invoiceType: state.invoiceType, dueFrom: state.dueFrom, dueTo: state.dueTo, invoiceCursor: undefined });
  const goNext = (invoiceCursor: string) => replaceState({ merchantId: state.merchantId, status: state.status, invoiceType: state.invoiceType, dueFrom: state.dueFrom, dueTo: state.dueTo, invoiceCursor });
  return { query, invoices: query.data?.data.items ?? [], nextCursor: query.data?.data.pagination.nextCursor ?? null, state, status, invoiceType, merchantId: state.merchantId, dueFrom: state.dueFrom, dueTo: state.dueTo, replaceState, setMerchantId, goPrevious: router.back, goNext };
}

export function useMerchantInvoiceHistory(merchantId: string) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const state = readCursorState(new URLSearchParams(searchParams.toString()));
  const query = useMerchantInvoices(merchantId, { limit: PAGE_SIZE, cursor: state.merchantInvoiceCursor });
  const goNext = (merchantInvoiceCursor: string) => {
    const queryString = writeCursorState(new URLSearchParams(searchParams.toString()), { merchantInvoiceCursor });
    router.push(`${pathname}?${queryString}`, { scroll: false });
  };
  return { query, invoices: query.data?.data.items ?? [], nextCursor: query.data?.data.pagination.nextCursor ?? null, hasPrevious: Boolean(state.merchantInvoiceCursor), goPrevious: router.back, goNext };
}

function parseInvoiceStatus(value: string | undefined) {
  return Object.values(SubscriptionInvoiceStatus).find((status) => status === value);
}

function parseInvoiceType(value: string | undefined) {
  return Object.values(SubscriptionInvoiceType).find((type) => type === value);
}
