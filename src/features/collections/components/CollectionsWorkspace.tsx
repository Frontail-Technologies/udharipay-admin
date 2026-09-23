"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { CollectionState, CollectionTimingState, type CollectionQueueItem } from "@/api/generated/contracts/collections";
import { normalizeApiError } from "@/api/http/errors";
import { useCollectionDirectory } from "@/features/collections/hooks/useCollections";
import { collectionStateLabels, timingStateLabels } from "@/features/collections/utils/metadata";
import { CollectionQueueTable } from "@/features/collections/components/CollectionQueueTable";
import { CollectionWorkspaceSheet } from "@/features/collections/components/CollectionWorkspaceSheet";
import { ManagementToolbar, type ManagementFilterDef } from "@/components/table/ManagementToolbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function CollectionsWorkspace() {
  const directory = useCollectionDirectory();
  const [selected, setSelected] = useState<CollectionQueueItem | null>(null);
  const filters: ManagementFilterDef[] = [
    { id: "state", label: "Collection State", value: directory.collectionState ?? "all", onChange: (value) => directory.setFilters({ collectionState: value === "all" ? undefined : value }), triggerClassName: "w-44", options: [{ value: "all", label: "All collection states" }, ...Object.values(CollectionState).map((value) => ({ value, label: collectionStateLabels[value] }))] },
    { id: "timing", label: "Timing", value: directory.timingState ?? "all", onChange: (value) => directory.setFilters({ timingState: value === "all" ? undefined : value }), triggerClassName: "w-40", options: [{ value: "all", label: "All timing states" }, ...Object.values(CollectionTimingState).map((value) => ({ value, label: timingStateLabels[value] }))] },
    { id: "merchant", label: "Merchant", value: directory.state.merchantId ?? "all", onChange: (value) => directory.setFilters({ merchantId: value === "all" ? undefined : value }), triggerClassName: "w-44", options: [{ value: "all", label: "All merchants" }, ...directory.merchantOptions.map((merchant) => ({ value: merchant.id, label: merchant.businessName }))] },
    { id: "employee", label: "Assigned Employee", value: directory.state.employeeId ?? "all", onChange: (value) => directory.setFilters({ employeeId: value === "all" ? undefined : value }), triggerClassName: "w-44", options: [{ value: "all", label: "All employees" }, ...directory.employeeOptions.map((employee) => ({ value: employee.id, label: employee.name }))] },
  ];

  return <div className="flex flex-col gap-3">
    <ManagementToolbar search={{ value: directory.state.search ?? "", onChange: (search) => directory.setFilters({ search: search || undefined }), placeholder: "Search customer, phone or plan...", ariaLabel: "Search collections" }} filters={filters} />
    <div className="flex flex-wrap items-end gap-2 rounded-lg border border-border bg-surface-muted/30 p-3">
      <label className="flex flex-col gap-1 text-[11.5px] font-medium text-text-secondary">Due from<Input type="date" value={directory.state.dateFrom ?? ""} onChange={(event) => directory.setFilters({ dateFrom: event.target.value || undefined })} className="h-8 w-40 bg-surface text-[12.5px]" /></label>
      <label className="flex flex-col gap-1 text-[11.5px] font-medium text-text-secondary">Due to<Input type="date" value={directory.state.dateTo ?? ""} onChange={(event) => directory.setFilters({ dateTo: event.target.value || undefined })} className="h-8 w-40 bg-surface text-[12.5px]" /></label>
      {(directory.state.dateFrom || directory.state.dateTo) && <Button type="button" variant="ghost" size="sm" className="h-8 text-[12px]" onClick={() => directory.setFilters({ dateFrom: undefined, dateTo: undefined })}>Clear dates</Button>}
    </div>
    {directory.query.isError ? <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-8 text-center text-[13px] text-destructive">{normalizeApiError(directory.query.error).message}</div> : <>
      <CollectionQueueTable rows={directory.rows} isLoading={directory.query.isPending} onSelect={setSelected} />
      <div className="flex items-center justify-between"><p className="text-[12px] text-text-muted">{directory.rows.length} result{directory.rows.length === 1 ? "" : "s"} on this page</p><div className="flex gap-1.5"><Button variant="outline" size="sm" className="h-8" disabled={!directory.hasPrevious} onClick={directory.goPrevious}><ChevronLeft className="size-3.5" />Previous</Button><Button variant="outline" size="sm" className="h-8" disabled={!directory.nextCursor} onClick={() => directory.nextCursor && directory.goNext(directory.nextCursor)}>Next<ChevronRight className="size-3.5" /></Button></div></div>
    </>}
    <CollectionWorkspaceSheet item={selected} onOpenChange={(open) => { if (!open) setSelected(null); }} />
  </div>;
}
