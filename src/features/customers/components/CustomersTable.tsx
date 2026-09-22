"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";
import { CustomerStatus, type Customer } from "@/api/generated/contracts/customers";
import { normalizeApiError } from "@/api/http/errors";
import { useCustomerDirectory } from "@/features/customers/hooks/useCustomers";
import { customerStatusTone } from "@/features/customers/utils/status";
import { DataTable } from "@/components/table/DataTable";
import { ManagementToolbar, type ManagementFilterDef } from "@/components/table/ManagementToolbar";
import { RowActionsMenu } from "@/components/table/RowActionsMenu";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { Button } from "@/components/ui/button";
import { formatDateShort, humanizeSnakeCase } from "@/lib/format";
import { exportRowsToCsv } from "@/lib/csv";

type Directory = ReturnType<typeof useCustomerDirectory>;

export function CustomersTable({ directory }: { directory: Directory }) {
  const router = useRouter();
  const { query, customers, nextCursor, merchantId, state, search, status, replaceState } = directory;
  const columns = useMemo<ColumnDef<Customer>[]>(() => [
    { accessorKey: "name", header: "Customer", cell: ({ row }) => <div className="min-w-0"><p className="truncate font-medium text-text-primary">{row.original.name}</p><p className="truncate text-[11.5px] text-text-muted">{row.original.publicId}</p></div> },
    { accessorKey: "phone", header: "Mobile", cell: ({ row }) => <span className="text-text-secondary">{row.original.phone}</span> },
    { accessorKey: "alternatePhone", header: "Alternate Mobile", cell: ({ row }) => <span className="text-text-secondary">{row.original.alternatePhone ?? "-"}</span> },
    { id: "location", header: "Location", cell: ({ row }) => <span className="text-text-secondary">{row.original.city}, {row.original.state}</span> },
    { accessorKey: "status", header: "Status", cell: ({ row }) => <StatusBadge tone={customerStatusTone[row.original.status]}>{humanizeSnakeCase(row.original.status)}</StatusBadge> },
    { accessorKey: "createdAt", header: "Joined", cell: ({ row }) => <span className="text-[12px] text-text-muted">{formatDateShort(row.original.createdAt)}</span> },
    { id: "actions", header: "", cell: ({ row }) => <RowActionsMenu actions={[{ label: "View Details", href: `/customers/${row.original.id}` }]} /> },
  ], []);
  const filters: ManagementFilterDef[] = [{ id: "status", label: "Status", value: status ?? "all", onChange: (value) => replaceState({ merchantId, search: state.search, status: value === "all" ? undefined : value, cursor: undefined }), triggerClassName: "w-36", options: [{ value: "all", label: "All statuses" }, ...Object.values(CustomerStatus).map((value) => ({ value, label: humanizeSnakeCase(value) }))] }];

  if (!merchantId) return <div className="rounded-lg border border-dashed border-border px-4 py-12 text-center text-[13px] text-text-muted">Select a merchant to view customers.</div>;
  if (query.isError) return <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-8 text-center text-[13px] text-destructive">{normalizeApiError(query.error).message}</div>;

  return <div className="flex flex-col gap-3"><ManagementToolbar search={{ value: search, onChange: (value) => replaceState({ merchantId, search: value || undefined, status: state.status, cursor: undefined }), placeholder: "Search customers...", ariaLabel: "Search customers" }} filters={filters} moreFiltersLabel="More Filters" exportAriaLabel="Export customers" onExport={() => exportRowsToCsv("customers.csv", customers, [
    { header: "Customer ID", accessor: (row) => row.publicId }, { header: "Name", accessor: (row) => row.name }, { header: "Mobile", accessor: (row) => row.phone }, { header: "Alternate Mobile", accessor: (row) => row.alternatePhone ?? "" }, { header: "City", accessor: (row) => row.city }, { header: "State", accessor: (row) => row.state }, { header: "Status", accessor: (row) => humanizeSnakeCase(row.status) },
  ])} /><DataTable columns={columns} data={customers} isLoading={query.isPending} stickyHeader tableClassName="min-w-[960px]" onRowClick={(row) => router.push(`/customers/${row.id}`)} emptyState={<span className="text-[13px] text-text-muted">No customers match these filters.</span>} />{(state.cursor || nextCursor) && <div className="flex justify-end gap-2"><Button type="button" variant="outline" size="sm" disabled={!state.cursor || query.isFetching} onClick={directory.goPrevious}><ChevronLeft className="size-3.5" />Previous</Button><Button type="button" variant="outline" size="sm" disabled={!nextCursor || query.isFetching} onClick={() => { if (nextCursor) directory.goNext(nextCursor); }}>Next<ChevronRight className="size-3.5" /></Button></div>}</div>;
}
