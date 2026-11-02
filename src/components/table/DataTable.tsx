"use client";

import { useState, useSyncExternalStore } from "react";
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
import type { Cell, Table as TanstackTable } from "@tanstack/react-table";

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
  const isPhone = useIsPhone();

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
    <div className={cn("flex flex-col overflow-hidden card-surface", className)}>
      {/* Phones: every row becomes a card (title, status, actions, then label/value lines), so nothing is cut off. */}
      {isPhone ? (
        <MobileRows
          table={table}
          isLoading={isLoading}
          emptyState={emptyState}
          onRowClick={onRowClick}
        />
      ) : null}
      <div className={cn("overflow-x-auto overflow-y-visible", isPhone && "hidden")}>
        <Table className={tableClassName}>
          <TableHeader className={cn("bg-table-header/70", stickyHeader && "sticky top-0 z-10")}>
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

// Below Tailwind's `md` (768px). The server and the first client render use the table, then phones switch to cards.
const PHONE_QUERY = "(max-width: 767px)";

function subscribePhone(onChange: () => void) {
  if (typeof window === "undefined" || !window.matchMedia) return () => {};
  const query = window.matchMedia(PHONE_QUERY);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

function useIsPhone() {
  return useSyncExternalStore(
    subscribePhone,
    () => (typeof window !== "undefined" && window.matchMedia ? window.matchMedia(PHONE_QUERY).matches : false),
    () => false,
  );
}

function headerLabel<TData>(cell: Cell<TData, unknown>) {
  const header = cell.column.columnDef.header;
  return typeof header === "string" ? header : "";
}

/*
 * The phone layout of a DataTable, built from the same columns: the first column is the card title, a "Status" /
 * "State" column sits beside it, the actions column ("actions" id) goes in the corner, and every other labelled
 * column becomes a label/value line. Columns can opt out with `meta: { mobile: false }`.
 */
function MobileRows<TData>({
  table,
  isLoading,
  emptyState,
  onRowClick,
}: {
  table: TanstackTable<TData>;
  isLoading: boolean;
  emptyState?: React.ReactNode;
  onRowClick?: (row: TData) => void;
}) {
  if (isLoading) {
    return (
      <ul className="divide-y divide-border">
        {Array.from({ length: 4 }).map((_, index) => (
          <li key={index} className="flex flex-col gap-2 p-4">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-3 w-56" />
          </li>
        ))}
      </ul>
    );
  }

  const rows = table.getRowModel().rows;
  if (!rows.length) {
    return <div className="px-4 py-10 text-center">{emptyState ?? <span className="text-[13px] text-text-muted">No data to display.</span>}</div>;
  }

  return (
    <ul className="divide-y divide-border">
      {rows.map((row) => {
        const cells = row.getVisibleCells().filter((cell) => (cell.column.columnDef.meta as { mobile?: boolean } | undefined)?.mobile !== false);
        const actions = cells.find((cell) => cell.column.id === "actions");
        const status = cells.find((cell) => /^(status|state)$/i.test(headerLabel(cell)));
        const [title, ...rest] = cells.filter((cell) => cell !== actions && cell !== status);
        const details = rest.filter((cell) => headerLabel(cell));

        return (
          <li
            key={row.id}
            className={cn("flex flex-col gap-3 px-4 py-3.5", onRowClick && "cursor-pointer active:bg-table-hover")}
            onClick={onRowClick ? () => onRowClick(row.original) : undefined}
          >
            <div className="flex items-start gap-3">
              <div className="min-w-0 flex-1 text-[14px] text-text-primary">{title ? flexRender(title.column.columnDef.cell, title.getContext()) : null}</div>
              {status ? <div className="shrink-0">{flexRender(status.column.columnDef.cell, status.getContext())}</div> : null}
              {actions ? (
                <div className="-mr-2 -mt-1 shrink-0" onClick={(event) => event.stopPropagation()}>
                  {flexRender(actions.column.columnDef.cell, actions.getContext())}
                </div>
              ) : null}
            </div>
            {details.length ? (
              <dl className="grid grid-cols-2 gap-x-4 gap-y-2">
                {details.map((cell) => (
                  <div key={cell.id} className="min-w-0">
                    <dt className="text-[11px] text-text-muted">{headerLabel(cell)}</dt>
                    <dd className="min-w-0 truncate text-[13px] text-text-primary">{flexRender(cell.column.columnDef.cell, cell.getContext())}</dd>
                  </div>
                ))}
              </dl>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}
