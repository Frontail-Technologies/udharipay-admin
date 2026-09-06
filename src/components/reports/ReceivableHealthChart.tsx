"use client";

import { useMemo } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { ChartCard } from "@/components/dashboard/ChartCard";
import type { Installment } from "@/data/admin";

type Slice = { id: string; label: string; count: number; tone: "success" | "warning" | "error" | "neutral" };

const toneColor: Record<Slice["tone"], string> = {
  success: "var(--success)",
  warning: "var(--warning)",
  error: "var(--error)",
  neutral: "var(--text-muted)",
};

function DonutTooltip({ active, payload }: { active?: boolean; payload?: { name: string; value: number }[] }) {
  if (!active || !payload?.length) return null;
  const entry = payload[0];
  return (
    <div className="rounded-xl border border-border bg-surface px-3 py-1.5 shadow-md">
      <p className="text-[12px] font-medium text-text-primary">
        {entry.name}: {entry.value}
      </p>
    </div>
  );
}

/**
 * Installment-level distribution — a customer/plan is never rolled up into
 * "overdue" here just because one installment is overdue; each individual
 * installment contributes its own bucket.
 */
export function ReceivableHealthChart({ installments }: { installments: Installment[] }) {
  const slices = useMemo<Slice[]>(() => {
    const currentUpcoming = installments.filter((i) => i.status === "upcoming").length;
    const due = installments.filter((i) => i.status === "due").length;
    const overdue = installments.filter((i) => i.status === "overdue" || i.status === "failed").length;
    return [
      { id: "current", label: "Current / Upcoming", count: currentUpcoming, tone: "neutral" },
      { id: "due", label: "Due", count: due, tone: "warning" },
      { id: "overdue", label: "Overdue", count: overdue, tone: "error" },
    ];
  }, [installments]);

  const total = slices.reduce((sum, slice) => sum + slice.count, 0);

  return (
    <ChartCard title="Receivable Health" subtitle="Unresolved installments by bucket">
      {total === 0 ? (
        <div className="flex h-full min-h-[180px] items-center justify-center rounded-lg border border-dashed border-border-strong bg-surface-muted/40">
          <p className="text-[12.5px] text-text-muted">Nothing outstanding in this scope.</p>
        </div>
      ) : (
        <div className="flex h-full min-h-0 flex-col items-center justify-center gap-4">
          <div className="relative aspect-square w-full max-w-40 shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={slices}
                  dataKey="count"
                  nameKey="label"
                  innerRadius="58%"
                  outerRadius="100%"
                  paddingAngle={3}
                  cornerRadius={6}
                  strokeWidth={0}
                >
                  {slices.map((slice) => (
                    <Cell key={slice.id} fill={toneColor[slice.tone]} />
                  ))}
                </Pie>
                <Tooltip content={<DonutTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-[20px] font-bold leading-tight tracking-tight text-text-primary">{total}</span>
              <span className="text-[11px] text-text-muted">installments</span>
            </div>
          </div>
          <ul className="flex w-full max-w-55 flex-col gap-2">
            {slices.map((slice) => (
              <li key={slice.id} className="flex items-center gap-2 text-[12.5px]">
                <span className="size-2.5 shrink-0 rounded-full" style={{ backgroundColor: toneColor[slice.tone] }} />
                <span className="truncate text-text-secondary">{slice.label}</span>
                <span className="ml-auto font-semibold text-text-primary tabular-nums">{slice.count}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </ChartCard>
  );
}
