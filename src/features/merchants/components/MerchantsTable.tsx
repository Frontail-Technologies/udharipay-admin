"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";
import { MerchantStatus, type MerchantListItem } from "@/api/generated/contracts/merchants";
import { normalizeApiError } from "@/api/http/errors";
import { merchantStatusTone } from "@/features/merchants/utils/status";
import { BUSINESS_CATEGORIES } from "@/features/merchants/utils/options";
import { useMerchantDirectory } from "@/features/merchants/hooks/useMerchants";
import { DataTable } from "@/components/table/DataTable";
import { ManagementToolbar, type ManagementFilterDef } from "@/components/table/ManagementToolbar";
import { RowActionsMenu } from "@/components/table/RowActionsMenu";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { Button } from "@/components/ui/button";
import { humanizeSnakeCase } from "@/lib/format";
import { formatIndiaDateFromTimestamp } from "@/shared/utils/date";
import { exportRowsToCsv } from "@/lib/csv";

export function MerchantsTable() {
  const router = useRouter();
  const directory = useMerchantDirectory();
  const { query, merchants, nextCursor, state, search, status, category, replaceState } = directory;

  const columns = useMemo<ColumnDef<MerchantListItem>[]>(() => [
    { accessorKey: "businessName", header: "Merchant", cell: ({ row }) => <div className="min-w-0"><p className="truncate font-medium text-text-primary">{row.original.businessName}</p><p className="truncate text-[11.5px] text-text-muted">{row.original.publicId}</p></div> },
    { id: "owner", header: "Owner / Contact", cell: ({ row }) => <div className="min-w-0"><p className="truncate text-text-primary">{row.original.ownerName}</p><p className="truncate text-[11.5px] text-text-muted">{row.original.phone}</p></div> },
    { accessorKey: "businessCategory", header: "Category", cell: ({ row }) => <span className="text-text-secondary">{row.original.businessCategory}</span> },
    { id: "location", header: "Location", cell: ({ row }) => <span className="text-text-secondary">{row.original.city}, {row.original.state}</span> },
    { accessorKey: "status", header: "Status", cell: ({ row }) => <StatusBadge tone={merchantStatusTone[row.original.status]}>{humanizeSnakeCase(row.original.status)}</StatusBadge> },
    { accessorKey: "createdAt", header: "Joined", cell: ({ row }) => <span className="text-[12px] text-text-muted">{formatIndiaDateFromTimestamp(row.original.createdAt)}</span> },
    { id: "actions", header: "", cell: ({ row }) => <RowActionsMenu actions={[{ label: "View Details", href: `/merchants/${row.original.id}` }]} /> },
  ], []);

  const filterDefs: ManagementFilterDef[] = [
    { id: "status", label: "Status", value: status ?? "all", onChange: (value) => replaceState({ search: state.search, category: state.category, status: value === "all" ? undefined : value, cursor: undefined }), triggerClassName: "w-36", options: [{ value: "all", label: "All statuses" }, ...Object.values(MerchantStatus).map((value) => ({ value, label: humanizeSnakeCase(value) }))] },
    { id: "category", label: "Category", value: category ?? "all", onChange: (value) => replaceState({ search: state.search, status: state.status, category: value === "all" ? undefined : value, cursor: undefined }), triggerClassName: "w-52", options: [{ value: "all", label: "All categories" }, ...BUSINESS_CATEGORIES.map((value) => ({ value, label: value }))] },
  ];

  if (query.isError) return <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-8 text-center text-[13px] text-destructive">{normalizeApiError(query.error).message}</div>;

  return (
    <div className="flex flex-col gap-3">
      <ManagementToolbar search={{ value: search, onChange: (value) => replaceState({ search: value || undefined, status: state.status, category: state.category, cursor: undefined }), placeholder: "Search merchants...", ariaLabel: "Search merchants" }} filters={filterDefs} exportAriaLabel="Export merchants" onExport={() => exportRowsToCsv("merchants.csv", merchants, [
        { header: "Merchant ID", accessor: (row) => row.publicId },
        { header: "Business Name", accessor: (row) => row.businessName },
        { header: "Owner", accessor: (row) => row.ownerName },
        { header: "Mobile", accessor: (row) => row.phone },
        { header: "Category", accessor: (row) => row.businessCategory },
        { header: "City", accessor: (row) => row.city },
        { header: "State", accessor: (row) => row.state },
        { header: "Status", accessor: (row) => humanizeSnakeCase(row.status) },
      ])} />
      <DataTable columns={columns} data={merchants} isLoading={query.isPending} stickyHeader tableClassName="min-w-[980px]" onRowClick={(row) => router.push(`/merchants/${row.id}`)} emptyState={<span className="text-[13px] text-text-muted">No merchants match these filters.</span>} />
      {(state.cursor || nextCursor) && <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" size="sm" disabled={!state.cursor || query.isFetching} onClick={directory.goPrevious}><ChevronLeft className="size-3.5" /> Previous</Button>
        <Button type="button" variant="outline" size="sm" disabled={!nextCursor || query.isFetching} onClick={() => { if (nextCursor) directory.goNext(nextCursor); }}>Next <ChevronRight className="size-3.5" /></Button>
      </div>}
    </div>
  );
}
