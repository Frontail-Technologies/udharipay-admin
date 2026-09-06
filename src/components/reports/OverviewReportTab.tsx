"use client";

import { useMemo } from "react";
import { ReportsKpiGrid } from "@/components/reports/ReportsKpiGrid";
import { ReportTrendChart } from "@/components/reports/ReportTrendChart";
import { ReceivableHealthChart } from "@/components/reports/ReceivableHealthChart";
import {
  useAdminMerchants,
  useAdminPlans,
  useAdminInstallments,
  useAdminMandates,
  useAdminSubscriptions,
} from "@/hooks/useAdminEntities";
import { calculateCollectionMetrics, buildCollectionTrend, calculateMandateMetrics, calculateMrr } from "@/data/admin/reports";
import type { ReportDateRange } from "@/data/admin/reports";
import { formatCompactInr } from "@/lib/format";

export function OverviewReportTab({ range, merchantId }: { range: ReportDateRange; merchantId?: string }) {
  const merchants = useAdminMerchants();
  const plans = useAdminPlans();
  const installments = useAdminInstallments();
  const mandates = useAdminMandates();
  const subscriptions = useAdminSubscriptions();

  const scopedMerchants = merchantId ? merchants.filter((m) => m.id === merchantId) : merchants;
  const scopedPlans = merchantId ? plans.filter((p) => p.merchantId === merchantId) : plans;
  const scopedInstallments = merchantId ? installments.filter((i) => i.merchantId === merchantId) : installments;
  const scopedMandates = merchantId ? mandates.filter((m) => m.merchantId === merchantId) : mandates;

  const kpis = useMemo(() => {
    const collectionMetrics = calculateCollectionMetrics(scopedInstallments, [], range, undefined);
    const totalOutstanding = scopedPlans.reduce((sum, plan) => sum + plan.remainingAmount, 0);
    const activeMerchants = scopedMerchants.filter((m) => m.status === "active").length;
    const activePlans = scopedPlans.filter((p) => p.status !== "completed").length;
    const mandateMetrics = calculateMandateMetrics(scopedMandates);
    // MRR is Subscription-only revenue — never merchant-filtered here, since
    // the Subscription dataset is deliberately platform-wide (see
    // SubscriptionsReportTab); customer principal never enters it.
    const mrr = calculateMrr(subscriptions);

    return [
      { label: "Total Outstanding", value: formatCompactInr(totalOutstanding) },
      { label: "Collected in Period", value: formatCompactInr(collectionMetrics.collectedAmount) },
      { label: "Collection Rate", value: `${collectionMetrics.collectionRate}%` },
      {
        label: "Overdue Amount",
        value: formatCompactInr(collectionMetrics.overdueAmount),
        emphasis: collectionMetrics.overdueAmount > 0 ? ("error" as const) : ("default" as const),
      },
      { label: "Active Merchants", value: String(activeMerchants) },
      { label: "Active Plans", value: String(activePlans) },
      {
        label: "Mandate Success Rate",
        value: mandateMetrics.attemptSuccessRate !== null ? `${mandateMetrics.attemptSuccessRate}%` : "—",
      },
      { label: "MRR", value: formatCompactInr(mrr) },
    ];
  }, [scopedInstallments, scopedPlans, scopedMerchants, scopedMandates, subscriptions, range]);

  const trend = useMemo(() => buildCollectionTrend(installments, range, merchantId), [installments, range, merchantId]);

  return (
    <div className="flex flex-col gap-4">
      <ReportsKpiGrid items={kpis} />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(260px,1fr)] lg:items-stretch lg:h-[320px]">
        <ReportTrendChart
          title="Collections Performance"
          subtitle="Collected vs Due, over the selected period"
          data={trend}
          series={[
            { key: "collected", name: "Collected", color: "var(--success)" },
            { key: "due", name: "Due", color: "var(--warning)" },
          ]}
        />
        <ReceivableHealthChart installments={scopedInstallments} />
      </div>
    </div>
  );
}
