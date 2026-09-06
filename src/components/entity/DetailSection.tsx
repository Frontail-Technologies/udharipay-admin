import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Compact titled section for detail-page content (Business Profile,
 * Collection Health, ...). Sizes to its content — no min-height — and
 * fills its grid cell equal-height with siblings via `h-full` when placed
 * in a `lg:items-stretch` grid row.
 */
export function DetailSection({
  title,
  description,
  action,
  children,
  className,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex h-full flex-col rounded-[11px] border border-border bg-surface p-4", className)}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-[13.5px] font-semibold text-text-primary">{title}</h3>
          {description && <p className="mt-0.5 text-[11.5px] text-text-muted">{description}</p>}
        </div>
        {action}
      </div>
      <div className="mt-3 flex-1">{children}</div>
    </div>
  );
}
