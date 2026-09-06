"use client";

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ChartCard } from "@/components/dashboard/ChartCard";
import { CHART_AREA_HEIGHT_CLASS } from "@/components/dashboard/chartLayout";
import { formatCompactInr } from "@/lib/format";

export type ReportTrendSeries = {
  key: string;
  name: string;
  /** CSS var, e.g. "var(--success)". */
  color: string;
};

/**
 * Generic 1-2 series compact trend panel reused across Reports (Collections
 * Performance, Mandate Attempt Success) — one implementation, so every
 * trend chart in this module keeps the same visual language (subtle grid,
 * rounded area fill, ₹/count-formatted axes, strong tooltip) the Dashboard
 * already established, rather than each tab building its own.
 */
export function ReportTrendChart<T extends Record<string, unknown>>({
  title,
  subtitle,
  data,
  series,
  valueFormatter = formatCompactInr,
  emptyLabel = "No data for this period.",
}: {
  title: string;
  subtitle?: string;
  data: T[];
  series: ReportTrendSeries[];
  valueFormatter?: (value: number) => string;
  emptyLabel?: string;
}) {
  return (
    <ChartCard title={title} subtitle={subtitle}>
      {data.length === 0 ? (
        <div className="flex h-full min-h-[180px] items-center justify-center rounded-lg border border-dashed border-border-strong bg-surface-muted/40">
          <p className="text-[12.5px] text-text-muted">{emptyLabel}</p>
        </div>
      ) : (
        <div className={CHART_AREA_HEIGHT_CLASS}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 8, right: 4, left: -16, bottom: 0 }}>
              <defs>
                {series.map((s) => (
                  <linearGradient key={s.key} id={`reportFill-${s.key}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={s.color} stopOpacity={0.28} />
                    <stop offset="100%" stopColor={s.color} stopOpacity={0} />
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid vertical={false} stroke="var(--border)" strokeOpacity={0.5} strokeDasharray="3 3" />
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={false}
                interval="preserveStartEnd"
                minTickGap={20}
                tick={{ fontSize: 11, fill: "var(--text-muted)" }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickFormatter={valueFormatter}
                tick={{ fontSize: 11, fill: "var(--text-muted)" }}
                tickCount={4}
                width={44}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (!active || !payload?.length) return null;
                  const byKey = new Map(payload.map((entry) => [entry.dataKey, entry.value as number]));
                  return (
                    <div className="rounded-xl border border-border bg-surface px-3 py-2.5 shadow-md">
                      <p className="text-[11px] font-medium text-text-muted">{label}</p>
                      <div className="mt-1.5 flex flex-col gap-1">
                        {series.map((s) => {
                          const value = byKey.get(s.key);
                          if (value === undefined) return null;
                          return (
                            <div key={s.key} className="flex items-center gap-2 text-[12.5px]">
                              <span className="size-2 rounded-full" style={{ backgroundColor: s.color }} />
                              <span className="text-text-secondary">{s.name}</span>
                              <span className="ml-4 font-semibold text-text-primary tabular-nums">
                                {valueFormatter(value)}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                }}
                cursor={{ stroke: "var(--border-strong)", strokeWidth: 1 }}
              />
              {series.map((s, index) => (
                <Area
                  key={s.key}
                  type="monotone"
                  dataKey={s.key}
                  name={s.name}
                  stroke={s.color}
                  strokeWidth={index === 0 ? 2.5 : 1.5}
                  fill={index === 0 ? `url(#reportFill-${s.key})` : "transparent"}
                  dot={false}
                  activeDot={{ r: index === 0 ? 4.5 : 3.5, strokeWidth: 0 }}
                />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </ChartCard>
  );
}
