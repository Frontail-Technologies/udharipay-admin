"use client";

import { useMemo } from "react";
import { EntitySummaryGrid } from "@/components/entity/EntitySummaryGrid";
import { ReportTrendChart } from "@/components/reports/ReportTrendChart";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { useAdminMandates, useAdminMandateAttemptsByMandate } from "@/hooks/useAdminEntities";
import {
  calculateMandateMetrics,
  breakdownMandatesByMethod,
  breakdownMandatesByStatus,
  breakdownMandatesByProvider,
  buildMandateAttemptTrend,
  MANDATE_ATTEMPT_TREND_MIN_VOLUME,
  type ReportDateRange,
} from "@/data/admin/reports";
import { mandateOperationalStatusTone } from "@/data/admin/statusTones";
import { humanizeSnakeCase } from "@/lib/format";

/**
 * Strict separation kept here: a successful mandate ATTEMPT is never
 * treated as a customer Payment. This report only ever counts attempt
 * records (mandateAttempts.ts) — it never touches payments.ts/installments.ts.
 */
export function MandatesReportTab({ range, merchantId }: { range: ReportDateRange; merchantId?: string }) {
  const allMandates = useAdminMandates();
  const allAttempts = useAdminMandateAttemptsByMandate(undefined);

  const mandates = useMemo(
    () => (merchantId ? allMandates.filter((mandate) => mandate.merchantId === merchantId) : allMandates),
    [allMandates, merchantId],
  );
  const mandateIds = useMemo(() => new Set(mandates.map((mandate) => mandate.id)), [mandates]);
  const attempts = useMemo(() => allAttempts.filter((attempt) => mandateIds.has(attempt.mandateId)), [allAttempts, mandateIds]);

  const metrics = useMemo(() => calculateMandateMetrics(mandates, attempts), [mandates, attempts]);
  const methodBreakdown = useMemo(() => breakdownMandatesByMethod(mandates), [mandates]);
  const statusBreakdown = useMemo(() => breakdownMandatesByStatus(mandates), [mandates]);
  const providerBreakdown = useMemo(() => breakdownMandatesByProvider(mandates), [mandates]);
  const trend = useMemo(() => buildMandateAttemptTrend(attempts, range), [attempts, range]);

  return (
    <div className="flex flex-col gap-4">
      <EntitySummaryGrid
        items={[
          { label: "Active Mandates", value: String(metrics.activeMandates) },
          { label: "Pending Authorization", value: String(metrics.pendingAuthorization) },
          {
            label: "Needing Action",
            value: String(metrics.needingAction),
            emphasis: metrics.needingAction > 0 ? "warning" : "default",
          },
          { label: "Authorization Rate", value: `${metrics.authorizationRate}%` },
          {
            label: "Debit Attempt Success Rate",
            value: metrics.attemptSuccessRate !== null ? `${metrics.attemptSuccessRate}%` : "—",
          },
        ]}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-border bg-surface p-4">
          <h3 className="text-[13px] font-semibold text-text-primary">By Method</h3>
          <ul className="mt-3 flex flex-col gap-2">
            {methodBreakdown.map((row) => (
              <li key={row.key} className="flex items-center justify-between text-[12.5px]">
                <span className="text-text-secondary">{row.key}</span>
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
                <StatusBadge tone={mandateOperationalStatusTone[row.key]}>{humanizeSnakeCase(row.key)}</StatusBadge>
                <span className="font-semibold tabular-nums text-text-primary">{row.count}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-lg border border-border bg-surface p-4">
          <h3 className="text-[13px] font-semibold text-text-primary">By Provider</h3>
          <ul className="mt-3 flex flex-col gap-2">
            {providerBreakdown.map((row) => (
              <li key={row.key} className="flex items-center justify-between text-[12.5px]">
                <span className="text-text-secondary">{row.key}</span>
                <span className="font-semibold tabular-nums text-text-primary">{row.count}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <ReportTrendChart
        title="Debit Attempt Success"
        subtitle="Weekly success vs failure count"
        data={trend}
        series={[
          { key: "success", name: "Success", color: "var(--success)" },
          { key: "failed", name: "Failed", color: "var(--error)" },
        ]}
        valueFormatter={(value) => String(value)}
        emptyLabel={`Not enough attempt volume in this period for a trend (fewer than ${MANDATE_ATTEMPT_TREND_MIN_VOLUME} resolved attempts).`}
      />
    </div>
  );
}
