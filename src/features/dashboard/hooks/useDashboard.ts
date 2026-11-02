"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { listCollectionQueue } from "@/api/generated/collections";
import { listKycReviews } from "@/api/generated/kyc";
import { listBillingInvoices } from "@/api/generated/billing";
import { listAuditEvents } from "@/api/generated/audit";
import { useReport } from "@/features/reports/hooks/useReports";
import { periodToDateRange, type DashboardPeriod } from "@/features/dashboard/utils/period";

const ATTENTION_LIMIT = 5;
const ACTIVITY_LIMIT = 8;
const TOP_MERCHANTS_LIMIT = 5;
const AGING_LOOKBACK_DAYS = 366; // the backend's maximum report range

function agingDateRange(dateTo: string) {
  const to = new Date(`${dateTo}T00:00:00Z`);
  const from = new Date(to.getTime() - (AGING_LOOKBACK_DAYS - 1) * 24 * 60 * 60 * 1000);
  return { dateFrom: from.toISOString().slice(0, 10), dateTo };
}

export const dashboardKeys = {
  all: ["dashboard"] as const,
  collectionAttention: () => [...dashboardKeys.all, "collection-attention"] as const,
  kycAttention: () => [...dashboardKeys.all, "kyc-attention"] as const,
  billingAttention: () => [...dashboardKeys.all, "billing-attention"] as const,
  activity: () => [...dashboardKeys.all, "activity"] as const,
};

export function useDashboard() {
  const [period, setPeriod] = useState<DashboardPeriod>("30d");
  const { dateFrom, dateTo } = periodToDateRange(period);
  const reportParams = { dateFrom, dateTo, limit: 1 };

  const collectionsReport = useReport("collections", reportParams);
  const merchantsReport = useReport("merchants", reportParams);
  const customersReport = useReport("customers", reportParams);
  const mandatesReport = useReport("mandates", reportParams);
  // Chart sources. Payments and merchant ranking follow the selected period; ageing looks back over the whole
  // allowed report window so a 7-day period still shows debt that is weeks overdue.
  const paymentsReport = useReport("payments", reportParams);
  const merchantPerformanceReport = useReport("merchant_performance", { dateFrom, dateTo, sort: "collected", limit: TOP_MERCHANTS_LIMIT });
  const agingReport = useReport("outstanding", { ...agingDateRange(dateTo), limit: 1 });

  const collectionAttention = useQuery({ queryKey: dashboardKeys.collectionAttention(), queryFn: ({ signal }) => listCollectionQueue({ state: "overdue", limit: ATTENTION_LIMIT }, { signal }) });
  const kycAttention = useQuery({ queryKey: dashboardKeys.kycAttention(), queryFn: ({ signal }) => listKycReviews({ status: "pending", limit: ATTENTION_LIMIT }, { signal }) });
  const billingAttention = useQuery({ queryKey: dashboardKeys.billingAttention(), queryFn: ({ signal }) => listBillingInvoices({ status: "pending", limit: ATTENTION_LIMIT }, { signal }) });
  const activity = useQuery({ queryKey: dashboardKeys.activity(), queryFn: ({ signal }) => listAuditEvents({ limit: ACTIVITY_LIMIT }, { signal }) });

  const refresh = () => {
    void collectionsReport.refetch();
    void merchantsReport.refetch();
    void customersReport.refetch();
    void mandatesReport.refetch();
    void paymentsReport.refetch();
    void merchantPerformanceReport.refetch();
    void agingReport.refetch();
    void collectionAttention.refetch();
    void kycAttention.refetch();
    void billingAttention.refetch();
    void activity.refetch();
  };

  return {
    period,
    setPeriod,
    collectionsReport,
    merchantsReport,
    customersReport,
    mandatesReport,
    paymentsReport,
    merchantPerformanceReport,
    agingReport,
    collectionAttention,
    kycAttention,
    billingAttention,
    activity,
    refresh,
  };
}
