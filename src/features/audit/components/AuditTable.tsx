"use client";

import { useMemo } from "react";
import Link from "next/link";
import type { ColumnDef } from "@tanstack/react-table";
import type { AuditEvent } from "@/api/generated/contracts/audit";
import { auditEntityRoutes, humanizeAuditToken } from "@/features/audit/utils/metadata";
import { DataTable } from "@/components/table/DataTable";
import { formatTimestamp } from "@/shared/utils/date";

export function AuditTable({ events, isLoading = false, onRowClick }: { events: AuditEvent[]; isLoading?: boolean; onRowClick: (event: AuditEvent) => void }) {
  const columns = useMemo<ColumnDef<AuditEvent>[]>(() => [
    { accessorKey: "createdAt", header: "Timestamp", cell: ({ row }) => <span className="text-[12px] text-text-muted">{formatTimestamp(row.original.createdAt)}</span> },
    { accessorKey: "actorUserId", header: "Actor", cell: ({ row }) => <span className="text-text-secondary">{row.original.actorUserId ? `${humanizeAuditToken(row.original.actorRole ?? "user")} · ${row.original.actorUserId.slice(0, 8)}` : "System"}</span> },
    { accessorKey: "action", header: "Action", cell: ({ row }) => <span className="font-medium text-text-primary">{humanizeAuditToken(row.original.action)}</span> },
    { accessorKey: "entityType", header: "Entity", cell: ({ row }) => <EntityCell event={row.original} /> },
  ], []);
  return <DataTable columns={columns} data={events} isLoading={isLoading} stickyHeader tableClassName="min-w-[900px]" onRowClick={onRowClick} emptyState={<span className="text-[13px] text-text-muted">No audit events found for the selected filters.</span>} />;
}

function EntityCell({ event }: { event: AuditEvent }) {
  const route = auditEntityRoutes[event.entityType];
  if (!route) return <span className="text-text-secondary">{humanizeAuditToken(event.entityType)}</span>;
  return <Link href={route.href(event.entityId)} onClick={(clickEvent) => clickEvent.stopPropagation()} className="text-primary hover:underline">{route.label}</Link>;
}
