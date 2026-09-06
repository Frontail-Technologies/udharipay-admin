import { cn } from "@/lib/utils";
import type { EntitySummaryItem } from "@/components/entity/EntitySummaryGrid";

const emphasisClass: Record<NonNullable<EntitySummaryItem["emphasis"]>, string> = {
  default: "text-text-primary",
  warning: "text-warning",
  error: "text-error",
};

/**
 * Part U — Reports-specific 4-column KPI grid, used ONLY for the Reports
 * Overview's 8-item row (which visually wrapped awkwardly as 5+3 under the
 * shared EntitySummaryGrid's default progression). Deliberately a separate
 * component rather than a change to EntitySummaryGrid itself, so every
 * other 5-item entity summary elsewhere in the app is completely
 * unaffected.
 */
export function ReportsKpiGrid({ items }: { items: EntitySummaryItem[] }) {
  return (
    <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-4">
      {items.map((item) => (
        <div key={item.label} className="rounded-xl border border-border bg-surface px-3.5 py-3">
          <p className="truncate text-[12px] text-text-secondary">{item.label}</p>
          <p
            className={cn(
              "mt-0.5 truncate text-[20px] font-semibold leading-tight",
              emphasisClass[item.emphasis ?? "default"],
            )}
          >
            {item.value}
          </p>
        </div>
      ))}
    </div>
  );
}
