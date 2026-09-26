"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { KycSubjectType } from "@/api/generated/common";
import { KycStatus } from "@/api/generated/common";
import { normalizeApiError } from "@/api/http/errors";
import { useKycDirectory } from "@/features/kyc/hooks/useKyc";
import { kycStatusLabels, kycSubjectLabels } from "@/features/kyc/utils/metadata";
import { KycQueueTable } from "@/features/kyc/components/KycQueueTable";
import { ManagementToolbar, type ManagementFilterDef } from "@/components/table/ManagementToolbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function KycDirectory() {
  const directory = useKycDirectory();
  const filters: ManagementFilterDef[] = [
    { id: "subject", label: "Subject Type", value: directory.subjectType ?? "all", onChange: (value) => directory.setFilters({ subjectType: value === "all" ? undefined : value }), triggerClassName: "w-40", options: [{ value: "all", label: "All subject types" }, ...Object.values(KycSubjectType).map((value) => ({ value, label: kycSubjectLabels[value] }))] },
    { id: "status", label: "Status", value: directory.status ?? "all", onChange: (value) => directory.setFilters({ status: value === "all" ? undefined : value }), triggerClassName: "w-44", options: [{ value: "all", label: "All statuses" }, ...Object.values(KycStatus).map((value) => ({ value, label: kycStatusLabels[value] }))] },
  ];
  return <div className="flex flex-col gap-3"><ManagementToolbar search={{ value: directory.state.search ?? "", onChange: (search) => directory.setFilters({ search: search || undefined }), placeholder: "Search subject...", ariaLabel: "Search KYC reviews" }} filters={filters} /><div className="flex flex-wrap items-end gap-2 rounded-lg border border-border bg-surface-muted/30 p-3"><label className="flex flex-col gap-1 text-[11.5px] font-medium text-text-secondary">Submitted from<Input type="date" value={directory.state.submittedFrom ?? ""} onChange={(event) => directory.setFilters({ submittedFrom: event.target.value || undefined })} className="h-8 w-40 bg-surface text-[12.5px]" /></label><label className="flex flex-col gap-1 text-[11.5px] font-medium text-text-secondary">Submitted to<Input type="date" value={directory.state.submittedTo ?? ""} onChange={(event) => directory.setFilters({ submittedTo: event.target.value || undefined })} className="h-8 w-40 bg-surface text-[12.5px]" /></label>{(directory.state.submittedFrom || directory.state.submittedTo) && <Button type="button" variant="ghost" size="sm" className="h-8 text-[12px]" onClick={() => directory.setFilters({ submittedFrom: undefined, submittedTo: undefined })}>Clear dates</Button>}</div>{directory.query.isError ? <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-8 text-center text-[13px] text-destructive">{normalizeApiError(directory.query.error).message}</div> : <><KycQueueTable reviews={directory.reviews} isLoading={directory.query.isPending} /><div className="flex items-center justify-between"><p className="text-[12px] text-text-muted">{directory.reviews.length} result{directory.reviews.length === 1 ? "" : "s"} on this page</p><div className="flex gap-1.5"><Button variant="outline" size="sm" className="h-8" disabled={!directory.hasPrevious} onClick={directory.goPrevious}><ChevronLeft className="size-3.5" />Previous</Button><Button variant="outline" size="sm" className="h-8" disabled={!directory.nextCursor} onClick={() => directory.nextCursor && directory.goNext(directory.nextCursor)}>Next<ChevronRight className="size-3.5" /></Button></div></div></>}</div>;
}
