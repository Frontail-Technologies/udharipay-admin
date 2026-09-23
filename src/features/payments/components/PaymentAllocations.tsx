"use client";

import { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import type { PaymentDetailAllocationsItem } from "@/api/generated/contracts/payments";
import { DataTable } from "@/components/table/DataTable";
import { formatDate, formatPaiseInr } from "@/lib/format";
import { formatPaymentTimestamp } from "@/features/payments/utils/metadata";

export function PaymentAllocations({ allocations }: { allocations: PaymentDetailAllocationsItem[] }) {
  const columns = useMemo<ColumnDef<PaymentDetailAllocationsItem>[]>(() => [
    { accessorKey: "installmentNumber", header: "Installment", cell: ({ row }) => <span className="tabular-nums">#{row.original.installmentNumber}</span> },
    { accessorKey: "installmentId", header: "Installment ID", cell: ({ row }) => <span className="font-mono text-[11.5px] text-text-secondary">{row.original.installmentId}</span> },
    { accessorKey: "dueDate", header: "Due Date", cell: ({ row }) => <span className="text-text-secondary">{formatDate(row.original.dueDate)}</span> },
    { accessorKey: "amountPaise", header: "Allocated Amount", cell: ({ row }) => <span className="tabular-nums">{formatPaiseInr(row.original.amountPaise)}</span> },
    { accessorKey: "createdAt", header: "Allocated At", cell: ({ row }) => <span className="text-[12px] text-text-muted">{formatPaymentTimestamp(row.original.createdAt)}</span> },
  ], []);
  return <DataTable columns={columns} data={allocations} stickyHeader tableClassName="min-w-[820px]" emptyState={<span className="text-[13px] text-text-muted">No allocations recorded for this Payment.</span>} />;
}
