"use client";

import { Bar, BarChart, CartesianGrid, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { normalizeApiError } from "@/api/http/errors";
import { ChartCard } from "@/components/dashboard/ChartCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip as UiTooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { findMetric } from "@/features/dashboard/utils/metrics";
import type { useDashboard } from "@/features/dashboard/hooks/useDashboard";
import type { useReport } from "@/features/reports/hooks/useReports";
import { formatCompactInr, formatPaiseInr } from "@/lib/format";

type Dashboard = ReturnType<typeof useDashboard>;
type ReportQuery = ReturnType<typeof useReport>;

const AXIS_TICK = { fill: "var(--text-muted)", fontSize: 11 };
const CHART_HEIGHT = 220;

/** Paise string → rupees number (chart scale only; exact values are always shown via formatPaiseInr). */
function paiseToRupees(value: unknown) {
  const numeric = Number(typeof value === "string" || typeof value === "number" ? value : 0);
  return Number.isFinite(numeric) ? numeric / 100 : 0;
}

function paiseOf(value: unknown) {
  return typeof value === "string" ? value : String(Math.round(Number(value ?? 0)));
}

export function DashboardCharts({ dashboard }: { dashboard: Dashboard }) {
  return <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 2xl:grid-cols-3">
    <OverdueAgingChart query={dashboard.agingReport} />
    <TopMerchantsChart query={dashboard.merchantPerformanceReport} />
    <PaymentStatusChart query={dashboard.paymentsReport} className="lg:col-span-2 2xl:col-span-1" />
  </div>;
}

function ChartState({ query, children, empty }: { query: ReportQuery; children: () => React.ReactNode; empty: boolean }) {
  if (query.isPending) return <Skeleton className="w-full rounded-lg" style={{ height: CHART_HEIGHT }} />;
  if (query.isError) return <p className="flex items-center justify-center text-[12.5px] text-destructive" style={{ height: CHART_HEIGHT }}>{normalizeApiError(query.error).message}</p>;
  if (empty) return <p className="flex items-center justify-center text-[12.5px] text-text-muted" style={{ height: CHART_HEIGHT }}>No data for this period.</p>;
  return <>{children()}</>;
}

function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: { payload: { paise: string; name: string } }[]; label?: string }) {
  if (!active || !payload?.length) return null;
  const point = payload[0].payload;
  return (
    <div className="rounded-lg bg-popover px-3 py-2 text-[12px] shadow-[var(--shadow-raised)] ring-1 ring-border">
      <p className="text-text-muted">{label ?? point.name}</p>
      <p className="mt-0.5 font-semibold tabular-nums text-text-primary">{formatPaiseInr(point.paise)}</p>
    </div>
  );
}

// ── Overdue by age ───────────────────────────────────────────────────────────

const AGING_BUCKETS = [
  { key: "bucket1to3Paise", name: "1–3 days" },
  { key: "bucket4to7Paise", name: "4–7 days" },
  { key: "bucket8to15Paise", name: "8–15 days" },
  { key: "bucket15plusPaise", name: "15+ days" },
] as const;

function OverdueAgingChart({ query }: { query: ReportQuery }) {
  const metrics = query.data?.data.metrics;
  const data = AGING_BUCKETS.map((bucket) => {
    const paise = findMetric(metrics, bucket.key)?.value ?? "0";
    return { name: bucket.name, paise, rupees: paiseToRupees(paise) };
  });
  const overdueTotal = findMetric(metrics, "overduePaise")?.value;

  return <ChartCard title="Overdue by age" subtitle={overdueTotal ? `${formatPaiseInr(overdueTotal)} overdue in total` : "Days past the due date"}>
    <ChartState query={query} empty={data.every((point) => point.rupees === 0)}>
      {() => <div style={{ height: CHART_HEIGHT }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 18, right: 4, bottom: 0, left: 0 }} barCategoryGap="28%">
            <CartesianGrid vertical={false} stroke="var(--border)" />
            <XAxis dataKey="name" tickLine={false} axisLine={false} tick={AXIS_TICK} />
            <YAxis tickLine={false} axisLine={false} tick={AXIS_TICK} width={52} tickFormatter={(value: number) => formatCompactInr(value)} />
            <Tooltip cursor={{ fill: "var(--surface-hover)" }} content={<ChartTooltip />} />
            <Bar dataKey="rupees" fill="var(--error)" radius={[4, 4, 0, 0]} maxBarSize={24}>
              <LabelList dataKey="rupees" position="top" formatter={(value) => (Number(value) > 0 ? formatCompactInr(Number(value)) : "")} style={{ fill: "var(--text-secondary)", fontSize: 11, fontWeight: 500 }} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>}
    </ChartState>
  </ChartCard>;
}

