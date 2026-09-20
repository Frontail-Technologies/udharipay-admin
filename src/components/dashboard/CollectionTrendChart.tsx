"use client";

import { useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ChartCard } from "@/components/dashboard/ChartCard";
import { CHART_AREA_HEIGHT_CLASS } from "@/components/dashboard/chartLayout";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  collectionTrendData,
  type CollectionPeriod,
} from "@/data/admin-demo-data";
import { formatCompactInr } from "@/lib/format";

const PERIODS: CollectionPeriod[] = ["7D", "30D", "90D"];

const SERIES = [
  { key: "collected", name: "Collected", color: "var(--success)" },
  { key: "due", name: "Due", color: "var(--warning)" },
  { key: "overdue", name: "Overdue", color: "var(--error)" },
] as const;

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  label?: string;
  payload?: { dataKey: string; value: number }[];
}) {
  if (!active || !payload?.length) return null;

  const byKey = new Map(payload.map((entry) => [entry.dataKey, entry.value]));

  return (
    <div className="rounded-xl border border-border bg-surface px-3 py-2.5 shadow-md">
      <p className="text-[11px] font-medium text-text-muted">{label}</p>
      <div className="mt-1.5 flex flex-col gap-1">
        {SERIES.map((series) => {
          const value = byKey.get(series.key);
          if (value === undefined) return null;
          return (
            <div key={series.key} className="flex items-center gap-2 text-[12.5px]">
              <span className="size-2 rounded-full" style={{ backgroundColor: series.color }} />
              <span className="text-text-secondary">{series.name}</span>
              <span className="ml-4 font-semibold text-text-primary tabular-nums">
                {formatCompactInr(value)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SeriesLegend() {
  return (
    <div className="flex items-center gap-3">
      {SERIES.map((series) => (
        <span key={series.key} className="flex items-center gap-1.5">
          <span className="size-2 rounded-full" style={{ backgroundColor: series.color }} />
          {series.name}
        </span>
      ))}
    </div>
  );
}

export function CollectionTrendChart() {
  const [period, setPeriod] = useState<CollectionPeriod>("30D");
  const data = collectionTrendData[period];

  return (
    <ChartCard
      title="Collection Performance"
      subtitle={<SeriesLegend />}
      action={
        <Tabs value={period} onValueChange={(value) => setPeriod(value as CollectionPeriod)}>
          <TabsList className="h-8">
            {PERIODS.map((p) => (
              <TabsTrigger key={p} value={p} className="h-7 px-2.5 text-[12px]">
                {p}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      }
    >
      <div className={CHART_AREA_HEIGHT_CLASS}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 8, right: 4, left: -16, bottom: 0 }}>
            <defs>
              <linearGradient id="collectedFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--success)" stopOpacity={0.28} />
                <stop offset="100%" stopColor="var(--success)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              vertical={false}
              stroke="var(--border)"
              strokeOpacity={0.5}
              strokeDasharray="3 3"
            />
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
              tickFormatter={formatCompactInr}
              tick={{ fontSize: 11, fill: "var(--text-muted)" }}
              tickCount={4}
              width={40}
            />
            <Tooltip
              content={<ChartTooltip />}
              cursor={{ stroke: "var(--border-strong)", strokeWidth: 1 }}
            />
            <Area
              type="monotone"
              dataKey="overdue"
              name="Overdue"
              stroke="var(--error)"
              strokeWidth={1.5}
              strokeDasharray="3 3"
              fill="transparent"
              dot={false}
              activeDot={{ r: 3.5, strokeWidth: 0 }}
            />
            <Area
              type="monotone"
              dataKey="due"
              name="Due"
              stroke="var(--warning)"
              strokeWidth={1.5}
              strokeOpacity={0.85}
              fill="transparent"
              dot={false}
              activeDot={{ r: 3.5, strokeWidth: 0 }}
            />
            <Area
              type="monotone"
              dataKey="collected"
              name="Collected"
              stroke="var(--success)"
              strokeWidth={2.5}
              fill="url(#collectedFill)"
              dot={false}
              activeDot={{ r: 4.5, strokeWidth: 0 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
}
