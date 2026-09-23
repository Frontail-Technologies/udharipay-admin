"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ColumnDef } from "@tanstack/react-table";
import type { SubscriptionInvoice } from "@/api/generated/contracts/billing";
import { invoiceOperationalStatusTone, invoiceTypeLabels } from "@/features/billing/utils/metadata";
import { DataTable } from "@/components/table/DataTable";
import { RowActionsMenu } from "@/components/table/RowActionsMenu";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { formatDateShort, formatPaiseInr, humanizeSnakeCase } from "@/lib/format";
import { formatTimestamp } from "@/shared/utils/date";

export function InvoiceListTable({ invoices, isLoading = false, showMerchantColumn = false }: { invoices: SubscriptionInvoice[]; isLoading?: boolean; showMerchantColumn?: boolean }) {
  const router = useRouter();
  const columns = useMemo<ColumnDef<SubscriptionInvoice>[]>(() => {
    const base: ColumnDef<SubscriptionInvoice>[] = [
      { accessorKey: "publicId", header: "Invoice", cell: ({ row }) => <span className="font-medium text-text-primary">{row.original.publicId}</span> },
      { accessorKey: "type", header: "Type", cell: ({ row }) => <span className="text-text-secondary">{invoiceTypeLabels[row.original.type]}</span> },
      { accessorKey: "amountPaise", header: "Amount", cell: ({ row }) => <span className="tabular-nums">{formatPaiseInr(row.original.amountPaise)}</span> },
      { accessorKey: "operationalStatus", header: "Status", cell: ({ row }) => <StatusBadge tone={invoiceOperationalStatusTone[row.original.operationalStatus] ?? "neutral"}>{humanizeSnakeCase(row.original.operationalStatus)}</StatusBadge> },
      { accessorKey: "dueDate", header: "Due Date", cell: ({ row }) => <span className="text-[12px] text-text-muted">{formatDateShort(row.original.dueDate)}</span> },
      { accessorKey: "paidAt", header: "Paid At", cell: ({ row }) => <span className="text-[12px] text-text-muted">{formatTimestamp(row.original.paidAt)}</span> },
    ];
    if (showMerchantColumn) base.splice(1, 0, { accessorKey: "merchantId", header: "Merchant", cell: ({ row }) => <Link href={`/merchants/${row.original.merchantId}`} onClick={(event) => event.stopPropagation()} className="text-[12.5px] font-medium text-primary hover:underline">View Merchant</Link> });
    base.push({ id: "actions", header: "", cell: ({ row }) => <RowActionsMenu actions={[{ label: "View Invoice", href: `/subscriptions/${row.original.id}` }, { label: "View Merchant", href: `/merchants/${row.original.merchantId}` }]} /> });
    return base;
  }, [showMerchantColumn]);
  return <DataTable columns={columns} data={invoices} isLoading={isLoading} stickyHeader tableClassName="min-w-[900px]" onRowClick={(invoice) => router.push(`/subscriptions/${invoice.id}`)} emptyState={<span className="text-[13px] text-text-muted">No invoices found.</span>} />;
}
