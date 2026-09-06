"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/table/DataTable";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { ComingSoonPanel } from "@/components/entity/EntityTabs";
import type { SubscriptionInvoice } from "@/data/admin";
import { subscriptionInvoiceStatusTone } from "@/data/admin/statusTones";
import { formatCompactInr, formatDate, humanizeSnakeCase } from "@/lib/format";

/**
 * SaaS billing history only — invoices generated purely from
 * subscriptions.ts / subscriptionInvoices.ts, structurally independent of
 * customer collection Payments. Never mix this with Customer Payments.
 */
export function SubscriptionBillingHistoryTab({ invoices }: { invoices: SubscriptionInvoice[] }) {
  if (invoices.length === 0) {
    return <ComingSoonPanel label="No billing history for this subscription yet" />;
  }

  const columns: ColumnDef<SubscriptionInvoice>[] = [
    {
      id: "period",
      header: "Date / Period",
      cell: ({ row }) => (
        <div className="min-w-0">
          <p className="text-text-primary">{formatDate(row.original.dueDate)}</p>
          {row.original.period && <p className="text-[11px] text-text-muted">{row.original.period}</p>}
        </div>
      ),
    },
    {
      accessorKey: "id",
      header: "Invoice",
      cell: ({ row }) => <span className="text-text-secondary">{row.original.id}</span>,
    },
    {
      accessorKey: "type",
      header: "Type",
      cell: ({ row }) => <span className="capitalize text-text-secondary">{humanizeSnakeCase(row.original.type)}</span>,
    },
    {
      accessorKey: "amount",
      header: "Amount",
      cell: ({ row }) => (
        <span className="tabular-nums text-text-primary">{formatCompactInr(row.original.amount)}</span>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <StatusBadge tone={subscriptionInvoiceStatusTone[row.original.status]}>
          {humanizeSnakeCase(row.original.status)}
        </StatusBadge>
      ),
    },
    {
      accessorKey: "paidAt",
      header: "Paid On",
      cell: ({ row }) => <span className="text-[12px] text-text-muted">{formatDate(row.original.paidAt)}</span>,
    },
    {
      accessorKey: "reference",
      header: "Reference",
      cell: ({ row }) => <span className="text-[11.5px] text-text-muted">{row.original.reference ?? "—"}</span>,
    },
  ];

  const sorted = [...invoices].sort((a, b) => (a.dueDate < b.dueDate ? 1 : -1));

  return <DataTable columns={columns} data={sorted} stickyHeader />;
}
