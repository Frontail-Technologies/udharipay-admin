"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { SubscriptionInvoiceType } from "@/api/generated/contracts/billing";
import { SubscriptionInvoiceStatus } from "@/api/generated/common";
import { normalizeApiError } from "@/api/http/errors";
import { useBillingDirectory } from "@/features/billing/hooks/useBilling";
import { invoiceTypeLabels } from "@/features/billing/utils/metadata";
import { InvoiceListTable } from "@/features/billing/components/InvoiceListTable";
import { MerchantSelector } from "@/features/customers/components/MerchantSelector";
import { ManagementToolbar, type ManagementFilterDef } from "@/components/table/ManagementToolbar";
import { Button } from "@/components/ui/button";
import { humanizeSnakeCase } from "@/lib/format";

export function BillingDirectory() {
  const directory = useBillingDirectory();
  const filters: ManagementFilterDef[] = [
    { id: "status", label: "Status", value: directory.status ?? "all", onChange: (value) => directory.replaceState({ merchantId: directory.merchantId, status: value === "all" ? undefined : value, invoiceType: directory.state.invoiceType, dueFrom: directory.dueFrom, dueTo: directory.dueTo, invoiceCursor: undefined }), triggerClassName: "w-36", options: [{ value: "all", label: "All statuses" }, ...Object.values(SubscriptionInvoiceStatus).map((value) => ({ value, label: humanizeSnakeCase(value) }))] },
    { id: "invoiceType", label: "Type", value: directory.invoiceType ?? "all", onChange: (value) => directory.replaceState({ merchantId: directory.merchantId, status: directory.state.status, invoiceType: value === "all" ? undefined : value, dueFrom: directory.dueFrom, dueTo: directory.dueTo, invoiceCursor: undefined }), triggerClassName: "w-36", options: [{ value: "all", label: "All types" }, ...Object.values(SubscriptionInvoiceType).map((value) => ({ value, label: invoiceTypeLabels[value] }))] },
  ];

  return <div className="flex flex-col gap-3">
    <div className="flex flex-wrap items-center gap-2">
      <MerchantSelector merchantId={directory.merchantId} onSelect={(merchantId) => directory.setMerchantId(merchantId)} />
      {directory.merchantId && <Button variant="outline" size="sm" className="h-9" onClick={() => directory.setMerchantId(undefined)}>Clear Merchant</Button>}
    </div>
    <ManagementToolbar filters={filters} />
    {directory.query.isError ? <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-8 text-center text-[13px] text-destructive">{normalizeApiError(directory.query.error).message}</div> : <>
      <InvoiceListTable invoices={directory.invoices} isLoading={directory.query.isPending} showMerchantColumn />
      <div className="flex items-center justify-between"><p className="text-[12px] text-text-muted">{directory.invoices.length} result{directory.invoices.length === 1 ? "" : "s"} on this page</p><div className="flex gap-1.5"><Button variant="outline" size="sm" className="h-8" disabled={!directory.state.invoiceCursor} onClick={directory.goPrevious}><ChevronLeft className="size-3.5" />Previous</Button><Button variant="outline" size="sm" className="h-8" disabled={!directory.nextCursor} onClick={() => directory.nextCursor && directory.goNext(directory.nextCursor)}>Next<ChevronRight className="size-3.5" /></Button></div></div>
    </>}
  </div>;
}
