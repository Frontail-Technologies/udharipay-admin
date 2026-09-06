"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/table/DataTable";
import { ManagementToolbar, type ManagementFilterDef } from "@/components/table/ManagementToolbar";
import { RowActionsMenu } from "@/components/table/RowActionsMenu";
import { StatusBadge } from "@/components/admin/StatusBadge";
import type { DerivedEmployee } from "@/data/admin";
import { employeeStatusTone, kycStatusTone } from "@/data/admin/statusTones";
import { formatDateShort, humanizeSnakeCase } from "@/lib/format";
import { exportRowsToCsv } from "@/lib/csv";
import { useAdminEmployees } from "@/hooks/useAdminEntities";

const STATUS_OPTIONS = ["active", "inactive", "suspended"] as const;
const KYC_OPTIONS = ["verified", "pending", "action_required", "rejected"] as const;

export function EmployeesTable() {
  const employees = useAdminEmployees();
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [kycFilter, setKycFilter] = useState<string>("all");

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return employees.filter((employee) => {
      if (statusFilter !== "all" && employee.status !== statusFilter) return false;
      if (kycFilter !== "all" && employee.kycStatus !== kycFilter) return false;
      if (!query) return true;
      return (
        employee.name.toLowerCase().includes(query) ||
        employee.id.toLowerCase().includes(query) ||
        employee.role.toLowerCase().includes(query)
      );
    });
  }, [employees, search, statusFilter, kycFilter]);

  const columns = useMemo<ColumnDef<DerivedEmployee>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Employee",
        cell: ({ row }) => (
          <div className="min-w-0">
            <p className="truncate font-medium text-text-primary">{row.original.name}</p>
            <p className="truncate text-[11.5px] text-text-muted">{row.original.id}</p>
          </div>
        ),
      },
      {
        accessorKey: "phone",
        header: "Mobile",
        cell: ({ row }) => <span className="text-text-secondary">{row.original.phone}</span>,
      },
      {
        accessorKey: "assignedMerchantCount",
        header: "Assigned Merchants",
        cell: ({ row }) => <span className="tabular-nums">{row.original.assignedMerchantCount}</span>,
      },
      {
        accessorKey: "customersOnboarded",
        header: "Customers Onboarded",
        cell: ({ row }) => <span className="tabular-nums">{row.original.customersOnboarded}</span>,
      },
      {
        accessorKey: "collectionsHandled",
        header: "Collections Handled",
        cell: ({ row }) => <span className="tabular-nums">{row.original.collectionsHandled}</span>,
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
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => (
          <StatusBadge tone={employeeStatusTone[row.original.status]}>
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
              { label: "View Details", href: `/employees/${row.original.id}` },
              { label: "View Assigned Merchants", href: `/employees/${row.original.id}?tab=merchants` },
              { label: "View Activity", href: `/employees/${row.original.id}?tab=activity` },
              { label: "Review KYC", href: `/employees/${row.original.id}?tab=kyc` },
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
  ];

  return (
    <div className="flex flex-col gap-3">
      <ManagementToolbar
        search={{ value: search, onChange: setSearch, placeholder: "Search employees...", ariaLabel: "Search employees" }}
        filters={filterDefs}
        moreFiltersLabel="More Filters"
        exportAriaLabel="Export employees"
        onExport={() =>
          exportRowsToCsv("employees.csv", filtered, [
            { header: "Employee ID", accessor: (row) => row.id },
            { header: "Name", accessor: (row) => row.name },
            { header: "Role", accessor: (row) => row.role },
            { header: "Assigned Merchants", accessor: (row) => row.assignedMerchantCount },
            { header: "Customers Onboarded", accessor: (row) => row.customersOnboarded },
            { header: "Collections Handled", accessor: (row) => row.collectionsHandled },
            { header: "KYC Status", accessor: (row) => humanizeSnakeCase(row.kycStatus) },
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
        tableClassName="min-w-[1150px]"
        onRowClick={(row) => router.push(`/employees/${row.id}`)}
        emptyState={<span className="text-[13px] text-text-muted">No employees match these filters.</span>}
      />
    </div>
  );
}
