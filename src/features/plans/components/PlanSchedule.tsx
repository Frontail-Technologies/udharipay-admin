"use client";

import { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import type { Installment } from "@/api/generated/contracts/plans";
import { installmentStateTone } from "@/features/plans/utils/metadata";
import { DataTable } from "@/components/table/DataTable";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { formatDate, formatPaiseInr, humanizeSnakeCase } from "@/lib/format";

export function PlanSchedule({ installments }: { installments: Installment[] }) {
  const columns = useMemo<ColumnDef<Installment>[]>(() => [
    { accessorKey: "installmentNumber", header: "Installment", cell: ({ row }) => <span className="tabular-nums">#{row.original.installmentNumber}</span> },
    { accessorKey: "dueDate", header: "Due Date", cell: ({ row }) => <span className="text-text-secondary">{formatDate(row.original.dueDate)}</span> },
    { accessorKey: "amountPaise", header: "Amount", cell: ({ row }) => <span className="tabular-nums">{formatPaiseInr(row.original.amountPaise)}</span> },
    { accessorKey: "paidAmountPaise", header: "Paid", cell: ({ row }) => <span className="tabular-nums">{formatPaiseInr(row.original.paidAmountPaise)}</span> },
    { accessorKey: "outstandingAmountPaise", header: "Outstanding", cell: ({ row }) => <span className="tabular-nums">{formatPaiseInr(row.original.outstandingAmountPaise)}</span> },
    { accessorKey: "displayState", header: "State", cell: ({ row }) => <StatusBadge tone={installmentStateTone[row.original.displayState]}>{humanizeSnakeCase(row.original.displayState)}</StatusBadge> },
  ], []);
  return <DataTable columns={columns} data={installments} stickyHeader tableClassName="min-w-[760px]" emptyState={<span className="text-[13px] text-text-muted">No installment schedule.</span>} />;
}
