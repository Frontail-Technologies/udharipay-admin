import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Canonical dashboard panel: fixed border/radius/padding, a header region
 * that never determines panel height, and a content region that fills
 * whatever height the panel is given (intrinsic on mobile, row-locked on
 * desktop — see chartLayout.ts). Used by every dashboard card (charts,
 * lists, tables) so panel rhythm stays consistent across the grid.
 */
export function ChartCard({
  title,
  subtitle,
  action,
  footer,
  children,
  className,
  contentClassName,
}: {
  title: string;
  subtitle?: ReactNode;
  action?: ReactNode;
  footer?: ReactNode;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
}) {
  return (
    <div
      className={cn(
        "flex h-full min-w-0 flex-col rounded-lg border border-border bg-surface p-4",
        className,
      )}
    >
      <div className="flex shrink-0 flex-wrap items-start justify-between gap-x-3 gap-y-2">
        <div className="min-w-0">
          <h3 className="truncate text-[15px] font-semibold leading-5 text-text-primary">
            {title}
          </h3>
          {subtitle && (
            <div className="mt-0.5 truncate text-[12px] text-text-muted">{subtitle}</div>
          )}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
      {/*
        This must stay `display:flex` — it's what lets a child use
        `flex-1`/`min-h-0` to actually fill the panel (e.g. a chart's plot
        area). Without it, a child's `flex-1` is a no-op (flex utilities
        only affect children of a flex container) and any fallback
        `height:auto` collapses to 0 when its own content tries to size
        itself as a percentage of that auto height (Recharts' `height="100%"`).
        That exact chain is what made Collection Performance render blank.
      */}
      <div className={cn("mt-4 flex min-h-0 flex-1 flex-col", contentClassName)}>
        {children}
      </div>
      {footer && <div className="mt-3 shrink-0">{footer}</div>}
    </div>
  );
}
