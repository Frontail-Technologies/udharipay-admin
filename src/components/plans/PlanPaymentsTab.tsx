"use client";

import { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/table/DataTable";
import { StatusBadge } from "@/components/admin/StatusBadge";
import type { Payment } from "@/data/admin";
import { paymentStatusTone } from "@/data/admin/statusTones";
import { formatCompactInr, formatDate, humanizeSnakeCase } from "@/lib/format";

export function PlanPaymentsTab({ payments }: { payments: Payment[] }) {
  const sorted = useMemo(() => [...payments].sort((a, b) => (a.date < b.date ? 1 : -1)), [payments]);

  const columns = useMemo<ColumnDef<Payment>[]>(
    () => [
      {
        accessorKey: "date",
        header: "Date",
        cell: ({ row }) => <span className="text-text-secondary">{formatDate(row.original.date)}</span>,
      },
      {
        accessorKey: "installmentNumber",
        header: "Installment #",
        cell: ({ row }) => <span className="tabular-nums">#{row.original.installmentNumber}</span>,
      },
      {
        accessorKey: "amount",
        header: "Amount",
        cell: ({ row }) => <span className="tabular-nums">{formatCompactInr(row.original.amount)}</span>,
      },
      { accessorKey: "method", header: "Method" },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => (
          <StatusBadge tone={paymentStatusTone[row.original.status]}>
            {humanizeSnakeCase(row.original.status)}
          </StatusBadge>
        ),
      },
      {
        accessorKey: "reference",
        header: "Reference",
        cell: ({ row }) => <span className="text-[12px] text-text-muted">{row.original.reference}</span>,
      },
    ],
    [],
  );

  return (
    <DataTable
      columns={columns}
      data={sorted}
      enablePagination
      pageSize={10}
      stickyHeader
      emptyState={<span className="text-[13px] text-text-muted">No payment history yet.</span>}
    />
  );
}
