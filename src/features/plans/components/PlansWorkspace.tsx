"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { PlanFrequency } from "@/api/generated/common";
import { PlanStatus } from "@/api/generated/contracts/plans";
import { normalizeApiError } from "@/api/http/errors";
import { usePlanDirectory } from "@/features/plans/hooks/usePlans";
import { planFrequencyLabels } from "@/features/plans/utils/metadata";
import { MerchantSelector } from "@/features/customers/components/MerchantSelector";
import { CustomerSelector } from "@/features/plans/components/CustomerSelector";
import { CreatePlanDialog } from "@/features/plans/components/CreatePlanDialog";
import { PlanListTable } from "@/features/plans/components/PlanListTable";
import { ManagementToolbar, type ManagementFilterDef } from "@/components/table/ManagementToolbar";
import { Button } from "@/components/ui/button";
import { humanizeSnakeCase } from "@/lib/format";

export function PlansWorkspace() {
  const directory = usePlanDirectory();
  const filters: ManagementFilterDef[] = [
    { id: "status", label: "Status", value: directory.status ?? "all", onChange: (value) => directory.replaceState({ merchantId: directory.merchantId, customerId: directory.customerId, status: value === "all" ? undefined : value, frequency: directory.state.frequency, cursor: undefined }), triggerClassName: "w-36", options: [{ value: "all", label: "All statuses" }, ...Object.values(PlanStatus).map((value) => ({ value, label: humanizeSnakeCase(value) }))] },
    { id: "frequency", label: "Frequency", value: directory.frequency ?? "all", onChange: (value) => directory.replaceState({ merchantId: directory.merchantId, customerId: directory.customerId, status: directory.state.status, frequency: value === "all" ? undefined : value, cursor: undefined }), triggerClassName: "w-36", options: [{ value: "all", label: "All frequencies" }, ...Object.values(PlanFrequency).map((value) => ({ value, label: planFrequencyLabels[value] }))] },
  ];
  return <div className="flex flex-col gap-3">
    <div className="flex flex-wrap items-center justify-between gap-3"><div className="flex flex-wrap items-center gap-2"><MerchantSelector merchantId={directory.merchantId} onSelect={directory.setMerchantId} /><CustomerSelector merchantId={directory.merchantId} customerId={directory.customerId} onSelect={directory.setCustomerId} /></div>{directory.customerId && <CreatePlanDialog customerId={directory.customerId} />}</div>
    {!directory.customerId ? <div className="rounded-lg border border-dashed border-border px-4 py-12 text-center text-[13px] text-text-muted">Select a merchant and customer to view Udhaar Plans.</div> : directory.query.isError ? <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-8 text-center text-[13px] text-destructive">{normalizeApiError(directory.query.error).message}</div> : <><ManagementToolbar filters={filters} /><PlanListTable plans={directory.plans} isLoading={directory.query.isPending} /><div className="flex items-center justify-between"><p className="text-[12px] text-text-muted">{directory.plans.length} result{directory.plans.length === 1 ? "" : "s"} on this page</p><div className="flex gap-1.5"><Button variant="outline" size="sm" className="h-8" disabled={!directory.state.cursor} onClick={directory.goPrevious}><ChevronLeft className="size-3.5" />Previous</Button><Button variant="outline" size="sm" className="h-8" disabled={!directory.nextCursor} onClick={() => directory.nextCursor && directory.goNext(directory.nextCursor)}>Next<ChevronRight className="size-3.5" /></Button></div></div></>}
  </div>;
}
