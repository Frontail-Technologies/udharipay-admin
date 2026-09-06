"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { ChartCard } from "@/components/dashboard/ChartCard";
import {
  statusBreakdownData,
  statusBreakdownTotal,
  type StatusBreakdownSlice,
} from "@/data/admin-demo-data";

const toneColor: Record<StatusBreakdownSlice["tone"], string> = {
  success: "var(--success)",
  warning: "var(--warning)",
  error: "var(--error)",
  neutral: "var(--text-muted)",
};

function DonutTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { name: string; value: number }[];
}) {
  if (!active || !payload?.length) return null;
  const entry = payload[0];

  return (
    <div className="rounded-xl border border-border bg-surface px-3 py-1.5 shadow-md">
      <p className="text-[12px] font-medium text-text-primary">
        {entry.name}: {entry.value}%
      </p>
    </div>
  );
}

export function StatusBreakdownChart() {
  return (
    <ChartCard title="Collection Status" subtitle="Share of this month's installments">
      <div className="flex h-full min-h-0 flex-col items-center justify-center gap-4">
        <div className="relative aspect-square w-full max-w-43 shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={statusBreakdownData}
                dataKey="value"
                nameKey="label"
                innerRadius="58%"
                outerRadius="100%"
                paddingAngle={3}
                cornerRadius={6}
                strokeWidth={0}
              >
                {statusBreakdownData.map((slice) => (
                  <Cell key={slice.id} fill={toneColor[slice.tone]} />
                ))}
              </Pie>
              <Tooltip content={<DonutTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-[22px] font-bold leading-tight tracking-tight text-text-primary">
              {statusBreakdownTotal.value}
            </span>
            <span className="text-[11px] text-text-muted">{statusBreakdownTotal.label}</span>
          </div>
        </div>

        <ul className="flex w-full max-w-55 flex-col gap-2">
          {statusBreakdownData.map((slice) => (
            <li key={slice.id} className="flex items-center gap-2 text-[12.5px]">
              <span
                className="size-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: toneColor[slice.tone] }}
              />
              <span className="truncate text-text-secondary">{slice.label}</span>
              <span className="ml-auto font-semibold text-text-primary tabular-nums">
                {slice.value}%
              </span>
            </li>
          ))}
        </ul>
      </div>
    </ChartCard>
  );
}
