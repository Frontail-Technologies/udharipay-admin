"use client";

import { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import type { CollectionQueueItem } from "@/api/generated/contracts/collections";
import { collectionStateLabels, collectionStateTones, riskSignalLabels, timingContext } from "@/features/collections/utils/metadata";
import { DataTable } from "@/components/table/DataTable";
import { RowActionsMenu } from "@/components/table/RowActionsMenu";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { formatDate, formatPaiseInr } from "@/lib/format";

export function CollectionQueueTable({ rows, isLoading, onSelect }: { rows: CollectionQueueItem[]; isLoading: boolean; onSelect: (item: CollectionQueueItem) => void }) {
  const columns = useMemo<ColumnDef<CollectionQueueItem>[]>(() => [
    { id: "customer", header: "Customer", cell: ({ row }) => <div className="min-w-0"><p className="truncate font-medium text-text-primary">{row.original.customerName}</p><p className="truncate text-[11.5px] text-text-muted">{row.original.customerPublicId} · {row.original.customerPhone}</p></div> },
    { accessorKey: "merchantName", header: "Merchant", cell: ({ row }) => <span className="text-text-secondary">{row.original.merchantName}</span> },
    { accessorKey: "planPublicId", header: "Plan", cell: ({ row }) => <span className="text-text-secondary">{row.original.planPublicId}</span> },
    { accessorKey: "installmentNumber", header: "Installment", cell: ({ row }) => <span className="tabular-nums text-text-secondary">#{row.original.installmentNumber}</span> },
    { accessorKey: "dueDate", header: "Original Due Date", cell: ({ row }) => <span className="text-text-secondary">{formatDate(row.original.dueDate)}</span> },
    { accessorKey: "outstandingAmountPaise", header: "Outstanding", cell: ({ row }) => <span className="font-medium tabular-nums">{formatPaiseInr(row.original.outstandingAmountPaise)}</span> },
    { accessorKey: "daysOverdue", header: "Timing", cell: ({ row }) => <span className={row.original.timingState === "overdue" ? "text-error" : "text-text-secondary"}>{timingContext(row.original.timingState, row.original.daysOverdue)}</span> },
    { accessorKey: "latestFollowUp", header: "Latest Follow-up", cell: ({ row }) => <span className="text-[12px] text-text-secondary">{row.original.latestFollowUp ? row.original.latestFollowUp.note ?? "No note" : "None"}</span> },
    { id: "risk", header: "Risk", cell: ({ row }) => <div className="flex flex-wrap gap-1">{row.original.riskSignals.atRisk ? <StatusBadge tone="warning">At Risk</StatusBadge> : <StatusBadge tone="neutral">No signal</StatusBadge>}{row.original.riskSignals.failedMandateAttempt && <StatusBadge tone="error">{riskSignalLabels.failedMandateAttempt}</StatusBadge>}</div> },
    { accessorKey: "collectionState", header: "State", cell: ({ row }) => <StatusBadge tone={collectionStateTones[row.original.collectionState]}>{collectionStateLabels[row.original.collectionState]}</StatusBadge> },
    { id: "actions", header: "", cell: ({ row }) => <RowActionsMenu actions={[{ label: "View Plan", href: `/plans/${row.original.planId}` }, { label: "View Customer", href: `/customers/${row.original.customerId}` }, { label: "View Merchant", href: `/merchants/${row.original.merchantId}` }]} /> },
  ], []);
  return <DataTable columns={columns} data={rows} isLoading={isLoading} stickyHeader tableClassName="min-w-[1500px]" onRowClick={onSelect} emptyState={<span className="text-[13px] text-text-muted">No collections match these filters.</span>} />;
}
