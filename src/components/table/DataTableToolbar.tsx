"use client";

import { Search, SlidersHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function DataTableToolbar({
  searchValue,
  onSearchChange,
  searchPlaceholder = "Search…",
  onFiltersClick,
}: {
  searchValue: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  onFiltersClick?: () => void;
}) {
  return (
    <div className="flex items-center gap-2 pb-3">
      <div className="relative w-full max-w-xs">
        <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-text-muted" />
        <Input
          value={searchValue}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder={searchPlaceholder}
          aria-label={searchPlaceholder}
          className="h-8 pl-8 text-[12.5px]"
        />
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={onFiltersClick}
        className="h-8 gap-1.5 px-2.5 text-[12.5px]"
      >
        <SlidersHorizontal className="size-3.5" />
        Filters
      </Button>
    </div>
  );
}
