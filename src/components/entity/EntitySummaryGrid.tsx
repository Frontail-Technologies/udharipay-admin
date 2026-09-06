import { cn } from "@/lib/utils";

export type EntitySummaryItem = {
  label: string;
  value: string;
  emphasis?: "default" | "warning" | "error";
};

const emphasisClass: Record<NonNullable<EntitySummaryItem["emphasis"]>, string> = {
  default: "text-text-primary",
  warning: "text-warning",
  error: "text-error",
};

/**
 * Column count per breakpoint is capped at the actual item count so a
 * short list (e.g. KYC's 4 metrics) never leaves a visibly empty trailing
 * column — but the progression itself (2 -> 3 -> 5) is unchanged, so a
 * full 5-item grid (Merchant/Customer/Employee summaries) looks exactly as
 * before. Tailwind needs literal class strings, so this is a lookup table
 * rather than a computed `grid-cols-${n}` — still fully generic, no
 * consumer-specific CSS.
 */
const GRID_COLS_BY_COUNT: Record<number, string> = {
  1: "grid-cols-1",
  2: "grid-cols-2",
  3: "grid-cols-2 sm:grid-cols-3",
  4: "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4",
};
const DEFAULT_GRID_COLS = "grid-cols-2 sm:grid-cols-3 lg:grid-cols-5";

/**
 * Compact stat strip for detail pages — intentionally smaller than the
 * dashboard's MetricCard (no icon badge, no trend line) since a detail
 * page summary is a secondary reference, not the page's headline content.
 * Uses the same white-surface + border treatment as DetailSection panels
 * (not a muted/recessed surface) so it stays visually distinct from the
 * page background instead of blending into it.
 */
export function EntitySummaryGrid({ items }: { items: EntitySummaryItem[] }) {
  const gridCols = GRID_COLS_BY_COUNT[items.length] ?? DEFAULT_GRID_COLS;

  return (
    <div className={cn("grid gap-2.5", gridCols)}>
      {items.map((item) => (
        <div
          key={item.label}
          className="rounded-xl border border-border bg-surface px-3.5 py-3"
        >
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
