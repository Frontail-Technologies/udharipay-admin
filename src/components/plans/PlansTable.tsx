"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/table/DataTable";
import { ManagementToolbar, type ManagementFilterDef } from "@/components/table/ManagementToolbar";
import { RowActionsMenu } from "@/components/table/RowActionsMenu";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { useAdminPlans, useAdminCustomers, useAdminMerchants } from "@/hooks/useAdminEntities";
import type { DerivedPlan, PlanFrequency } from "@/data/admin";
import { planStatusTone, mandateStatusTone } from "@/data/admin/statusTones";
import { formatCompactInr, formatDateShort, humanizeSnakeCase } from "@/lib/format";
import { exportRowsToCsv } from "@/lib/csv";

const STATUS_OPTIONS = ["active", "due", "overdue", "completed"] as const;
const FREQUENCY_OPTIONS: PlanFrequency[] = ["weekly", "monthly"];

export function PlansTable() {
  const plans = useAdminPlans();
  const customers = useAdminCustomers();
  const merchants = useAdminMerchants();
  const router = useRouter();

  const customerById = useMemo(() => new Map(customers.map((customer) => [customer.id, customer])), [customers]);
  const merchantById = useMemo(() => new Map(merchants.map((merchant) => [merchant.id, merchant])), [merchants]);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [merchantFilter, setMerchantFilter] = useState<string>("all");
  const [frequencyFilter, setFrequencyFilter] = useState<string>("all");

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return plans.filter((plan) => {
      if (statusFilter !== "all" && plan.status !== statusFilter) return false;
      if (merchantFilter !== "all" && plan.merchantId !== merchantFilter) return false;
      if (frequencyFilter !== "all" && plan.frequency !== frequencyFilter) return false;
      if (!query) return true;
      const customerName = customerById.get(plan.customerId)?.name.toLowerCase() ?? "";
      return (
        plan.id.toLowerCase().includes(query) ||
        plan.purchaseDescription.toLowerCase().includes(query) ||
        customerName.includes(query)
      );
    });
  }, [plans, search, statusFilter, merchantFilter, frequencyFilter, customerById]);

  const columns = useMemo<ColumnDef<DerivedPlan>[]>(
    () => [
      {
        accessorKey: "id",
        header: "Plan",
        cell: ({ row }) => (
          <div className="min-w-0">
            <p className="truncate font-medium text-text-primary">{row.original.id}</p>
            <p className="truncate text-[11.5px] text-text-muted">{row.original.purchaseDescription}</p>
          </div>
        ),
      },
      {
        id: "customer",
        header: "Customer",
        cell: ({ row }) => {
          const customer = customerById.get(row.original.customerId);
          return (
            <div className="min-w-0">
              <p className="truncate text-text-primary">{customer?.name ?? "—"}</p>
              <p className="truncate text-[11.5px] text-text-muted">{row.original.customerId}</p>
            </div>
          );
        },
      },
      {
        id: "merchant",
        header: "Merchant",
        cell: ({ row }) => {
          const merchant = merchantById.get(row.original.merchantId);
          return (
            <div className="min-w-0">
              <p className="truncate text-text-secondary">{merchant?.businessName ?? "—"}</p>
              <p className="truncate text-[11.5px] text-text-muted">{row.original.merchantId}</p>
            </div>
          );
        },
      },
      {
        accessorKey: "originalAmount",
        header: "Original Udhaar",
        cell: ({ row }) => <span className="tabular-nums">{formatCompactInr(row.original.originalAmount)}</span>,
      },
      {
        accessorKey: "collectedAmount",
        header: "Collected",
        cell: ({ row }) => <span className="tabular-nums">{formatCompactInr(row.original.collectedAmount)}</span>,
      },
      {
        accessorKey: "remainingAmount",
        header: "Outstanding",
        cell: ({ row }) => <span className="tabular-nums">{formatCompactInr(row.original.remainingAmount)}</span>,
      },
      {
        accessorKey: "frequency",
        header: "Frequency",
        cell: ({ row }) => <span className="text-text-secondary capitalize">{row.original.frequency}</span>,
      },
      {
        accessorKey: "nextDueDate",
        header: "Next Due",
        cell: ({ row }) => (
          <span className="text-[12px] text-text-muted">{formatDateShort(row.original.nextDueDate)}</span>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => (
          <StatusBadge tone={planStatusTone[row.original.status]}>{humanizeSnakeCase(row.original.status)}</StatusBadge>
        ),
      },
      {
        id: "mandate",
        header: "Mandate",
        cell: ({ row }) => {
          const customer = customerById.get(row.original.customerId);
          if (!customer) return <span className="text-text-muted">—</span>;
          return (
            <StatusBadge tone={mandateStatusTone[customer.mandateStatus]}>
              {humanizeSnakeCase(customer.mandateStatus)}
            </StatusBadge>
          );
        },
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => (
          <RowActionsMenu
            actions={[
              { label: "View Plan", href: `/plans/${row.original.id}` },
              { label: "View Customer", href: `/customers/${row.original.customerId}` },
              { label: "View Merchant", href: `/merchants/${row.original.merchantId}` },
              { label: "View Payments", href: `/plans/${row.original.id}?tab=payments` },
            ]}
          />
        ),
      },
    ],
    [customerById, merchantById],
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
      id: "merchant",
      label: "Merchant",
      value: merchantFilter,
      onChange: setMerchantFilter,
      triggerClassName: "w-44",
      options: [
        { value: "all", label: "All merchants" },
        ...merchants.map((merchant) => ({ value: merchant.id, label: merchant.businessName })),
      ],
    },
    {
      id: "frequency",
      label: "Frequency",
      value: frequencyFilter,
      onChange: setFrequencyFilter,
      triggerClassName: "w-36",
      options: [
        { value: "all", label: "All frequencies" },
        ...FREQUENCY_OPTIONS.map((frequency) => ({ value: frequency, label: frequency[0].toUpperCase() + frequency.slice(1) })),
      ],
    },
  ];

  return (
    <div className="flex flex-col gap-3">
      <ManagementToolbar
        search={{ value: search, onChange: setSearch, placeholder: "Search plan/customer...", ariaLabel: "Search plans" }}
        filters={filterDefs}
        moreFiltersLabel="More Filters"
        exportAriaLabel="Export udhaar plans"
        onExport={() =>
          exportRowsToCsv("udhaar-plans.csv", filtered, [
            { header: "Plan ID", accessor: (row) => row.id },
            { header: "Customer", accessor: (row) => customerById.get(row.customerId)?.name ?? "" },
            { header: "Merchant", accessor: (row) => merchantById.get(row.merchantId)?.businessName ?? "" },
            { header: "Original Udhaar", accessor: (row) => row.originalAmount },
            { header: "Collected", accessor: (row) => row.collectedAmount },
            { header: "Outstanding", accessor: (row) => row.remainingAmount },
            { header: "Frequency", accessor: (row) => row.frequency },
            { header: "Status", accessor: (row) => humanizeSnakeCase(row.status) },
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
        onRowClick={(row) => router.push(`/plans/${row.id}`)}
        emptyState={<span className="text-[13px] text-text-muted">No plans match these filters.</span>}
      />
    </div>
  );
}
