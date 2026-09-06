"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/table/DataTable";
import { ManagementToolbar, type ManagementFilterDef } from "@/components/table/ManagementToolbar";
import { RowActionsMenu } from "@/components/table/RowActionsMenu";
import { StatusBadge } from "@/components/admin/StatusBadge";
import type { DerivedCustomer } from "@/data/admin";
import { customerStatusTone, mandateStatusTone } from "@/data/admin/statusTones";
import { formatCompactInr, formatDateShort, humanizeSnakeCase } from "@/lib/format";
import { exportRowsToCsv } from "@/lib/csv";
import { useAdminCustomersByMerchant, useAdminMerchants } from "@/hooks/useAdminEntities";

const STATUS_OPTIONS = ["active", "due", "overdue", "completed", "restricted"] as const;
const MANDATE_OPTIONS = ["active", "pending", "failed", "not_set"] as const;

export function CustomersTable({
  merchantId,
  showMerchantColumn = true,
  showLastPaymentColumn = true,
  showToolbar = true,
  pageSize = 8,
}: {
  merchantId?: string;
  showMerchantColumn?: boolean;
  showLastPaymentColumn?: boolean;
  showToolbar?: boolean;
  pageSize?: number;
}) {
  const customers = useAdminCustomersByMerchant(merchantId);
  const allMerchants = useAdminMerchants();
  const merchantNameById = useMemo(
    () => new Map(allMerchants.map((merchant) => [merchant.id, merchant.businessName])),
    [allMerchants],
  );
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [mandateFilter, setMandateFilter] = useState<string>("all");

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return customers.filter((customer) => {
      if (statusFilter !== "all" && customer.status !== statusFilter) return false;
      if (mandateFilter !== "all" && customer.mandateStatus !== mandateFilter) return false;
      if (!query) return true;
      return customer.name.toLowerCase().includes(query) || customer.id.toLowerCase().includes(query);
    });
  }, [customers, search, statusFilter, mandateFilter]);

  const columns = useMemo<ColumnDef<DerivedCustomer>[]>(() => {
    const cols: ColumnDef<DerivedCustomer>[] = [
      {
        accessorKey: "name",
        header: "Customer",
        cell: ({ row }) => (
          <div className="min-w-0">
            <p className="truncate font-medium text-text-primary">{row.original.name}</p>
            <p className="truncate text-[11.5px] text-text-muted">{row.original.id}</p>
          </div>
        ),
      },
    ];

    if (showMerchantColumn) {
      cols.push({
        id: "merchant",
        header: "Merchant",
        cell: ({ row }) => (
          <span className="truncate text-text-secondary">
            {merchantNameById.get(row.original.merchantId) ?? "—"}
          </span>
        ),
      });
    }

    cols.push(
      {
        accessorKey: "phone",
        header: "Mobile",
        cell: ({ row }) => <span className="text-text-secondary">{row.original.phone}</span>,
      },
      {
        accessorKey: "outstanding",
        header: "Outstanding",
        cell: ({ row }) => (
          <span className="tabular-nums">{formatCompactInr(row.original.outstanding)}</span>
        ),
      },
      {
        accessorKey: "activePlanCount",
        header: "Active Plans",
        cell: ({ row }) => <span className="tabular-nums">{row.original.activePlanCount}</span>,
      },
      {
        accessorKey: "nextDueDate",
        header: "Next Due",
        cell: ({ row }) => (
          <span className="text-[12px] text-text-muted">{formatDateShort(row.original.nextDueDate)}</span>
        ),
      },
      {
        accessorKey: "overdueAmount",
        header: "Overdue",
        cell: ({ row }) =>
          row.original.overdueAmount > 0 ? (
            <span className="tabular-nums text-error">{formatCompactInr(row.original.overdueAmount)}</span>
          ) : (
            <span className="text-text-muted">—</span>
          ),
      },
      {
        accessorKey: "mandateStatus",
        header: "Mandate",
        cell: ({ row }) => (
          <StatusBadge tone={mandateStatusTone[row.original.mandateStatus]}>
            {humanizeSnakeCase(row.original.mandateStatus)}
          </StatusBadge>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => (
          <StatusBadge tone={customerStatusTone[row.original.status]}>
            {humanizeSnakeCase(row.original.status)}
          </StatusBadge>
        ),
      },
    );

    if (showLastPaymentColumn) {
      cols.push({
        accessorKey: "lastPaymentDate",
        header: "Last Payment",
        cell: ({ row }) => (
          <span className="text-[12px] text-text-muted">
            {formatDateShort(row.original.lastPaymentDate)}
          </span>
        ),
      });
    }

    cols.push({
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <RowActionsMenu
          actions={[
            { label: "View Details", href: `/customers/${row.original.id}` },
            { label: "View Udhaar Plans", href: `/customers/${row.original.id}?tab=plans` },
            { label: "View Payments", href: `/customers/${row.original.id}?tab=payments` },
          ]}
        />
      ),
    });

    return cols;
  }, [showMerchantColumn, showLastPaymentColumn, merchantNameById]);

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
      id: "mandate",
      label: "Mandate",
      value: mandateFilter,
      onChange: setMandateFilter,
      triggerClassName: "w-36",
      options: [
        { value: "all", label: "All mandates" },
        ...MANDATE_OPTIONS.map((status) => ({ value: status, label: humanizeSnakeCase(status) })),
      ],
    },
  ];

  return (
    <div className="flex flex-col gap-3">
      {showToolbar && (
        <ManagementToolbar
          search={{
            value: search,
            onChange: setSearch,
            placeholder: "Search customers...",
            ariaLabel: "Search customers",
          }}
          filters={filterDefs}
          moreFiltersLabel="More Filters"
          exportAriaLabel="Export customers"
          onExport={() =>
            exportRowsToCsv("customers.csv", filtered, [
              { header: "Customer ID", accessor: (row) => row.id },
              { header: "Name", accessor: (row) => row.name },
              { header: "Merchant", accessor: (row) => merchantNameById.get(row.merchantId) ?? "" },
              { header: "Mobile", accessor: (row) => row.phone },
              { header: "Outstanding", accessor: (row) => row.outstanding },
              { header: "Active Plans", accessor: (row) => row.activePlanCount },
              { header: "Overdue", accessor: (row) => row.overdueAmount },
              { header: "Mandate", accessor: (row) => humanizeSnakeCase(row.mandateStatus) },
              { header: "Status", accessor: (row) => humanizeSnakeCase(row.status) },
            ])
          }
        />
      )}

      <DataTable
        columns={columns}
        data={filtered}
        enablePagination
        pageSize={pageSize}
        stickyHeader
        tableClassName="min-w-[1150px]"
        onRowClick={(row) => router.push(`/customers/${row.id}`)}
        emptyState={
          <span className="text-[13px] text-text-muted">No customers match these filters.</span>
        }
      />
    </div>
  );
}
