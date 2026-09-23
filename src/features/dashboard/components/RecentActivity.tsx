"use client";

import { useMemo } from "react";
import Link from "next/link";
import type { ColumnDef } from "@tanstack/react-table";
import type { AuditEvent } from "@/api/generated/contracts/audit";
import { normalizeApiError } from "@/api/http/errors";
import { auditEntityRoutes, humanizeAuditToken } from "@/features/audit/utils/metadata";
import type { useDashboard } from "@/features/dashboard/hooks/useDashboard";
import { ChartCard } from "@/components/dashboard/ChartCard";
import { DataTable } from "@/components/table/DataTable";
import { formatTimestamp } from "@/shared/utils/date";

export function RecentActivity({ dashboard }: { dashboard: ReturnType<typeof useDashboard> }) {
  const events = dashboard.activity.data?.data.items ?? [];
  const columns = useMemo<ColumnDef<AuditEvent>[]>(() => [
    { accessorKey: "action", header: "Action", cell: ({ row }) => <span className="font-medium text-text-primary">{humanizeAuditToken(row.original.action)}</span> },
    { accessorKey: "entityType", header: "Entity", cell: ({ row }) => <EntityCell event={row.original} /> },
    { accessorKey: "createdAt", header: "Time", cell: ({ row }) => <span className="text-[12px] text-text-muted">{formatTimestamp(row.original.createdAt)}</span> },
  ], []);

  return <ChartCard title="Recent Activity" contentClassName="min-h-0">
    {dashboard.activity.isError ? <p className="text-[12.5px] text-destructive">{normalizeApiError(dashboard.activity.error).message}</p> : <DataTable columns={columns} data={events} isLoading={dashboard.activity.isPending} emptyState={<span className="text-[13px] text-text-muted">No recent activity.</span>} showSerialNumber={false} />}
  </ChartCard>;
}

function EntityCell({ event }: { event: AuditEvent }) {
  const route = auditEntityRoutes[event.entityType];
  if (!route) return <span className="text-text-secondary">{humanizeAuditToken(event.entityType)}</span>;
  return <Link href={route.href(event.entityId)} onClick={(clickEvent) => clickEvent.stopPropagation()} className="text-primary hover:underline">{route.label}</Link>;
}
