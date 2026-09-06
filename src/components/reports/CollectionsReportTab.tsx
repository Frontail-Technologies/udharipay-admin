"use client";

import { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Download } from "lucide-react";
import { EntitySummaryGrid } from "@/components/entity/EntitySummaryGrid";
import { ReportTrendChart } from "@/components/reports/ReportTrendChart";
import { DataTable } from "@/components/table/DataTable";
import { Button } from "@/components/ui/button";
import { useAdminInstallments, useAdminPayments, useAdminMerchants, useAdminCollectionFollowUps } from "@/hooks/useAdminEntities";
import { useAdminSettings } from "@/store/adminSettingsStore";
import { isInstallmentAtRisk, isIsoDateInRange } from "@/data/admin";
import {
  calculateCollectionMetrics,
  buildCollectionTrend,
  calculateMerchantCollectionBreakdown,
  type ReportDateRange,
  type MerchantCollectionBreakdownRow,
} from "@/data/admin/reports";
import { formatCompactInr } from "@/lib/format";
import { exportRowsToCsv } from "@/lib/csv";

export function CollectionsReportTab({ range, merchantId }: { range: ReportDateRange; merchantId?: string }) {
  const installments = useAdminInstallments();
  const payments = useAdminPayments();
  const merchants = useAdminMerchants();
  const followUps = useAdminCollectionFollowUps();
  const atRiskOverdueDays = useAdminSettings().collections.atRiskOverdueDays;

  const metrics = useMemo(
    () => calculateCollectionMetrics(installments, payments, range, merchantId),
    [installments, payments, range, merchantId],
  );
  // Reuses the exact same isInstallmentAtRisk() rule and the same
  // canonical settings.collections.atRiskOverdueDays value Collections
  // uses — this figure always reconciles with the Collections page's own
  // "At Risk" count for the same date range/merchant scope.
  const atRiskCount = useMemo(
    () =>
      installments.filter(
        (installment) =>
          isIsoDateInRange(installment.dueDate, range) &&
          (!merchantId || installment.merchantId === merchantId) &&
          isInstallmentAtRisk({ installment, followUps, thresholdDays: atRiskOverdueDays }),
      ).length,
    [installments, followUps, range, merchantId, atRiskOverdueDays],
  );
  const trend = useMemo(() => buildCollectionTrend(installments, range, merchantId), [installments, range, merchantId]);
  const breakdown = useMemo(() => {
    const scopedMerchants = merchantId ? merchants.filter((m) => m.id === merchantId) : merchants;
    return calculateMerchantCollectionBreakdown(scopedMerchants, installments, payments, range);
  }, [merchants, installments, payments, range, merchantId]);

  const columns: ColumnDef<MerchantCollectionBreakdownRow>[] = [
    { accessorKey: "businessName", header: "Merchant" },
    {
      accessorKey: "due",
      header: "Due",
      cell: ({ row }) => <span className="tabular-nums text-text-primary">{formatCompactInr(row.original.due)}</span>,
    },
    {
      accessorKey: "collected",
      header: "Collected",
      cell: ({ row }) => <span className="tabular-nums text-text-primary">{formatCompactInr(row.original.collected)}</span>,
    },
    {
      accessorKey: "overdue",
      header: "Overdue",
      cell: ({ row }) => (
        <span className={`tabular-nums ${row.original.overdue > 0 ? "text-error" : "text-text-primary"}`}>
          {formatCompactInr(row.original.overdue)}
        </span>
      ),
    },
    {
      accessorKey: "collectionRate",
      header: "Collection Rate",
      cell: ({ row }) => <span className="tabular-nums text-text-primary">{row.original.collectionRate}%</span>,
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <EntitySummaryGrid
        items={[
          { label: "Collected Amount", value: formatCompactInr(metrics.collectedAmount) },
          { label: "Due Amount", value: formatCompactInr(metrics.dueAmount) },
          {
            label: "Overdue Amount",
            value: formatCompactInr(metrics.overdueAmount),
            emphasis: metrics.overdueAmount > 0 ? "error" : "default",
          },
          { label: "Collection Rate", value: `${metrics.collectionRate}%` },
          { label: "Successful Collections", value: String(metrics.successfulCollections) },
          {
            label: "Failed Attempts",
            value: String(metrics.failedAttempts),
            emphasis: metrics.failedAttempts > 0 ? "warning" : "default",
          },
          {
            label: "At Risk Installments",
            value: String(atRiskCount),
            emphasis: atRiskCount > 0 ? "warning" : "default",
          },
        ]}
      />

      <ReportTrendChart
        title="Collected vs Due"
        subtitle="Installment schedule, over the selected period"
        data={trend}
        series={[
          { key: "collected", name: "Collected", color: "var(--success)" },
          { key: "due", name: "Due", color: "var(--warning)" },
        ]}
      />

      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h3 className="text-[13.5px] font-semibold text-text-primary">By Merchant</h3>
          <Button
            variant="outline"
            size="sm"
            className="h-8 gap-1.5 text-[12.5px]"
            onClick={() =>
              exportRowsToCsv("collections-by-merchant.csv", breakdown, [
                { header: "Merchant", accessor: (row) => row.businessName },
                { header: "Due", accessor: (row) => row.due },
                { header: "Collected", accessor: (row) => row.collected },
                { header: "Overdue", accessor: (row) => row.overdue },
                { header: "Collection Rate", accessor: (row) => `${row.collectionRate}%` },
              ])
            }
          >
            <Download className="size-3.5" />
            Export
          </Button>
        </div>
        <DataTable
          columns={columns}
          data={breakdown}
          enablePagination
          pageSize={10}
          stickyHeader
          tableClassName="min-w-[750px]"
          emptyState={<span className="text-[13px] text-text-muted">No merchant activity in this period.</span>}
        />
      </div>
    </div>
  );
}
