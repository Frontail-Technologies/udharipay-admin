import type { LucideIcon } from "lucide-react";
import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import type { TrendDirection } from "@/data/admin-demo-data";

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
  value: string;
  icon: LucideIcon;
  trendValue: string;
  trendDirection: TrendDirection;
  trendLabel: string;
}) {
  const trend = trendStyles[trendDirection];
  const TrendIcon = trend.icon;

  return (
    <div className="flex h-full min-w-0 flex-col justify-between gap-3 rounded-lg border border-border bg-surface p-4">
      <div className="flex items-start justify-between gap-3">
        <span className="min-w-0 truncate text-[13px] font-medium leading-4 text-text-secondary">
          {label}
        </span>
        <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-primary-muted text-primary">
          <Icon className="size-4" />
        </span>
      </div>
      <p className="text-[26px] font-semibold leading-tight tracking-tight text-text-primary">
        {value}
      </p>
      <div className="flex items-center gap-1 text-[12px] leading-4">
        <span className={cn("flex shrink-0 items-center gap-0.5 font-medium", trend.className)}>
          <TrendIcon className="size-3.5" />
          {trendValue}
        </span>
        <span className="truncate text-text-muted">{trendLabel}</span>
      </div>
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
  value: string;
  icon: LucideIcon;
  tone?: "neutral" | "warning" | "error";
}) {
  const toneClasses: Record<typeof tone, string> = {
    neutral: "bg-surface-muted text-text-secondary",
    warning: "bg-warning/10 text-warning",
    error: "bg-error/10 text-error",
  };

  return (
    <div className="flex h-full min-w-0 items-center gap-3 rounded-lg border border-border bg-surface px-3.5 py-3">
      <span className={cn("flex size-7 shrink-0 items-center justify-center rounded-md", toneClasses[tone])}>
        <Icon className="size-3.5" />
      </span>
      <div className="min-w-0">
        <p className="truncate text-[11.5px] leading-4 text-text-muted">{label}</p>
        <p className="truncate text-[15px] font-semibold leading-5 text-text-primary">{value}</p>
      </div>
    </div>
  );
}
