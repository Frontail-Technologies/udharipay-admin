"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import type { ColumnDef } from "@tanstack/react-table";
import { Download } from "lucide-react";
import { EntitySummaryGrid } from "@/components/entity/EntitySummaryGrid";
import { DataTable } from "@/components/table/DataTable";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { Button } from "@/components/ui/button";
import { useAdminPlans, useAdminCustomers, useAdminMerchants } from "@/hooks/useAdminEntities";
import { calculatePlanMetrics, breakdownPlansByFrequency, breakdownPlansByStatus } from "@/data/admin/reports";
import type { DerivedPlan } from "@/data/admin";
import { planStatusTone } from "@/data/admin/statusTones";
import { formatCompactInr, humanizeSnakeCase } from "@/lib/format";
import { exportRowsToCsv } from "@/lib/csv";

/**
 * This is a receivable-schedule report, not a lending-returns report — no
 * APR, interest yield, or loan-book terminology anywhere here.
 */
export function PlansReportTab({ merchantId }: { merchantId?: string }) {
  const plans = useAdminPlans();
  const customers = useAdminCustomers();
  const merchants = useAdminMerchants();
  const router = useRouter();

  const scopedPlans = merchantId ? plans.filter((plan) => plan.merchantId === merchantId) : plans;
  const customerNameById = useMemo(() => new Map(customers.map((c) => [c.id, c.name])), [customers]);
  const merchantNameById = useMemo(() => new Map(merchants.map((m) => [m.id, m.businessName])), [merchants]);

  const metrics = useMemo(() => calculatePlanMetrics(scopedPlans), [scopedPlans]);
  const frequencyBreakdown = useMemo(() => breakdownPlansByFrequency(scopedPlans), [scopedPlans]);
  const statusBreakdown = useMemo(() => breakdownPlansByStatus(scopedPlans), [scopedPlans]);

  const columns: ColumnDef<DerivedPlan>[] = [
    { accessorKey: "id", header: "Plan" },
    {
      id: "customer",
      header: "Customer",
      cell: ({ row }) => <span className="text-text-secondary">{customerNameById.get(row.original.customerId) ?? "—"}</span>,
    },
    {
      id: "merchant",
      header: "Merchant",
      cell: ({ row }) => <span className="text-text-secondary">{merchantNameById.get(row.original.merchantId) ?? "—"}</span>,
    },
    {
      accessorKey: "originalAmount",
      header: "Original",
      cell: ({ row }) => <span className="tabular-nums text-text-primary">{formatCompactInr(row.original.originalAmount)}</span>,
    },
    {
      accessorKey: "collectedAmount",
      header: "Collected",
      cell: ({ row }) => <span className="tabular-nums text-text-primary">{formatCompactInr(row.original.collectedAmount)}</span>,
    },
    {
      accessorKey: "remainingAmount",
      header: "Outstanding",
      cell: ({ row }) => <span className="tabular-nums text-text-primary">{formatCompactInr(row.original.remainingAmount)}</span>,
    },
    { accessorKey: "totalInstallments", header: "Collections" },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <StatusBadge tone={planStatusTone[row.original.status]}>{humanizeSnakeCase(row.original.status)}</StatusBadge>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <EntitySummaryGrid
        items={[
          { label: "Active Plans", value: String(metrics.activePlans) },
          { label: "Completed Plans", value: String(metrics.completedPlans) },
          {
            label: "Overdue Plans",
            value: String(metrics.overduePlans),
            emphasis: metrics.overduePlans > 0 ? "error" : "default",
          },
          { label: "Average Plan Size", value: formatCompactInr(metrics.averagePlanSize) },
          { label: "Avg. Collections / Plan", value: formatCompactInr(metrics.averageCollectionsPerPlan) },
        ]}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-lg border border-border bg-surface p-4">
          <h3 className="text-[13px] font-semibold text-text-primary">By Frequency</h3>
          <ul className="mt-3 flex flex-col gap-2">
            {frequencyBreakdown.map((row) => (
              <li key={row.key} className="flex items-center justify-between text-[12.5px]">
                <span className="capitalize text-text-secondary">{row.key}</span>
                <span className="font-semibold tabular-nums text-text-primary">{row.count}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-lg border border-border bg-surface p-4">
          <h3 className="text-[13px] font-semibold text-text-primary">By Status</h3>
          <ul className="mt-3 flex flex-col gap-2">
            {statusBreakdown.map((row) => (
              <li key={row.key} className="flex items-center justify-between text-[12.5px]">
                <StatusBadge tone={planStatusTone[row.key]}>{humanizeSnakeCase(row.key)}</StatusBadge>
                <span className="font-semibold tabular-nums text-text-primary">{row.count}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h3 className="text-[13.5px] font-semibold text-text-primary">Plans</h3>
          <Button
            variant="outline"
            size="sm"
            className="h-8 gap-1.5 text-[12.5px]"
            onClick={() =>
              exportRowsToCsv("plans-report.csv", scopedPlans, [
                { header: "Plan", accessor: (row) => row.id },
                { header: "Customer", accessor: (row) => customerNameById.get(row.customerId) ?? "" },
                { header: "Merchant", accessor: (row) => merchantNameById.get(row.merchantId) ?? "" },
                { header: "Original", accessor: (row) => row.originalAmount },
                { header: "Collected", accessor: (row) => row.collectedAmount },
                { header: "Outstanding", accessor: (row) => row.remainingAmount },
                { header: "Collections", accessor: (row) => row.totalInstallments },
                { header: "Status", accessor: (row) => humanizeSnakeCase(row.status) },
              ])
            }
          >
            <Download className="size-3.5" />
            Export
          </Button>
        </div>
        <DataTable
          columns={columns}
          data={scopedPlans}
          enablePagination
          pageSize={10}
          stickyHeader
          tableClassName="min-w-[1100px]"
          onRowClick={(row) => router.push(`/plans/${row.id}`)}
          emptyState={<span className="text-[13px] text-text-muted">No plans match this scope.</span>}
        />
      </div>
    </div>
  );
}