// ── Top merchants by collections ─────────────────────────────────────────────

function TopMerchantsChart({ query }: { query: ReportQuery }) {
  const data = (query.data?.data.rows ?? []).map((row) => {
    const paise = paiseOf(row.collectedPaise);
    return { name: String(row.businessName ?? "-"), paise, rupees: paiseToRupees(paise) };
  });

  return <ChartCard title="Top merchants" subtitle="Collected in the selected period">
    <ChartState query={query} empty={data.every((point) => point.rupees === 0)}>
      {() => <div style={{ height: CHART_HEIGHT }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ top: 0, right: 56, bottom: 0, left: 0 }} barCategoryGap="30%">
            <CartesianGrid horizontal={false} stroke="var(--border)" />
            <XAxis type="number" tickLine={false} axisLine={false} tick={AXIS_TICK} tickFormatter={(value: number) => formatCompactInr(value)} />
            <YAxis type="category" dataKey="name" tickLine={false} axisLine={false} width={112} tick={{ ...AXIS_TICK, fill: "var(--text-secondary)" }} tickFormatter={(value: string) => (value.length > 16 ? `${value.slice(0, 15)}…` : value)} />
            <Tooltip cursor={{ fill: "var(--surface-hover)" }} content={<ChartTooltip />} />
            <Bar dataKey="rupees" fill="var(--primary)" radius={[0, 4, 4, 0]} maxBarSize={20}>
              <LabelList dataKey="rupees" position="right" formatter={(value) => formatCompactInr(Number(value))} style={{ fill: "var(--text-secondary)", fontSize: 11, fontWeight: 500 }} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>}
    </ChartState>
  </ChartCard>;
}

// ── Payments by status (one whole split into parts) ──────────────────────────

const PAYMENT_STATUSES = [
  { key: "successfulPaise", label: "Successful", color: "var(--success)" },
  { key: "pendingPaise", label: "Pending", color: "var(--warning)" },
  { key: "failedPaise", label: "Failed", color: "var(--error)" },
  { key: "reversedPaise", label: "Reversed", color: "var(--text-muted)" },
] as const;

function PaymentStatusChart({ query, className }: { query: ReportQuery; className?: string }) {
  const metrics = query.data?.data.metrics;
  const parts = PAYMENT_STATUSES.map((status) => {
    const paise = findMetric(metrics, status.key)?.value ?? "0";
    return { ...status, paise, rupees: paiseToRupees(paise) };
  });
  const total = parts.reduce((sum, part) => sum + part.rupees, 0);
  const successRate = findMetric(metrics, "successRateBasisPoints")?.value;
  const paymentCount = findMetric(metrics, "paymentCount")?.value;

  return <ChartCard className={className} title="Payments by status" subtitle={paymentCount ? `${Number(paymentCount).toLocaleString("en-IN")} payments in the selected period` : "Selected period"}>
    <ChartState query={query} empty={total === 0}>
      {() => <div className="flex flex-col justify-center gap-5" style={{ minHeight: CHART_HEIGHT }}>
        {successRate ? <div>
          <p className="text-[26px] font-semibold leading-none tracking-tight tabular-nums text-text-primary">{(Number(successRate) / 100).toFixed(1)}%</p>
          <p className="mt-1 text-[12px] text-text-muted">success rate (successful ÷ settled attempts)</p>
        </div> : null}
        <div className="flex h-3 w-full gap-0.5 overflow-hidden rounded-full" aria-hidden>
          {parts.filter((part) => part.rupees > 0).map((part) => (
            <UiTooltip key={part.key}>
              <TooltipTrigger asChild>
                <div className="h-full first:rounded-l-full last:rounded-r-full" style={{ width: `${(part.rupees / total) * 100}%`, minWidth: 4, background: part.color }} />
              </TooltipTrigger>
              <TooltipContent>{part.label}: {formatPaiseInr(part.paise)}</TooltipContent>
            </UiTooltip>
          ))}
        </div>
        <ul className="grid grid-cols-2 gap-x-4 gap-y-2.5">
          {parts.map((part) => (
            <li key={part.key} className="flex min-w-0 items-start gap-2">
              <span className="mt-1 size-2.5 shrink-0 rounded-full" style={{ background: part.color }} />
              <div className="min-w-0">
                <p className="text-[12px] text-text-secondary">{part.label} <span className="text-text-muted tabular-nums">· {total ? Math.round((part.rupees / total) * 100) : 0}%</span></p>
                <p className="truncate text-[13px] font-semibold tabular-nums text-text-primary">{formatPaiseInr(part.paise)}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>}
    </ChartState>
  </ChartCard>;
}
