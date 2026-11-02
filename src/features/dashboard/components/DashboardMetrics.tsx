"use client";

import type { LucideIcon } from "lucide-react";
import { AlertTriangle, Banknote, CalendarClock, CreditCard, Store, Users, Wallet } from "lucide-react";
import { normalizeApiError } from "@/api/http/errors";
import { formatReportValue } from "@/features/reports/utils/report-values";
import { findMetric } from "@/features/dashboard/utils/metrics";
import { MetricCard, SecondaryMetricCard } from "@/components/dashboard/MetricCard";
import { Skeleton } from "@/components/ui/skeleton";
import type { useDashboard } from "@/features/dashboard/hooks/useDashboard";
import type { useReport } from "@/features/reports/hooks/useReports";

type ReportQuery = ReturnType<typeof useReport>;
type CardSpec = { label: string; icon: LucideIcon; query: ReportQuery; metricKey: string };

function CardValue({ query, metricKey }: { query: ReportQuery; metricKey: string }) {
  if (query.isPending) return <Skeleton className="h-6 w-20" />;
  if (query.isError) return <span className="text-[12.5px] font-normal text-destructive">{normalizeApiError(query.error).message}</span>;
  const metric = findMetric(query.data.data.metrics, metricKey);
  return <>{metric ? formatReportValue(metric.value, metric.type) : "-"}</>;
}

/*
 * The money first, then growth: four equal compact tiles. Each value loads and fails on its own.
 */
export function DashboardPrimaryMetrics({ dashboard }: { dashboard: ReturnType<typeof useDashboard> }) {
  return <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
    <MetricCard label="Outstanding" icon={Wallet} value={<CardValue query={dashboard.collectionsReport} metricKey="outstandingPaise" />} />
    <MetricCard label="Collected" icon={Banknote} value={<CardValue query={dashboard.collectionsReport} metricKey="collectedPaise" />} footer={<CollectionRate query={dashboard.collectionsReport} />} />
    <MetricCard label="New merchants" icon={Store} value={<CardValue query={dashboard.merchantsReport} metricKey="activeCount" />} />
    <MetricCard label="New customers" icon={Users} value={<CardValue query={dashboard.customersReport} metricKey="activeCount" />} />
  </div>;
}

// Collected ÷ due for the period, straight from the report, as a thin meter under the Collected value.
function CollectionRate({ query }: { query: ReportQuery }) {
  const metric = query.isPending || query.isError ? null : findMetric(query.data.data.metrics, "collectionRateBasisPoints");
  if (!metric || typeof metric.value !== "string") return null;
  const percent = Math.max(0, Math.min(100, Number(metric.value) / 100));
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-primary-muted" role="meter" aria-valuemin={0} aria-valuemax={100} aria-valuenow={percent} aria-label="Collection rate">
        <div className="h-full rounded-full bg-primary" style={{ width: `${percent}%` }} />
      </div>
      <span className="shrink-0 tabular-nums">{formatReportValue(metric.value, metric.type)} of due</span>
    </div>
  );
}

export function DashboardSecondaryMetrics({ dashboard }: { dashboard: ReturnType<typeof useDashboard> }) {
  const cards: (CardSpec & { tone: "neutral" | "warning" | "error" })[] = [
    { label: "Due today", icon: CalendarClock, query: dashboard.collectionsReport, metricKey: "dueTodayPaise", tone: "warning" },
    { label: "Overdue", icon: AlertTriangle, query: dashboard.collectionsReport, metricKey: "overduePaise", tone: "error" },
    { label: "Failed AutoPay", icon: CreditCard, query: dashboard.mandatesReport, metricKey: "failedCount", tone: "error" },
  ];
  return <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
    {cards.map((card) => <SecondaryMetricCard key={card.label} label={card.label} icon={card.icon} tone={card.tone} value={<CardValue query={card.query} metricKey={card.metricKey} />} />)}
  </div>;
}
