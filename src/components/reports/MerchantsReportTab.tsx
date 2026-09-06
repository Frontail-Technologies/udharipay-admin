"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { ColumnDef } from "@tanstack/react-table";
import { Download } from "lucide-react";
import { DataTable } from "@/components/table/DataTable";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAdminMerchants, useAdminInstallments, useAdminPayments, useAdminMandates } from "@/hooks/useAdminEntities";
import { calculateMerchantReport, type MerchantReportRow, type ReportDateRange } from "@/data/admin/reports";
import { formatCompactInr, humanizeSnakeCase } from "@/lib/format";
import { exportRowsToCsv } from "@/lib/csv";

const MANDATE_HEALTH_TONE = { healthy: "success", attention: "warning", none: "neutral" } as const;

type RankBy = "none" | "outstanding" | "collection_rate" | "overdue";

const RANK_OPTIONS: { value: RankBy; label: string }[] = [
  { value: "none", label: "Default order" },
  { value: "outstanding", label: "Highest Outstanding" },
  { value: "collection_rate", label: "Best Collection Rate" },
  { value: "overdue", label: "Most Overdue" },
];

/**
 * Merchant rows link to the existing Merchant Detail page — no separate
 * report-specific merchant detail is built here.
 */
export function MerchantsReportTab({ range, merchantId }: { range: ReportDateRange; merchantId?: string }) {
  const merchants = useAdminMerchants();
  const installments = useAdminInstallments();
  const payments = useAdminPayments();
  const mandates = useAdminMandates();
  const router = useRouter();
  const [rankBy, setRankBy] = useState<RankBy>("none");

  const rows = useMemo(() => {
    const scoped = merchantId ? merchants.filter((m) => m.id === merchantId) : merchants;
    const report = calculateMerchantReport(scoped, installments, payments, mandates, range);
    if (rankBy === "outstanding") return [...report].sort((a, b) => b.outstanding - a.outstanding);
    if (rankBy === "collection_rate") return [...report].sort((a, b) => b.collectionRate - a.collectionRate);
    if (rankBy === "overdue") return [...report].sort((a, b) => b.overdue - a.overdue);
    return report;
  }, [merchants, installments, payments, mandates, range, merchantId, rankBy]);

  const columns: ColumnDef<MerchantReportRow>[] = [
    { accessorKey: "businessName", header: "Merchant" },
    { accessorKey: "customers", header: "Customers" },
    { accessorKey: "activePlans", header: "Active Plans" },
    {
      accessorKey: "outstanding",
      header: "Outstanding",
      cell: ({ row }) => <span className="tabular-nums text-text-primary">{formatCompactInr(row.original.outstanding)}</span>,
    },
    {
      accessorKey: "collectedInPeriod",
      header: "Collected in Period",
      cell: ({ row }) => <span className="tabular-nums text-text-primary">{formatCompactInr(row.original.collectedInPeriod)}</span>,
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
    {
      id: "mandateHealth",
      header: "Mandate Health",
      cell: ({ row }) => (
        <StatusBadge tone={MANDATE_HEALTH_TONE[row.original.mandateHealth.tone]}>
          {row.original.mandateHealth.label}
        </StatusBadge>
      ),
    },
    {
      accessorKey: "subscriptionStatus",
      header: "Subscription",
      cell: ({ row }) => <span className="text-text-secondary">{humanizeSnakeCase(row.original.subscriptionStatus)}</span>,
    },
  ];

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <Select value={rankBy} onValueChange={(value) => setRankBy(value as RankBy)}>
          <SelectTrigger className="h-8 w-48 text-[12.5px]" aria-label="Rank merchants by">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {RANK_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          variant="outline"
          size="sm"
          className="ml-auto h-8 gap-1.5 text-[12.5px]"
          onClick={() =>
            exportRowsToCsv("merchants-report.csv", rows, [
              { header: "Merchant", accessor: (row) => row.businessName },
              { header: "Customers", accessor: (row) => row.customers },
              { header: "Active Plans", accessor: (row) => row.activePlans },
              { header: "Outstanding", accessor: (row) => row.outstanding },
              { header: "Collected in Period", accessor: (row) => row.collectedInPeriod },
              { header: "Overdue", accessor: (row) => row.overdue },
              { header: "Collection Rate", accessor: (row) => `${row.collectionRate}%` },
              { header: "Mandate Health", accessor: (row) => row.mandateHealth.label },
              { header: "Subscription Status", accessor: (row) => humanizeSnakeCase(row.subscriptionStatus) },
            ])
          }
        >
          <Download className="size-3.5" />
          Export
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={rows}
        enablePagination
        pageSize={10}
        stickyHeader
        tableClassName="min-w-[1150px]"
        onRowClick={(row) => router.push(`/merchants/${row.merchantId}`)}
        emptyState={<span className="text-[13px] text-text-muted">No merchants match this scope.</span>}
      />
    </div>
  );
}
