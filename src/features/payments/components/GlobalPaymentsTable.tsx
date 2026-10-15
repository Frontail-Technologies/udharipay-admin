"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import type { ColumnDef } from "@tanstack/react-table";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { GlobalPaymentListItem } from "@/api/generated/contracts/payments";
import { ListAllPaymentsType } from "@/api/generated/contracts/payments";
import { normalizeApiError } from "@/api/http/errors";
import { useGlobalPaymentsDirectory } from "@/features/payments/hooks/usePayments";
import { paymentStatusTone } from "@/features/payments/utils/metadata";
import { DataTable } from "@/components/table/DataTable";
import { ManagementToolbar, type ManagementFilterDef } from "@/components/table/ManagementToolbar";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { Button } from "@/components/ui/button";
import { formatPaiseInr, humanizeSnakeCase } from "@/lib/format";
import { formatIndiaDateFromTimestamp } from "@/shared/utils/date";

const PAYMENT_TYPE_LABELS: Record<string, string> = {
  customer_collection: "Collection",
  merchant_activation_fee: "Activation Fee",
  merchant_subscription: "Subscription",
};

function paymentTypeHref(item: GlobalPaymentListItem): string {
  if (item.type === "customer_collection") return `/payments/${item.id}`;
  if (item.type === "merchant_subscription" || item.type === "merchant_activation_fee") {
    return item.subscriptionId ? `/subscriptions/${item.subscriptionId}` : `/payments/${item.id}`;
  }
  return `/payments/${item.id}`;
}

export function GlobalPaymentsTable() {
  const router = useRouter();
  const directory = useGlobalPaymentsDirectory();
  const { query, payments, nextCursor, state, type, replaceState } = directory;

  const columns = useMemo<ColumnDef<GlobalPaymentListItem>[]>(() => [
    {
      accessorKey: "type",
      header: "Type",
      cell: ({ row }) => <span className="text-[12px] text-text-muted">{PAYMENT_TYPE_LABELS[row.original.type] ?? row.original.type}</span>,
    },
    {
      accessorKey: "amountPaise",
      header: "Amount",
      cell: ({ row }) => <span className="font-medium text-text-primary">{formatPaiseInr(String(row.original.amountPaise))}</span>,
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const tone = paymentStatusTone[row.original.status as keyof typeof paymentStatusTone] ?? "neutral";
        return <StatusBadge tone={tone}>{humanizeSnakeCase(row.original.status)}</StatusBadge>;
      },
    },
    {
      accessorKey: "merchantId",
      header: "Merchant",
      cell: ({ row }) => <span className="font-mono text-[11.5px] text-text-muted">{row.original.merchantId.slice(0, 8)}…</span>,
    },
    {
      accessorKey: "method",
      header: "Method",
      cell: ({ row }) => <span className="text-text-secondary">{row.original.method ? humanizeSnakeCase(row.original.method) : "—"}</span>,
    },
    {
      accessorKey: "paidAt",
      header: "Paid At",
      cell: ({ row }) => <span className="text-[12px] text-text-muted">{row.original.paidAt ? formatIndiaDateFromTimestamp(row.original.paidAt) : "—"}</span>,
    },
    {
      accessorKey: "createdAt",
      header: "Created",
      cell: ({ row }) => <span className="text-[12px] text-text-muted">{formatIndiaDateFromTimestamp(row.original.createdAt)}</span>,
    },
  ], []);

  const filterDefs: ManagementFilterDef[] = [{
    id: "type",
    label: "Type",
    value: type ?? "all",
    onChange: (value) => replaceState({ status: value === "all" ? undefined : value, cursor: undefined }),
    triggerClassName: "w-44",
    options: [
      { value: "all", label: "All types" },
      ...Object.values(ListAllPaymentsType).map((value) => ({ value, label: PAYMENT_TYPE_LABELS[value] ?? value })),
    ],
  }];

  if (query.isError) {
    return <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-8 text-center text-[13px] text-destructive">{normalizeApiError(query.error).message}</div>;
  }

  return (
    <div className="flex flex-col gap-3">
      <ManagementToolbar filters={filterDefs} />
      <DataTable
        columns={columns}
        data={payments}
        isLoading={query.isPending}
        stickyHeader
        tableClassName="min-w-[850px]"
        onRowClick={(row) => router.push(paymentTypeHref(row))}
        emptyState={<span className="text-[13px] text-text-muted">No payments match these filters.</span>}
      />
      {(state.cursor || nextCursor) && (
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" size="sm" disabled={!state.cursor || query.isFetching} onClick={directory.goPrevious}>
            <ChevronLeft className="size-3.5" /> Previous
          </Button>
          <Button type="button" variant="outline" size="sm" disabled={!nextCursor || query.isFetching} onClick={() => { if (nextCursor) directory.goNext(nextCursor); }}>
            Next <ChevronRight className="size-3.5" />
          </Button>
        </div>
      )}
    </div>
  );
}
