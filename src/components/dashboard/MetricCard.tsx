import type { LucideIcon } from "lucide-react";
import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export type TrendDirection = "up" | "down" | "flat";

const trendStyles: Record<TrendDirection, { icon: LucideIcon; className: string }> = {
  up: { icon: ArrowUpRight, className: "text-success" },
  down: { icon: ArrowDownRight, className: "text-error" },
  flat: { icon: Minus, className: "text-text-muted" },
};

export function MetricCard({
  label,
  value,
  icon: Icon,
  trendValue,
  trendDirection,
  trendLabel,
}: {
  label: string;
  value: ReactNode;
  icon: LucideIcon;
  trendValue?: string;
  trendDirection?: TrendDirection;
  trendLabel?: string;
}) {
  const trend = trendDirection ? trendStyles[trendDirection] : undefined;
  const TrendIcon = trend?.icon;

  return (
    <div className="flex h-full min-w-0 flex-col justify-between gap-4 card-surface p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <span className="min-w-0 text-[13px] font-medium leading-4 text-text-secondary">
          {label}
        </span>
        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary-muted text-primary">
          <Icon className="size-4" />
        </span>
      </div>
      <div className="text-[26px] font-semibold leading-tight tracking-tight text-text-primary">
        {value}
      </div>
      {trend && TrendIcon && (
        <div className="flex items-center gap-1 text-[12px] leading-4">
          <span className={cn("flex shrink-0 items-center gap-0.5 font-medium", trend.className)}>
            <TrendIcon className="size-3.5" />
            {trendValue}
          </span>
          <span className="truncate text-text-muted">{trendLabel}</span>
        </div>
      )}
    </div>
  );
}

export function SecondaryMetricCard({
  label,
  value,
  icon: Icon,
  tone = "neutral",
}: {
  label: string;
  value: ReactNode;
  icon: LucideIcon;
  tone?: "neutral" | "warning" | "error";
}) {
  const toneClasses: Record<typeof tone, string> = {
    neutral: "bg-surface-muted text-text-secondary",
    warning: "bg-warning/10 text-warning",
    error: "bg-error/10 text-error",
  };

  return (
    <div className="flex h-full min-w-0 flex-col items-start gap-2 card-surface px-3 py-3 sm:flex-row sm:items-center sm:gap-3 sm:px-4 sm:py-3.5">
      <span className={cn("flex size-9 shrink-0 items-center justify-center rounded-full", toneClasses[tone])}>
        <Icon className="size-4" />
      </span>
      <div className="min-w-0">
        <div className="truncate text-[15px] font-semibold leading-6 text-text-primary sm:text-[17px]">{value}</div>
        <p className="text-[11.5px] leading-4 text-text-muted sm:truncate sm:text-[12px]">{label}</p>
      </div>
    </div>
  );
}
