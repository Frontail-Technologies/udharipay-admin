"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/table/DataTable";
import { ManagementToolbar, type ManagementFilterDef } from "@/components/table/ManagementToolbar";
import { RowActionsMenu } from "@/components/table/RowActionsMenu";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { useAdminSubscriptions, useAdminMerchants } from "@/hooks/useAdminEntities";
import { subscriptionInvoices } from "@/data/admin";
import type { MerchantSubscription } from "@/data/admin";
import {
  subscriptionOperationalStatusTone,
  activationFeeStatusTone,
  autoPayStatusTone,
} from "@/data/admin/statusTones";
import { formatCompactInr, formatDateShort, humanizeSnakeCase } from "@/lib/format";
import { exportRowsToCsv } from "@/lib/csv";

function lastPaidInvoiceDate(subscriptionId: string): string | null {
  const paid = subscriptionInvoices.filter((inv) => inv.subscriptionId === subscriptionId && inv.status === "paid" && inv.paidAt);
  if (paid.length === 0) return null;
  return paid.reduce((latest, inv) => ((inv.paidAt as string) > latest ? (inv.paidAt as string) : latest), paid[0].paidAt as string);
}

const STATUS_OPTIONS = ["trial", "active", "past_due", "paused", "cancelled", "expired"] as const;

export function SubscriptionsTable() {
  const subscriptions = useAdminSubscriptions();
  const merchants = useAdminMerchants();
  const router = useRouter();

  const merchantById = useMemo(() => new Map(merchants.map((m) => [m.id, m])), [merchants]);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [planFilter, setPlanFilter] = useState<string>("all");

  const planOptions = useMemo(
    () => Array.from(new Set(subscriptions.map((s) => s.planName))).sort(),
    [subscriptions],
  );

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return subscriptions.filter((subscription) => {
      if (statusFilter !== "all" && subscription.status !== statusFilter) return false;
      if (planFilter !== "all" && subscription.planName !== planFilter) return false;
      if (!query) return true;
      const merchantName = merchantById.get(subscription.merchantId)?.businessName.toLowerCase() ?? "";
      return (
        subscription.id.toLowerCase().includes(query) ||
        merchantName.includes(query) ||
        subscription.merchantId.toLowerCase().includes(query)
      );
    });
  }, [subscriptions, search, statusFilter, planFilter, merchantById]);

  const columns = useMemo<ColumnDef<MerchantSubscription>[]>(
    () => [
      {
        id: "merchant",
        header: "Merchant",
        cell: ({ row }) => {
          const merchant = merchantById.get(row.original.merchantId);
          return (
            <div className="min-w-0">
              <p className="truncate font-medium text-text-primary">{merchant?.businessName ?? "—"}</p>
              <p className="truncate text-[11.5px] text-text-muted">{row.original.merchantId}</p>
            </div>
          );
        },
      },
      { accessorKey: "planName", header: "Plan" },
      {
        accessorKey: "monthlyAmount",
        header: "Monthly Fee",
        cell: ({ row }) => (
          <span className="tabular-nums text-text-primary">{formatCompactInr(row.original.monthlyAmount)}</span>
        ),
      },
      {
        accessorKey: "activationFeeStatus",
        header: "Activation Fee",
        cell: ({ row }) => (
          <StatusBadge tone={activationFeeStatusTone[row.original.activationFeeStatus]}>
            {humanizeSnakeCase(row.original.activationFeeStatus)}
          </StatusBadge>
        ),
      },
      {
        accessorKey: "status",
        header: "Subscription",
        cell: ({ row }) => (
          <StatusBadge tone={subscriptionOperationalStatusTone[row.original.status]}>
            {humanizeSnakeCase(row.original.status)}
          </StatusBadge>
        ),
      },
      {
        accessorKey: "autopayStatus",
        header: "AutoPay",
        cell: ({ row }) => (
          <StatusBadge tone={autoPayStatusTone[row.original.autopayStatus]}>
            {humanizeSnakeCase(row.original.autopayStatus)}
          </StatusBadge>
        ),
      },
      {
        accessorKey: "nextBillingDate",
        header: "Next Billing",
        cell: ({ row }) => (
          <span className="text-[12px] text-text-muted">{formatDateShort(row.original.nextBillingDate)}</span>
        ),
      },
      {
        id: "lastPayment",
        header: "Last Payment",
        cell: ({ row }) => (
          <span className="text-[12px] text-text-muted">{formatDateShort(lastPaidInvoiceDate(row.original.id))}</span>
        ),
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => (
          <RowActionsMenu
            actions={[
              { label: "View Subscription", href: `/subscriptions/${row.original.id}` },
              { label: "View Merchant", href: `/merchants/${row.original.merchantId}` },
              { label: "Billing History", href: `/subscriptions/${row.original.id}?tab=billing` },
            ]}
          />
        ),
      },
    ],
    [merchantById],
  );

  const filterDefs: ManagementFilterDef[] = [
    {
      id: "status",
      label: "Status",
      value: statusFilter,
      onChange: setStatusFilter,
      triggerClassName: "w-44",
      options: [
        { value: "all", label: "All statuses" },
        ...STATUS_OPTIONS.map((status) => ({ value: status, label: humanizeSnakeCase(status) })),
      ],
    },
    {
      id: "plan",
      label: "Plan",
      value: planFilter,
      onChange: setPlanFilter,
      triggerClassName: "w-44",
      options: [{ value: "all", label: "All plans" }, ...planOptions.map((plan) => ({ value: plan, label: plan }))],
    },
  ];

  return (
    <div className="flex flex-col gap-3">
      <ManagementToolbar
        search={{
          value: search,
          onChange: setSearch,
          placeholder: "Search merchant/subscription...",
          ariaLabel: "Search subscriptions",
        }}
        filters={filterDefs}
        exportAriaLabel="Export subscriptions"
        onExport={() =>
          exportRowsToCsv("subscriptions.csv", filtered, [
            { header: "Subscription ID", accessor: (row) => row.id },
            { header: "Merchant", accessor: (row) => merchantById.get(row.merchantId)?.businessName ?? "" },
            { header: "Plan", accessor: (row) => row.planName },
            { header: "Monthly Fee", accessor: (row) => row.monthlyAmount },
            { header: "Status", accessor: (row) => humanizeSnakeCase(row.status) },
            { header: "AutoPay", accessor: (row) => humanizeSnakeCase(row.autopayStatus) },
            { header: "Next Billing", accessor: (row) => row.nextBillingDate ?? "" },
          ])
        }
      />

      <DataTable
        columns={columns}
        data={filtered}
        enablePagination
        pageSize={10}
        stickyHeader
        tableClassName="min-w-[1250px]"
        onRowClick={(row) => router.push(`/subscriptions/${row.id}`)}
        emptyState={<span className="text-[13px] text-text-muted">No subscriptions match these filters.</span>}
      />
    </div>
  );
}
