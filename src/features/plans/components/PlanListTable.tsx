"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import type { ColumnDef } from "@tanstack/react-table";
import type { PlanListItem } from "@/api/generated/contracts/plans";
import { planFrequencyLabels, planStatusTone } from "@/features/plans/utils/metadata";
import { DataTable } from "@/components/table/DataTable";
import { RowActionsMenu } from "@/components/table/RowActionsMenu";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { formatDateShort, formatPaiseInr, humanizeSnakeCase } from "@/lib/format";

export function PlanListTable({ plans, isLoading = false }: { plans: PlanListItem[]; isLoading?: boolean }) {
  const router = useRouter();
  const columns = useMemo<ColumnDef<PlanListItem>[]>(() => [
    { accessorKey: "publicId", header: "Plan", cell: ({ row }) => <div className="min-w-0"><p className="truncate font-medium text-text-primary">{row.original.publicId}</p><p className="truncate text-[11.5px] text-text-muted">{row.original.description}</p></div> },
    { accessorKey: "invoiceNumber", header: "Invoice", cell: ({ row }) => <span className="text-text-secondary">{row.original.invoiceNumber ?? "-"}</span> },
    { accessorKey: "originalAmountPaise", header: "Original Udhaar", cell: ({ row }) => <span className="tabular-nums">{formatPaiseInr(row.original.originalAmountPaise)}</span> },
    { accessorKey: "numberOfCollections", header: "Collections", cell: ({ row }) => <span className="tabular-nums">{row.original.numberOfCollections}</span> },
    { accessorKey: "frequency", header: "Frequency", cell: ({ row }) => <span className="text-text-secondary">{planFrequencyLabels[row.original.frequency]}</span> },
    { accessorKey: "startDate", header: "Start Date", cell: ({ row }) => <span className="text-[12px] text-text-muted">{formatDateShort(row.original.startDate)}</span> },
    { accessorKey: "status", header: "Status", cell: ({ row }) => <StatusBadge tone={planStatusTone[row.original.status]}>{humanizeSnakeCase(row.original.status)}</StatusBadge> },
    { id: "actions", header: "", cell: ({ row }) => <RowActionsMenu actions={[{ label: "View Plan", href: `/plans/${row.original.id}` }, { label: "View Customer", href: `/customers/${row.original.customerId}` }, { label: "View Merchant", href: `/merchants/${row.original.merchantId}` }]} /> },
  ], []);
  return <DataTable columns={columns} data={plans} isLoading={isLoading} stickyHeader tableClassName="min-w-[980px]" onRowClick={(plan) => router.push(`/plans/${plan.id}`)} emptyState={<span className="text-[13px] text-text-muted">No plans found for this customer.</span>} />;
}
