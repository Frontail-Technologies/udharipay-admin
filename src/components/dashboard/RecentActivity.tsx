"use client";

import { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { ChartCard } from "@/components/dashboard/ChartCard";
import { DataTable } from "@/components/table/DataTable";
import { StatusBadge, type StatusBadgeTone } from "@/components/admin/StatusBadge";
import { recentActivityRows, type RecentActivityRow } from "@/data/admin-demo-data";

const statusTone: Record<RecentActivityRow["status"], StatusBadgeTone> = {
  Collected: "success",
  Due: "warning",
  Overdue: "error",
  Failed: "neutral",
};

export function RecentActivity() {
  const columns = useMemo<ColumnDef<RecentActivityRow>[]>(
    () => [
      { accessorKey: "entity", header: "Entity" },
      { accessorKey: "merchant", header: "Merchant" },
      { accessorKey: "type", header: "Type" },
      {
        accessorKey: "amount",
        header: "Amount",
        cell: ({ row }) => <span className="tabular-nums">{row.original.amount}</span>,
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => (
          <StatusBadge tone={statusTone[row.original.status]}>{row.original.status}</StatusBadge>
        ),
      },
      {
        accessorKey: "time",
        header: "Time",
        cell: ({ row }) => (
          <span className="text-[12px] text-text-muted">{row.original.time}</span>
        ),
      },
    ],
    [],
  );

  return (
    <ChartCard title="Recent Activity" contentClassName="min-h-0">
      {/* Narrow screens: compact stacked rows instead of crushing 6 table columns. */}
      <ul className="flex flex-col divide-y divide-border sm:hidden">
        {recentActivityRows.map((row) => (
          <li key={row.id} className="flex flex-col gap-1 py-2.5">
            <div className="flex items-center justify-between gap-2">
              <span className="truncate text-[13px] font-medium text-text-primary">
                {row.entity}
              </span>
              <StatusBadge tone={statusTone[row.status]}>{row.status}</StatusBadge>
            </div>
            <p className="truncate text-[11.5px] text-text-muted">{row.merchant}</p>
            <div className="flex items-center justify-between gap-2 text-[12px]">
              <span className="font-semibold tabular-nums text-text-primary">{row.amount}</span>
              <span className="text-text-muted">{row.time}</span>
            </div>
          </li>
        ))}
      </ul>

      {/*
        sm and up: dense TanStack table, rendered at its natural height.
        The current 6-row demo dataset never exceeds a reasonable widget
        size, so no internal scroll is forced — DataTable's own
        className/stickyHeader props exist for a future page where a
        management table's row count genuinely needs it.
      */}
      <div className="hidden sm:block">
        <DataTable columns={columns} data={recentActivityRows} />
      </div>
    </ChartCard>
  );
}
