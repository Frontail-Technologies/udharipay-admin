"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import type { ColumnDef } from "@tanstack/react-table";
import type { Mandate } from "@/api/generated/contracts/mandates";
import {
  mandateMethodLabels,
  mandateStatusTone,
} from "@/features/mandates/utils/metadata";
import { DataTable } from "@/components/table/DataTable";
import { RowActionsMenu } from "@/components/table/RowActionsMenu";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { formatPaiseInr, humanizeSnakeCase } from "@/lib/format";
import { formatTimestamp } from "@/shared/utils/date";

export function MandateListTable({
  mandates,
  isLoading = false,
}: {
  mandates: Mandate[];
  isLoading?: boolean;
}) {
  const router = useRouter();
  const columns = useMemo<ColumnDef<Mandate>[]>(
    () => [
      {
        accessorKey: "publicId",
        header: "Mandate",
        cell: ({ row }) => (
          <div className="min-w-0">
            <p className="truncate font-medium text-text-primary">
              {row.original.publicId}
            </p>
            <p className="truncate text-[11.5px] text-text-muted">
              {row.original.providerReference ?? "No provider reference"}
            </p>
          </div>
        ),
      },
      {
        accessorKey: "method",
        header: "Method",
        cell: ({ row }) => (
          <span className="text-text-secondary">
            {mandateMethodLabels[row.original.method]}
          </span>
        ),
      },
      {
        accessorKey: "planId",
        header: "Scope",
        cell: ({ row }) => (
          <span className="text-text-secondary">
            {row.original.planId ? "Plan-specific" : "Customer-level"}
          </span>
        ),
      },
      {
        accessorKey: "maxAmountPaise",
        header: "Maximum Amount",
        cell: ({ row }) => (
          <span className="tabular-nums">
            {row.original.maxAmountPaise
              ? formatPaiseInr(row.original.maxAmountPaise)
              : "Not set"}
          </span>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => (
          <StatusBadge tone={mandateStatusTone[row.original.status]}>
            {humanizeSnakeCase(row.original.status)}
          </StatusBadge>
        ),
      },
      {
        accessorKey: "provider",
        header: "Provider",
        cell: ({ row }) => (
          <span className="text-text-secondary">
            {row.original.provider ?? "Not provided"}
          </span>
        ),
      },
      {
        accessorKey: "expiresAt",
        header: "Expires",
        cell: ({ row }) => (
          <span className="text-[12px] text-text-muted">
            {formatTimestamp(row.original.expiresAt)}
          </span>
        ),
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => (
          <RowActionsMenu
            actions={[
              { label: "View Mandate", href: `/mandates/${row.original.id}` },
              {
                label: "View Customer",
                href: `/customers/${row.original.customerId}`,
              },
              ...(row.original.planId
                ? [
                    {
                      label: "View Plan",
                      href: `/plans/${row.original.planId}`,
                    },
                  ]
                : []),
            ]}
          />
        ),
      },
    ],
    [],
  );
  return (
    <DataTable
      columns={columns}
      data={mandates}
      isLoading={isLoading}
      stickyHeader
      tableClassName="min-w-[1080px]"
      onRowClick={(mandate) => router.push(`/mandates/${mandate.id}`)}
      emptyState={
        <span className="text-[13px] text-text-muted">
          No mandates found for this Customer.
        </span>
      }
    />
  );
}
