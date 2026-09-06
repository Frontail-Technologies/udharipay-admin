"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/table/DataTable";
import { ManagementToolbar, type ManagementFilterDef } from "@/components/table/ManagementToolbar";
import { RowActionsMenu } from "@/components/table/RowActionsMenu";
import { StatusBadge } from "@/components/admin/StatusBadge";
import type { DerivedMerchant } from "@/data/admin";
import { merchantStatusTone, kycStatusTone, subscriptionStatusTone } from "@/data/admin/statusTones";
import { formatCompactInr, formatDateShort, humanizeSnakeCase } from "@/lib/format";
import { exportRowsToCsv } from "@/lib/csv";
import { useAdminMerchants } from "@/hooks/useAdminEntities";

const STATUS_OPTIONS = ["active", "restricted", "inactive"] as const;
const KYC_OPTIONS = ["verified", "pending", "action_required", "rejected"] as const;
const SUBSCRIPTION_OPTIONS = ["active", "payment_due", "grace", "restricted"] as const;

export function MerchantsTable({ assignedEmployeeName }: { assignedEmployeeName?: string } = {}) {
  const allMerchants = useAdminMerchants();
  const merchants = useMemo(
    () =>
      assignedEmployeeName
        ? allMerchants.filter((merchant) => merchant.assignedEmployeeName === assignedEmployeeName)
        : allMerchants,
    [allMerchants, assignedEmployeeName],
  );
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [kycFilter, setKycFilter] = useState<string>("all");
  const [subscriptionFilter, setSubscriptionFilter] = useState<string>("all");

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return merchants.filter((merchant) => {
      if (statusFilter !== "all" && merchant.status !== statusFilter) return false;
      if (kycFilter !== "all" && merchant.kycStatus !== kycFilter) return false;
      if (subscriptionFilter !== "all" && merchant.subscriptionStatus !== subscriptionFilter) return false;
      if (!query) return true;
      return (
        merchant.businessName.toLowerCase().includes(query) ||
        merchant.id.toLowerCase().includes(query) ||
        merchant.ownerName.toLowerCase().includes(query)
      );
    });
  }, [merchants, search, statusFilter, kycFilter, subscriptionFilter]);

  const columns = useMemo<ColumnDef<DerivedMerchant>[]>(
    () => [
      {
        accessorKey: "businessName",
        header: "Merchant",
        cell: ({ row }) => (
          <div className="min-w-0">
            <p className="truncate font-medium text-text-primary">{row.original.businessName}</p>
            <p className="truncate text-[11.5px] text-text-muted">{row.original.id}</p>
          </div>
        ),
      },
      {
        id: "owner",
        header: "Owner / Contact",
        cell: ({ row }) => (
          <div className="min-w-0">
            <p className="truncate text-text-primary">{row.original.ownerName}</p>
            <p className="truncate text-[11.5px] text-text-muted">{row.original.phone}</p>
          </div>
        ),
      },
      {
        accessorKey: "customerCount",
        header: "Customers",
        cell: ({ row }) => <span className="tabular-nums">{row.original.customerCount}</span>,
      },
      {
        accessorKey: "outstanding",
        header: "Outstanding",
        cell: ({ row }) => (
          <span className="tabular-nums">{formatCompactInr(row.original.outstanding)}</span>
        ),
      },
      {
        accessorKey: "collectedThisMonth",
        header: "Collected This Month",
        cell: ({ row }) => (
          <span className="tabular-nums">{formatCompactInr(row.original.collectedThisMonth)}</span>
        ),
      },
      {
        accessorKey: "kycStatus",
        header: "KYC",
        cell: ({ row }) => (
          <StatusBadge tone={kycStatusTone[row.original.kycStatus]}>
            {humanizeSnakeCase(row.original.kycStatus)}
          </StatusBadge>
        ),
      },
      {
        accessorKey: "subscriptionStatus",
        header: "Subscription",
        cell: ({ row }) => (
          <StatusBadge tone={subscriptionStatusTone[row.original.subscriptionStatus]}>
            {humanizeSnakeCase(row.original.subscriptionStatus)}
          </StatusBadge>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => (
          <StatusBadge tone={merchantStatusTone[row.original.status]}>
            {humanizeSnakeCase(row.original.status)}
          </StatusBadge>
        ),
      },
      {
        accessorKey: "lastActivityDate",
        header: "Last Activity",
        cell: ({ row }) => (
          <span className="text-[12px] text-text-muted">
            {formatDateShort(row.original.lastActivityDate)}
          </span>
        ),
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => (
          <RowActionsMenu
            actions={[
              { label: "View Details", href: `/merchants/${row.original.id}` },
              { label: "View Customers", href: `/merchants/${row.original.id}?tab=customers` },
              { label: "View Collections", disabled: true },
              { label: "Review KYC", href: `/merchants/${row.original.id}?tab=kyc` },
            ]}
          />
        ),
      },
    ],
    [],
  );

  const filterDefs: ManagementFilterDef[] = [
    {
      id: "status",
      label: "Status",
      value: statusFilter,
      onChange: setStatusFilter,
      triggerClassName: "w-36",
      options: [
        { value: "all", label: "All statuses" },
        ...STATUS_OPTIONS.map((status) => ({ value: status, label: humanizeSnakeCase(status) })),
      ],
    },
    {
      id: "kyc",
      label: "KYC Status",
      value: kycFilter,
      onChange: setKycFilter,
      triggerClassName: "w-40",
      options: [
        { value: "all", label: "All KYC statuses" },
        ...KYC_OPTIONS.map((status) => ({ value: status, label: humanizeSnakeCase(status) })),
      ],
    },
    {
      id: "subscription",
      label: "Subscription",
      value: subscriptionFilter,
      onChange: setSubscriptionFilter,
      triggerClassName: "w-40",
      options: [
        { value: "all", label: "All subscriptions" },
        ...SUBSCRIPTION_OPTIONS.map((status) => ({ value: status, label: humanizeSnakeCase(status) })),
      ],
    },
  ];

  return (
    <div className="flex flex-col gap-3">
      <ManagementToolbar
        search={{ value: search, onChange: setSearch, placeholder: "Search merchants...", ariaLabel: "Search merchants" }}
        filters={filterDefs}
        moreFiltersLabel="More Filters"
        exportAriaLabel="Export merchants"
        onExport={() =>
          exportRowsToCsv("merchants.csv", filtered, [
            { header: "Merchant ID", accessor: (row) => row.id },
            { header: "Business Name", accessor: (row) => row.businessName },
            { header: "Owner", accessor: (row) => row.ownerName },
            { header: "Customers", accessor: (row) => row.customerCount },
            { header: "Outstanding", accessor: (row) => row.outstanding },
            { header: "Collected This Month", accessor: (row) => row.collectedThisMonth },
            { header: "KYC Status", accessor: (row) => humanizeSnakeCase(row.kycStatus) },
            { header: "Subscription", accessor: (row) => humanizeSnakeCase(row.subscriptionStatus) },
            { header: "Status", accessor: (row) => humanizeSnakeCase(row.status) },
          ])
        }
      />

      <DataTable
        columns={columns}
        data={filtered}
        enablePagination
        pageSize={8}
        stickyHeader
        tableClassName="min-w-[1250px]"
        onRowClick={(row) => router.push(`/merchants/${row.id}`)}
        emptyState={
          <span className="text-[13px] text-text-muted">No merchants match these filters.</span>
        }
      />
    </div>
  );
}
