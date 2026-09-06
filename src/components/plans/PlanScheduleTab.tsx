"use client";

import { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/table/DataTable";
import { StatusBadge } from "@/components/admin/StatusBadge";
import type { Installment } from "@/data/admin";
import { installmentStatusTone } from "@/data/admin/statusTones";
import { formatCompactInr, formatDate, humanizeSnakeCase } from "@/lib/format";

export function PlanScheduleTab({ installments }: { installments: Installment[] }) {
  const columns = useMemo<ColumnDef<Installment>[]>(
    () => [
      {
        accessorKey: "installmentNumber",
        header: "#",
        cell: ({ row }) => <span className="tabular-nums">{row.original.installmentNumber}</span>,
      },
      {
        accessorKey: "dueDate",
        header: "Due Date",
        cell: ({ row }) => <span className="text-text-secondary">{formatDate(row.original.dueDate)}</span>,
      },
      {
        accessorKey: "amount",
        header: "Amount",
        cell: ({ row }) => <span className="tabular-nums">{formatCompactInr(row.original.amount)}</span>,
      },
      {
        accessorKey: "paidAmount",
        header: "Paid",
        cell: ({ row }) => (
          <span className="tabular-nums">
            {row.original.paidAmount > 0 ? formatCompactInr(row.original.paidAmount) : "—"}
          </span>
        ),
      },
      {
        id: "balance",
        header: "Balance",
        cell: ({ row }) => {
          const balance = row.original.amount - row.original.paidAmount;
          return <span className="tabular-nums">{balance > 0 ? formatCompactInr(balance) : "—"}</span>;
        },
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => (
          <StatusBadge tone={installmentStatusTone[row.original.status]}>
            {humanizeSnakeCase(row.original.status)}
          </StatusBadge>
        ),
      },
      {
        accessorKey: "paidAt",
        header: "Paid On",
        cell: ({ row }) => (
          <span className="text-[12px] text-text-muted">{formatDate(row.original.paidAt)}</span>
        ),
      },
      {
        id: "reference",
        header: "Reference",
        cell: ({ row }) => (
          <span className="text-[12px] text-text-muted">{row.original.paymentId ?? "—"}</span>
        ),
      },
    ],
    [],
  );

  return (
    <DataTable
      columns={columns}
      data={installments}
      enablePagination
      pageSize={12}
      stickyHeader
      emptyState={<span className="text-[13px] text-text-muted">No installment schedule.</span>}
    />
  );
}
