"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/table/DataTable";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { ComingSoonPanel } from "@/components/entity/EntityTabs";
import type { MandateAttempt } from "@/data/admin";
import { mandateAttemptStatusTone } from "@/data/admin/statusTones";
import { formatCompactInr, formatDate, humanizeSnakeCase } from "@/lib/format";

export function MandateAttemptsTab({ attempts }: { attempts: MandateAttempt[] }) {
  if (attempts.length === 0) {
    return <ComingSoonPanel label="No collection attempts have been made on this mandate yet" />;
  }

  const columns: ColumnDef<MandateAttempt>[] = [
    {
      accessorKey: "attemptedAt",
      header: "Attempted",
      cell: ({ row }) => <span className="text-text-primary">{formatDate(row.original.attemptedAt)}</span>,
    },
    {
      id: "installment",
      header: "Installment",
      cell: ({ row }) => (
        <span className="text-text-secondary">{row.original.installmentId ?? "—"}</span>
      ),
    },
    {
      accessorKey: "amount",
      header: "Amount",
      cell: ({ row }) => (
        <span className="tabular-nums text-text-primary">
          {row.original.amount != null ? formatCompactInr(row.original.amount) : "—"}
        </span>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <StatusBadge tone={mandateAttemptStatusTone[row.original.status]}>
          {humanizeSnakeCase(row.original.status)}
        </StatusBadge>
      ),
    },
    {
      id: "failureReason",
      header: "Failure Reason",
      cell: ({ row }) => (
        <span className="text-text-muted">{row.original.failureReason ?? "—"}</span>
      ),
    },
    {
      id: "reference",
      header: "Reference",
      cell: ({ row }) => (
        <span className="text-[11.5px] text-text-muted">{row.original.providerReferenceMasked ?? "—"}</span>
      ),
    },
  ];

  const sorted = [...attempts].sort((a, b) => (a.attemptedAt < b.attemptedAt ? 1 : -1));

  return <DataTable columns={columns} data={sorted} stickyHeader />;
}
