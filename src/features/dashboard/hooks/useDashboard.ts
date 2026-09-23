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

  const collectionAttention = useQuery({ queryKey: dashboardKeys.collectionAttention(), queryFn: ({ signal }) => listCollectionQueue({ state: "overdue", limit: ATTENTION_LIMIT }, { signal }) });
  const kycAttention = useQuery({ queryKey: dashboardKeys.kycAttention(), queryFn: ({ signal }) => listKycReviews({ status: "pending", limit: ATTENTION_LIMIT }, { signal }) });
  const billingAttention = useQuery({ queryKey: dashboardKeys.billingAttention(), queryFn: ({ signal }) => listBillingInvoices({ status: "pending", limit: ATTENTION_LIMIT }, { signal }) });
  const activity = useQuery({ queryKey: dashboardKeys.activity(), queryFn: ({ signal }) => listAuditEvents({ limit: ACTIVITY_LIMIT }, { signal }) });

  const refresh = () => {
    void collectionsReport.refetch();
    void merchantsReport.refetch();
    void customersReport.refetch();
    void mandatesReport.refetch();
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
    collectionAttention,
    kycAttention,
    billingAttention,
    activity,
    refresh,
  };
}
