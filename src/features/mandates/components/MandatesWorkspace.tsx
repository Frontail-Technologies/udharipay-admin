"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { MandateStatus } from "@/api/generated/contracts/mandates";
import { normalizeApiError } from "@/api/http/errors";
import { useMandateDirectory } from "@/features/mandates/hooks/useMandates";
import { MerchantSelector } from "@/features/customers/components/MerchantSelector";
import { CustomerSelector } from "@/features/plans/components/CustomerSelector";
import { MandateListTable } from "@/features/mandates/components/MandateListTable";
import { ManagementToolbar, type ManagementFilterDef } from "@/components/table/ManagementToolbar";
import { Button } from "@/components/ui/button";
import { humanizeSnakeCase } from "@/lib/format";

export function MandatesWorkspace() {
  const directory = useMandateDirectory();
  const filters: ManagementFilterDef[] = [{ id: "status", label: "Status", value: directory.status ?? "all", onChange: (value) => directory.replaceState({ merchantId: directory.merchantId, customerId: directory.customerId, status: value === "all" ? undefined : value, mandateCursor: undefined }), triggerClassName: "w-44", options: [{ value: "all", label: "All statuses" }, ...Object.values(MandateStatus).map((value) => ({ value, label: humanizeSnakeCase(value) }))] }];
  return <div className="flex flex-col gap-3"><div className="flex flex-wrap items-center gap-2"><MerchantSelector merchantId={directory.merchantId} onSelect={directory.setMerchantId} /><CustomerSelector merchantId={directory.merchantId} customerId={directory.customerId} onSelect={directory.setCustomerId} description="Choose the customer whose mandates you want to view." /></div>{!directory.customerId ? <div className="rounded-lg border border-dashed border-border px-4 py-12 text-center text-[13px] text-text-muted">Select a merchant and customer to view Mandates.</div> : directory.query.isError ? <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-8 text-center text-[13px] text-destructive">{normalizeApiError(directory.query.error).message}</div> : <><ManagementToolbar filters={filters} /><MandateListTable mandates={directory.mandates} isLoading={directory.query.isPending} /><div className="flex items-center justify-between"><p className="text-[12px] text-text-muted">{directory.mandates.length} result{directory.mandates.length === 1 ? "" : "s"} on this page</p><div className="flex gap-1.5"><Button variant="outline" size="sm" className="h-8" disabled={!directory.state.mandateCursor} onClick={directory.goPrevious}><ChevronLeft className="size-3.5" />Previous</Button><Button variant="outline" size="sm" className="h-8" disabled={!directory.nextCursor} onClick={() => directory.nextCursor && directory.goNext(directory.nextCursor)}>Next<ChevronRight className="size-3.5" /></Button></div></div></>}</div>;
}
