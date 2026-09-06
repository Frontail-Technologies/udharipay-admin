"use client";

import { useState } from "react";
import {
  type ColumnDef,
  type SortingState,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { DataTablePagination } from "@/components/table/DataTablePagination";
import { cn } from "@/lib/utils";

/** Shared visual treatment for the Sr. No. column — kept in one place so header/body/skeleton cells never drift apart. */
const SERIAL_COLUMN_WIDTH_CLASS = "w-[56px] min-w-[56px]";

export function DataTable<TData, TValue>({
  columns,
  data,
  isLoading = false,
  emptyState,
  enablePagination = false,
  pageSize = 10,
  className,
  /**
   * A sensible min-width for the actual `<table>` (e.g. `"min-w-[1100px]"`)
   * so narrow viewports scroll the table horizontally instead of crushing
   * every column — set per table based on its own column count/content,
   * never a shared global value.
   */
  tableClassName,
  stickyHeader = false,
  onRowClick,
  /**
   * Every dense admin management/report/detail table shows a leading
   * "Sr. No." column by default — implemented once here rather than in
   * each of the ~20 feature-level table components. The number always
   * reflects the CURRENT rendered position (post filter/sort/pagination),
   * never `row.index` (which TanStack ties to the underlying row model,
   * not the visible position) and never the source data's array index.
   * Opt out only for a genuinely non-tabular DataTable usage.
   */
  showSerialNumber = true,
}: {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  isLoading?: boolean;
  emptyState?: React.ReactNode;
  enablePagination?: boolean;
  pageSize?: number;
  className?: string;
  tableClassName?: string;
  stickyHeader?: boolean;
  onRowClick?: (row: TData) => void;
  showSerialNumber?: boolean;
}) {
  const [sorting, setSorting] = useState<SortingState>([]);

  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    ...(enablePagination
      ? {
          getPaginationRowModel: getPaginationRowModel(),
          initialState: { pagination: { pageSize } },
        }
      : {}),
  });

  // Always safe to read — pagination is a core state slice on every table
  // instance regardless of whether the pagination row model is registered.
  // When `enablePagination` is false, pageIndex stays 0 (nothing can change
  // it), so `pageIndex * pageSize + visibleIndex + 1` correctly reduces to
  // `visibleIndex + 1` without a separate branch.
  const { pageIndex, pageSize: currentPageSize } = table.getState().pagination;
  const serialColumnCount = showSerialNumber ? 1 : 0;

  return (
    <div className={cn("flex flex-col overflow-hidden rounded-lg border border-border bg-surface", className)}>
      <div className="overflow-x-auto overflow-y-visible">
        <Table className={tableClassName}>
          <TableHeader className={cn("bg-table-header", stickyHeader && "sticky top-0 z-10")}>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="hover:bg-transparent">
                {showSerialNumber && (
                  <TableHead
                    className={cn(
                      SERIAL_COLUMN_WIDTH_CLASS,
                      "h-11 px-2 text-center text-[12px] font-semibold text-text-secondary",
                    )}
                  >
                    Sr. No.
                  </TableHead>
                )}
                {headerGroup.headers.map((header) => {
                  const canSort = header.column.getCanSort();
                  const sortDirection = header.column.getIsSorted();

                  return (
                    <TableHead
                      key={header.id}
                      className="h-11 px-3 text-[12px] font-semibold text-text-secondary"
                    >
                      {header.isPlaceholder ? null : canSort ? (
                        <button
                          type="button"
                          onClick={header.column.getToggleSortingHandler()}
                          className="flex items-center gap-1 hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
                        >
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          {sortDirection === "asc" ? (
                            <ArrowUp className="size-3.5" />
                          ) : sortDirection === "desc" ? (
                            <ArrowDown className="size-3.5" />
                          ) : (
                            <ArrowUpDown className="size-3.5 text-text-muted" />
                          )}
                        </button>
                      ) : (
                        flexRender(header.column.columnDef.header, header.getContext())
                      )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, rowIndex) => (
                <TableRow key={rowIndex}>
                  {showSerialNumber && (
                    <TableCell className={cn(SERIAL_COLUMN_WIDTH_CLASS, "h-13 px-2 py-2.5 text-center")}>
                      <Skeleton className="mx-auto h-4 w-4" />
                    </TableCell>
                  )}
                  {columns.map((_, colIndex) => (
                    <TableCell key={colIndex} className="h-13 px-3 py-2.5">
                      <Skeleton className="h-4 w-full max-w-32" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row, visibleIndex) => {
                // The visible row's position — never the sort/filter-agnostic
                // `row.index` TanStack ties to the underlying row model.
                const serial = pageIndex * currentPageSize + visibleIndex + 1;
                return (
                  <TableRow
                    key={row.id}
                    className={cn("hover:bg-table-hover", onRowClick && "cursor-pointer")}
                    onClick={onRowClick ? () => onRowClick(row.original) : undefined}
                    tabIndex={onRowClick ? 0 : undefined}
                    onKeyDown={
                      onRowClick
                        ? (event) => {
                            if (event.key === "Enter" || event.key === " ") {
                              event.preventDefault();
                              onRowClick(row.original);
                            }
                          }
                        : undefined
                    }
                  >
                    {showSerialNumber && (
                      <TableCell
                        className={cn(
                          SERIAL_COLUMN_WIDTH_CLASS,
                          "h-13 px-2 py-2.5 text-center text-[12px] font-medium tabular-nums text-text-muted",
                        )}
                      >
                        {serial}
                      </TableCell>
                    )}
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        className={cn("h-13 px-3 py-2.5 text-[13.5px] text-text-primary")}
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                );
              })
            ) : (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={columns.length + serialColumnCount} className="h-32 text-center">
                  {emptyState ?? (
                    <span className="text-[13px] text-text-muted">No data to display.</span>
                  )}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      {enablePagination && (
        <div className="shrink-0 border-t border-border px-1">
          <DataTablePagination table={table} />
        </div>
      )}
    </div>
  );
}
