"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import type { ColumnDef } from "@tanstack/react-table";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { UserStatus } from "@/api/generated/common";
import type { Employee } from "@/api/generated/contracts/employees";
import { normalizeApiError } from "@/api/http/errors";
import { employeeStatusTone } from "@/features/employees/utils/status";
import { useEmployeeDirectory } from "@/features/employees/hooks/useEmployees";
import { DataTable } from "@/components/table/DataTable";
import { ManagementToolbar, type ManagementFilterDef } from "@/components/table/ManagementToolbar";
import { RowActionsMenu } from "@/components/table/RowActionsMenu";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { Button } from "@/components/ui/button";
import { formatDateShort, humanizeSnakeCase } from "@/lib/format";
import { exportRowsToCsv } from "@/lib/csv";

export function EmployeesTable() {
  const router = useRouter();
  const directory = useEmployeeDirectory();
  const { query, employees, nextCursor, state, search, status, replaceState } = directory;

  const columns = useMemo<ColumnDef<Employee>[]>(() => [
    {
      accessorKey: "name",
      header: "Employee",
      cell: ({ row }) => (
        <div className="min-w-0">
          <p className="truncate font-medium text-text-primary">{row.original.name}</p>
          <p className="truncate text-[11.5px] text-text-muted">{row.original.publicId}</p>
        </div>
      ),
    },
    { accessorKey: "email", header: "Email", cell: ({ row }) => <span className="text-text-secondary">{row.original.email ?? "-"}</span> },
    { accessorKey: "phone", header: "Mobile", cell: ({ row }) => <span className="text-text-secondary">{row.original.phone ?? "-"}</span> },
    { accessorKey: "branch", header: "Branch", cell: ({ row }) => <span className="text-text-secondary">{row.original.branch ?? "-"}</span> },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => <StatusBadge tone={employeeStatusTone[row.original.status]}>{humanizeSnakeCase(row.original.status)}</StatusBadge>,
    },
    { accessorKey: "createdAt", header: "Joined", cell: ({ row }) => <span className="text-[12px] text-text-muted">{formatDateShort(row.original.createdAt)}</span> },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => <RowActionsMenu actions={[{ label: "View Details", href: `/employees/${row.original.id}` }]} />,
    },
  ], []);

  const filterDefs: ManagementFilterDef[] = [{
    id: "status",
    label: "Status",
    value: status ?? "all",
    onChange: (value) => replaceState({ search: state.search, status: value === "all" ? undefined : value, cursor: undefined }),
    triggerClassName: "w-36",
    options: [
      { value: "all", label: "All statuses" },
      ...Object.values(UserStatus).map((value) => ({ value, label: humanizeSnakeCase(value) })),
    ],
  }];

  if (query.isError) {
    return <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-8 text-center text-[13px] text-destructive">{normalizeApiError(query.error).message}</div>;
  }

  return (
    <div className="flex flex-col gap-3">
      <ManagementToolbar
        search={{
          value: search,
          onChange: (value) => replaceState({ search: value || undefined, status: state.status, cursor: undefined }),
          placeholder: "Search employees...",
          ariaLabel: "Search employees",
        }}
        filters={filterDefs}
        moreFiltersLabel="More Filters"
        exportAriaLabel="Export employees"
        onExport={() => exportRowsToCsv("employees.csv", employees, [
          { header: "Employee ID", accessor: (row) => row.publicId },
          { header: "Name", accessor: (row) => row.name },
          { header: "Email", accessor: (row) => row.email ?? "" },
          { header: "Mobile", accessor: (row) => row.phone ?? "" },
          { header: "Branch", accessor: (row) => row.branch ?? "" },
          { header: "Status", accessor: (row) => humanizeSnakeCase(row.status) },
        ])}
      />
      <DataTable
        columns={columns}
        data={employees}
        isLoading={query.isPending}
        stickyHeader
        tableClassName="min-w-[900px]"
        onRowClick={(row) => router.push(`/employees/${row.id}`)}
        emptyState={<span className="text-[13px] text-text-muted">No employees match these filters.</span>}
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
