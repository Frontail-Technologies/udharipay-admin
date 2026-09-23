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
  if (query.isPending) return <Skeleton className="h-7 w-20" />;
  if (query.isError) return <span className="text-[13px] text-destructive">{normalizeApiError(query.error).message}</span>;
  const metric = findMetric(query.data.data.metrics, metricKey);
  return <>{metric ? formatReportValue(metric.value, metric.type) : "-"}</>;
}

export function DashboardPrimaryMetrics({ dashboard }: { dashboard: ReturnType<typeof useDashboard> }) {
  const cards: CardSpec[] = [
    { label: "New Active Merchants", icon: Store, query: dashboard.merchantsReport, metricKey: "activeCount" },
    { label: "New Active Customers", icon: Users, query: dashboard.customersReport, metricKey: "activeCount" },
    { label: "Outstanding", icon: Wallet, query: dashboard.collectionsReport, metricKey: "outstandingPaise" },
    { label: "Collected", icon: Banknote, query: dashboard.collectionsReport, metricKey: "collectedPaise" },
  ];
  return <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 xl:grid-cols-4">
    {cards.map((card) => <MetricCard key={card.label} label={card.label} icon={card.icon} value={<CardValue query={card.query} metricKey={card.metricKey} />} />)}
  </div>;
}

export function DashboardSecondaryMetrics({ dashboard }: { dashboard: ReturnType<typeof useDashboard> }) {
  const cards: (CardSpec & { tone: "neutral" | "warning" | "error" })[] = [
    { label: "Due Today", icon: CalendarClock, query: dashboard.collectionsReport, metricKey: "dueTodayPaise", tone: "warning" },
    { label: "Overdue", icon: AlertTriangle, query: dashboard.collectionsReport, metricKey: "overduePaise", tone: "error" },
    { label: "Failed or Closed Mandates", icon: CreditCard, query: dashboard.mandatesReport, metricKey: "failedCount", tone: "error" },
  ];
  return <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
    {cards.map((card) => <SecondaryMetricCard key={card.label} label={card.label} icon={card.icon} tone={card.tone} value={<CardValue query={card.query} metricKey={card.metricKey} />} />)}
  </div>;
}
