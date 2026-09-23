"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { AuditEvent } from "@/api/generated/contracts/audit";
import { normalizeApiError } from "@/api/http/errors";
import { useAuditDirectory } from "@/features/audit/hooks/useAudit";
import { auditEntityRoutes, humanizeAuditToken } from "@/features/audit/utils/metadata";
import { AuditTable } from "@/features/audit/components/AuditTable";
import { AuditDetailSheet } from "@/features/audit/components/AuditDetailSheet";
import { ManagementToolbar, type ManagementFilterDef } from "@/components/table/ManagementToolbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { indiaDateTimeInputToTimestamp } from "@/shared/utils/date";

export function AuditWorkspace() {
  const directory = useAuditDirectory();
  const [selected, setSelected] = useState<AuditEvent | null>(null);
  const { state } = directory;

  const filters: ManagementFilterDef[] = [
    { id: "entityType", label: "Entity Type", value: state.entityType ?? "all", onChange: (value) => directory.setFilters({ entityType: value === "all" ? undefined : value, entityId: undefined }), triggerClassName: "w-40", options: [{ value: "all", label: "All entity types" }, ...Object.keys(auditEntityRoutes).map((value) => ({ value, label: humanizeAuditToken(value) }))] },
  ];

  return <div className="flex flex-col gap-3">
    <div className="flex flex-wrap items-center gap-2">
      <Input value={state.action ?? ""} onChange={(event) => directory.setFilters({ action: event.target.value || undefined })} placeholder="Filter by action" className="h-9 w-48" aria-label="Filter by action" />
      <Input type="date" value={indiaDateToInputValue(state.dateFrom)} onChange={(event) => directory.setFilters({ dateFrom: event.target.value ? indiaDateTimeInputToTimestamp(`${event.target.value}T00:00`) : undefined })} className="h-9 w-40" aria-label="Date from" />
      <Input type="date" value={indiaDateToInputValue(state.dateTo)} onChange={(event) => directory.setFilters({ dateTo: event.target.value ? indiaDateTimeInputToTimestamp(`${event.target.value}T23:59`) : undefined })} className="h-9 w-40" aria-label="Date to" />
    </div>

    <ManagementToolbar filters={filters} />

    {directory.query.isError ? <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-8 text-center text-[13px] text-destructive">{normalizeApiError(directory.query.error).message}</div> : <>
      <AuditTable events={directory.events} isLoading={directory.query.isPending} onRowClick={setSelected} />
      <div className="flex items-center justify-between"><p className="text-[12px] text-text-muted">{directory.events.length} result{directory.events.length === 1 ? "" : "s"} on this page</p><div className="flex gap-1.5"><Button variant="outline" size="sm" className="h-8" disabled={!state.auditCursor} onClick={directory.goPrevious}><ChevronLeft className="size-3.5" />Previous</Button><Button variant="outline" size="sm" className="h-8" disabled={!directory.nextCursor} onClick={() => directory.nextCursor && directory.goNext(directory.nextCursor)}>Next<ChevronRight className="size-3.5" /></Button></div></div>
    </>}

    <AuditDetailSheet event={selected} onOpenChange={(open) => !open && setSelected(null)} />
  </div>;
}

function indiaDateToInputValue(iso: string | undefined) {
  if (!iso) return "";
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date(iso));
}
