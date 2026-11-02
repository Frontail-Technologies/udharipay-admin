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

/*
 * The money first (docs: same hierarchy as the mobile Home): one hero card with what is outstanding and what came in,
 * then the two growth numbers as small tiles. Each value loads and fails on its own.
 */
export function DashboardPrimaryMetrics({ dashboard }: { dashboard: ReturnType<typeof useDashboard> }) {
  return <div className="grid grid-cols-2 gap-3.5 lg:grid-cols-4">
    <div className="relative col-span-2 overflow-hidden rounded-[22px] bg-[linear-gradient(135deg,#a933d8_0%,#8a22bd_55%,#6c1596_100%)] p-5 text-white shadow-[0_18px_40px_-18px_rgb(158_43_208/0.7)] sm:p-6">
      <div aria-hidden className="pointer-events-none absolute -top-16 -right-10 size-56 rounded-full bg-white/10" />
      <div aria-hidden className="pointer-events-none absolute -bottom-20 right-24 size-40 rounded-full bg-white/5" />
      <div className="relative flex items-center gap-2 text-[13px] font-medium text-white/80">
        <span className="flex size-8 items-center justify-center rounded-xl bg-white/15"><Wallet className="size-4" /></span>
        Outstanding
      </div>
      <div className="relative mt-3 text-[34px] font-semibold leading-none tracking-tight sm:text-[40px]">
        <CardValue query={dashboard.collectionsReport} metricKey="outstandingPaise" />
      </div>
      <div className="relative mt-5 flex items-center gap-2 border-t border-white/15 pt-4 text-[13px] text-white/80">
        <Banknote className="size-4" />
        <span>Collected</span>
        <span className="font-semibold text-white"><CardValue query={dashboard.collectionsReport} metricKey="collectedPaise" /></span>
      </div>
      <CollectionRing query={dashboard.collectionsReport} />
    </div>
    <MetricCard label="New merchants" icon={Store} value={<CardValue query={dashboard.merchantsReport} metricKey="activeCount" />} />
    <MetricCard label="New customers" icon={Users} value={<CardValue query={dashboard.customersReport} metricKey="activeCount" />} />
  </div>;
}

// The period's collection rate (collected ÷ due, straight from the report) as a ring in the hero's corner.
function CollectionRing({ query }: { query: ReportQuery }) {
  const metric = query.isPending || query.isError ? null : findMetric(query.data.data.metrics, "collectionRateBasisPoints");
  if (!metric || typeof metric.value !== "string") return null;
  const ratio = Math.max(0, Math.min(1, Number(metric.value) / 10_000));
  const radius = 34;
  const length = 2 * Math.PI * radius;
  return (
    <div className="absolute top-5 right-5 hidden flex-col items-center gap-1 sm:flex">
      <svg viewBox="0 0 84 84" className="size-21 -rotate-90" aria-hidden>
        <circle cx="42" cy="42" r={radius} fill="none" stroke="rgb(255 255 255 / 0.18)" strokeWidth="8" />
        <circle cx="42" cy="42" r={radius} fill="none" stroke="white" strokeWidth="8" strokeLinecap="round" strokeDasharray={`${length * ratio} ${length}`} />
      </svg>
      <span className="absolute top-[30px] text-[15px] font-semibold">{formatReportValue(metric.value, metric.type)}</span>
      <span className="text-[11px] text-white/75">of due collected</span>
    </div>
  );
}

export function DashboardSecondaryMetrics({ dashboard }: { dashboard: ReturnType<typeof useDashboard> }) {
  const cards: (CardSpec & { tone: "neutral" | "warning" | "error" })[] = [
    { label: "Due today", icon: CalendarClock, query: dashboard.collectionsReport, metricKey: "dueTodayPaise", tone: "warning" },
    { label: "Overdue", icon: AlertTriangle, query: dashboard.collectionsReport, metricKey: "overduePaise", tone: "error" },
    { label: "Failed AutoPay", icon: CreditCard, query: dashboard.mandatesReport, metricKey: "failedCount", tone: "error" },
  ];
  return <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
    {cards.map((card) => <SecondaryMetricCard key={card.label} label={card.label} icon={card.icon} tone={card.tone} value={<CardValue query={card.query} metricKey={card.metricKey} />} />)}
  </div>;
}
