"use client";

import { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import type { CanonicalReportColumnsItem, CanonicalReportRowsItem } from "@/api/generated/contracts/reports";
import { formatReportValue } from "@/features/reports/utils/report-values";
import { DataTable } from "@/components/table/DataTable";

export function ReportTable({ columns, rows, isLoading = false }: { columns: CanonicalReportColumnsItem[]; rows: CanonicalReportRowsItem[]; isLoading?: boolean }) {
  const tableColumns = useMemo<ColumnDef<CanonicalReportRowsItem>[]>(() => columns.map((column) => ({
    id: column.key,
    header: column.label,
    accessorFn: (row) => row[column.key],
    cell: ({ row }) => <span className={column.type === "money" || column.type === "count" ? "tabular-nums" : undefined}>{formatReportValue(row.original[column.key], column.type)}</span>,
  })), [columns]);

  return <DataTable
    columns={tableColumns}
    data={rows}
    isLoading={isLoading}
    stickyHeader
    tableClassName="min-w-[1200px]"
    emptyState={<span className="text-[13px] text-text-muted">No report data for the selected filters.</span>}
  />;
}
