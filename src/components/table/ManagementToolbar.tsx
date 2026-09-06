"use client";

import { useState } from "react";
import { Download, Search, SlidersHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

export type ManagementFilterOption = { value: string; label: string };

export type ManagementFilterDef = {
  id: string;
  /** Shown above the control inside the mobile Filter Sheet, and used to build each control's aria-label. */
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: ManagementFilterOption[];
  /** The "no filter selected" sentinel — excluded from the mobile filter count. Defaults to "all". */
  allValue?: string;
  placeholder?: string;
  /** Desktop-only trigger width, e.g. "w-36" — preserves each page's existing per-filter sizing. */
  triggerClassName?: string;
};

/**
 * Shared responsive layout for every management list toolbar (search +
 * Select filters + optional "More Filters" placeholder + Export). The
 * component owns ONLY the responsive layout; each page still owns its own
 * filter state/definitions and passes them in.
 *
 * Desktop (sm+): unchanged inline row — search, every filter Select, the
 * optional disabled "More Filters" placeholder, Export — exactly as every
 * page rendered it before this component existed.
 *
 * Mobile (<sm): full-width search, then a compact "Filters N" / "Export"
 * row. All Select-based filters move into a bottom Sheet instead of
 * wrapping inline. Filters here are already live (each `onChange` commits
 * immediately), so the Sheet footer is "Clear Filters" / "Done", never a
 * fake staged "Apply" state.
 */
export function ManagementToolbar({
  search,
  filters = [],
  moreFiltersLabel,
  onExport,
  exportLabel = "Export",
  exportAriaLabel,
}: {
  search?: { value: string; onChange: (value: string) => void; placeholder: string; ariaLabel: string };
  filters?: ManagementFilterDef[];
  /** Desktop-only disabled placeholder button label (e.g. "More Filters"). Omit to not render one. */
  moreFiltersLabel?: string;
  onExport?: () => void;
  exportLabel?: string;
  exportAriaLabel?: string;
}) {
  const [sheetOpen, setSheetOpen] = useState(false);
  const activeFilterCount = filters.filter((filter) => filter.value !== (filter.allValue ?? "all")).length;

  return (
    <div className="flex flex-col gap-3">
      {/* Desktop — unchanged inline toolbar, hidden below sm. */}
      <div className="hidden flex-wrap items-center gap-2 sm:flex">
        {search && (
          <div className="relative w-full max-w-56">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-text-muted" />
            <Input
              value={search.value}
              onChange={(event) => search.onChange(event.target.value)}
              placeholder={search.placeholder}
              aria-label={search.ariaLabel}
              className="h-8 pl-8 text-[12.5px]"
            />
          </div>
        )}

        {filters.map((filter) => (
          <Select key={filter.id} value={filter.value} onValueChange={filter.onChange}>
            <SelectTrigger
              className={cn("h-8 text-[12.5px]", filter.triggerClassName ?? "w-40")}
              aria-label={`Filter by ${filter.label}`}
            >
              <SelectValue placeholder={filter.placeholder ?? filter.label} />
            </SelectTrigger>
            <SelectContent>
              {filter.options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ))}

        {moreFiltersLabel && (
          <Button variant="outline" size="sm" disabled className="h-8 gap-1.5 text-[12.5px]">
            <SlidersHorizontal className="size-3.5" />
            {moreFiltersLabel}
          </Button>
        )}

        {onExport && (
          <Button
            variant="outline"
            size="sm"
            className="ml-auto h-8 gap-1.5 text-[12.5px]"
            onClick={onExport}
            aria-label={exportAriaLabel ?? exportLabel}
          >
            <Download className="size-3.5" />
            {exportLabel}
          </Button>
        )}
      </div>

      {/* Mobile — full-width search, then a compact Filters/Export row. Hidden at sm+. */}
      <div className="flex flex-col gap-2 sm:hidden">
        {search && (
          <div className="relative w-full">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-text-muted" />
            <Input
              value={search.value}
              onChange={(event) => search.onChange(event.target.value)}
              placeholder={search.placeholder}
              aria-label={search.ariaLabel}
              className="h-10 w-full pl-9 text-[13.5px]"
            />
          </div>
        )}

        <div className="flex items-center gap-2">
          {filters.length > 0 && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-9 gap-1.5 text-[13px]"
              onClick={() => setSheetOpen(true)}
            >
              <SlidersHorizontal className="size-3.5" />
              Filters{activeFilterCount > 0 ? ` ${activeFilterCount}` : ""}
            </Button>
          )}

          {onExport && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className={cn("h-9 gap-1.5 text-[13px]", filters.length > 0 && "ml-auto")}
              onClick={onExport}
              aria-label={exportAriaLabel ?? exportLabel}
            >
              <Download className="size-3.5" />
              {exportLabel}
            </Button>
          )}
        </div>
      </div>

      {filters.length > 0 && (
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetContent side="bottom" className="max-h-[85vh] gap-0 overflow-y-auto rounded-t-xl border-t-0">
            <SheetHeader className="border-b border-border px-4 py-4">
              <SheetTitle className="text-[15px] font-semibold text-text-primary">Filters</SheetTitle>
            </SheetHeader>

            <div className="flex flex-col gap-4 px-4 py-4">
              {filters.map((filter) => (
                <div key={filter.id} className="flex flex-col gap-1.5">
                  <label className="text-[12px] font-medium text-text-secondary">{filter.label}</label>
                  <Select value={filter.value} onValueChange={filter.onChange}>
                    <SelectTrigger className="h-10 w-full text-[13.5px]" aria-label={`Filter by ${filter.label}`}>
                      <SelectValue placeholder={filter.placeholder ?? filter.label} />
                    </SelectTrigger>
                    <SelectContent>
                      {filter.options.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ))}
            </div>

            <SheetFooter className="flex-row gap-2 border-t border-border px-4 py-4">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-10 flex-1 text-[13.5px]"
                onClick={() => {
                  for (const filter of filters) filter.onChange(filter.allValue ?? "all");
                }}
              >
                Clear Filters
              </Button>
              <Button type="button" size="sm" className="h-10 flex-1 text-[13.5px]" onClick={() => setSheetOpen(false)}>
                Done
              </Button>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      )}
    </div>
  );
}
