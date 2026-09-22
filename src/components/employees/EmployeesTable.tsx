"use client";

import { useDeferredValue, useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { ColumnDef } from "@tanstack/react-table";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { UserStatus, type UserStatus as UserStatusType } from "@/api/generated/common";
import type { Employee, ListEmployeesParams } from "@/api/generated/contracts/employees";
import { normalizeApiError } from "@/api/http/errors";
import { employeeStatusTone } from "@/features/employees/employeeStatus";
import { useEmployees } from "@/features/employees/useEmployees";
import { DataTable } from "@/components/table/DataTable";
import { ManagementToolbar, type ManagementFilterDef } from "@/components/table/ManagementToolbar";
import { RowActionsMenu } from "@/components/table/RowActionsMenu";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { Button } from "@/components/ui/button";
import { formatDateShort, humanizeSnakeCase } from "@/lib/format";
import { exportRowsToCsv } from "@/lib/csv";
import { readCursorState, writeCursorState } from "@/lib/urlState";

const PAGE_SIZE = 25;

export function EmployeesTable() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const state = readCursorState(new URLSearchParams(searchParams.toString()));
  const search = state.search ?? "";
  const status = employeeStatus(state.status);
  const deferredSearch = useDeferredValue(search);
  const params = useMemo<ListEmployeesParams>(() => ({
    limit: PAGE_SIZE,
    cursor: state.cursor,
    search: deferredSearch || undefined,
    status,
  }), [deferredSearch, state.cursor, status]);
  const query = useEmployees(params);
  const employees = query.data?.data.items ?? [];
  const nextCursor = query.data?.data.pagination.nextCursor ?? null;

  const replaceState = (next: { search?: string; status?: string; cursor?: string }) => {
    const queryString = writeCursorState(new URLSearchParams(searchParams.toString()), next);
    router.replace(queryString ? `${pathname}?${queryString}` : pathname, { scroll: false });
  };

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
          <Button type="button" variant="outline" size="sm" disabled={!state.cursor || query.isFetching} onClick={() => router.back()}>
            <ChevronLeft className="size-3.5" /> Previous
          </Button>
          <Button type="button" variant="outline" size="sm" disabled={!nextCursor || query.isFetching} onClick={() => {
            if (!nextCursor) return;
            const queryString = writeCursorState(new URLSearchParams(searchParams.toString()), { cursor: nextCursor, search: state.search, status: state.status });
            router.push(`${pathname}?${queryString}`, { scroll: false });
          }}>
            Next <ChevronRight className="size-3.5" />
          </Button>
        </div>
      )}
    </div>
  );
}

function employeeStatus(value: string | undefined): UserStatusType | undefined {
  if (value === "active" || value === "inactive" || value === "suspended") return value;
  return undefined;
}
