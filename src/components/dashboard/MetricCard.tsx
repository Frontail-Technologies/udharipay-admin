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

type Tone = "neutral" | "primary" | "warning" | "error";

const iconTone: Record<Tone, string> = {
  neutral: "bg-surface-muted text-text-secondary",
  primary: "bg-primary-muted text-primary",
  warning: "bg-warning/10 text-warning",
  error: "bg-error/10 text-error",
};

/** Compact stat tile: label + small icon on one line, the value under it, and an optional footer line. */
export function MetricCard({
  label,
  value,
  icon: Icon,
  tone = "primary",
  footer,
  trendValue,
  trendDirection,
  trendLabel,
}: {
  label: string;
  value: ReactNode;
  icon: LucideIcon;
  tone?: Tone;
  footer?: ReactNode;
  trendValue?: string;
  trendDirection?: TrendDirection;
  trendLabel?: string;
}) {
  const trend = trendDirection ? trendStyles[trendDirection] : undefined;
  const TrendIcon = trend?.icon;

  return (
    <div className="flex h-full min-w-0 flex-col gap-2 card-surface px-4 py-3.5">
      <div className="flex items-center justify-between gap-2">
        <span className="min-w-0 truncate text-[12.5px] font-medium text-text-secondary">{label}</span>
        <span className={cn("flex size-7 shrink-0 items-center justify-center rounded-lg", iconTone[tone])}>
          <Icon className="size-3.5" />
        </span>
      </div>
      <div className="truncate text-[20px] font-semibold leading-7 tracking-tight tabular-nums text-text-primary">{value}</div>
      {footer ? <div className="text-[11.5px] text-text-muted">{footer}</div> : null}
      {trend && TrendIcon && (
        <div className="flex items-center gap-1 text-[11.5px] leading-4">
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
  icon,
  tone = "neutral",
}: {
  label: string;
  value: ReactNode;
  icon: LucideIcon;
  tone?: "neutral" | "warning" | "error";
}) {
  return <MetricCard label={label} value={value} icon={icon} tone={tone} />;
}
