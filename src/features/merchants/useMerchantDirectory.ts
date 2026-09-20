"use client";

import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { assignMerchant, listMerchants } from "@/api/generated/merchants/merchants";
import type { ListMerchantsParams, MerchantListItem } from "@/api/generated/udhariPayAPI.schemas";
import type { DerivedMerchant } from "@/data/admin";
import { useAdminMerchants } from "@/hooks/useAdminEntities";
import { useConfirm } from "@/components/feedback/ConfirmProvider";
import { normalizeApiError } from "@/api/http/errors";

export type MerchantDirectoryItem = DerivedMerchant & { apiId?: string; displayId: string };

export const merchantKeys = {
  all: ["merchants"] as const,
  list: (filters: ListMerchantsParams) => [...merchantKeys.all, "list", filters] as const,
};

export function useMerchantDirectory(input: { cursor?: string; search?: string }) {
  const demo = useAdminMerchants();
  const filters = { limit: 50, cursor: input.cursor, search: input.search || undefined };
  const query = useQuery({ queryKey: merchantKeys.list(filters), queryFn: ({ signal }) => listMerchants(filters, { signal }) });
  const merchants = useMemo(() => {
    if (!query.data) return demo.map((merchant) => ({ ...merchant, displayId: merchant.id }));
    return query.data.data.items.map((merchant) => adaptMerchant(merchant, demo));
  }, [demo, query.data]);
  return { merchants, nextCursor: query.data?.data.pagination.nextCursor ?? null, isLoading: query.isLoading, isDemoFallback: !query.data };
}

export function useUnassignMerchant() {
  const confirm = useConfirm();
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: ({ merchantId, assignedEmployeeId }: { merchantId: string; assignedEmployeeId: string | null }) =>
      assignMerchant(merchantId, { assignedEmployeeId }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: merchantKeys.all });
      toast.success("Merchant assignment updated");
    },
    onError: (error) => toast.error(normalizeApiError(error).message),
  });
  const unassign = async (merchant: MerchantDirectoryItem) => {
    if (!merchant.apiId || mutation.isPending) return;
    const approved = await confirm({ title: "Remove employee assignment?", description: `${merchant.businessName} will no longer be assigned to its current employee.`, confirmLabel: "Remove assignment", destructive: true });
    if (approved) await mutation.mutateAsync({ merchantId: merchant.apiId, assignedEmployeeId: null });
  };
  return { unassign, isPending: mutation.isPending };
}

export function adaptMerchant(item: MerchantListItem, demo: DerivedMerchant[]): MerchantDirectoryItem {
  const existing = demo.find((merchant) => merchant.id === item.publicId);
  if (existing) {
    return {
      ...existing,
      apiId: item.id,
      displayId: item.publicId,
      businessName: item.businessName,
      ownerName: item.ownerName,
      businessCategory: item.businessCategory,
      phone: item.phone,
      email: item.email ?? "",
      status: mapStatus(item.status),
      joinedAt: item.createdAt.slice(0, 10),
      lastActivityDate: item.createdAt.slice(0, 10),
    };
  }
  return {
    id: item.publicId,
    apiId: item.id,
    displayId: item.publicId,
    businessName: item.businessName,
    businessCategory: item.businessCategory,
    ownerName: item.ownerName,
    phone: item.phone,
    email: item.email ?? "",
    address: { line1: "", city: item.city, state: item.state, pincode: "" },
    bank: { accountHolderName: item.ownerName, accountMasked: "—", ifsc: "—", bankName: "—", verified: false },
    status: mapStatus(item.status),
    kycStatus: "pending",
    kycLastReviewedAt: item.createdAt.slice(0, 10),
    businessPanMasked: "—",
    gstMasked: "—",
    ownerIdVerified: false,
    subscriptionStatus: "payment_due",
    subscriptionPlan: "—",
    activationFeeStatus: "pending",
    autoPayStatus: "not_set",
    nextDebitDate: null,
    assignedEmployeeName: "Unassigned",
    branchCount: 1,
    joinedAt: item.createdAt.slice(0, 10),
    customerCount: 0,
    activeCustomerCount: 0,
    outstanding: 0,
    overdueAmount: 0,
    dueToday: 0,
    collectedThisMonth: 0,
    collectionRate: 0,
    activePlans: 0,
    lastActivityDate: item.createdAt.slice(0, 10),
  };
}

function mapStatus(status: string): DerivedMerchant["status"] {
  if (status === "active") return "active";
  if (["restricted", "suspended", "payment_due", "grace"].includes(status)) return "restricted";
  return "inactive";
}
