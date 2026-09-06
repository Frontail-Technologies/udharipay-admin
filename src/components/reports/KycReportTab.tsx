"use client";

import { useMemo } from "react";
import { EntitySummaryGrid } from "@/components/entity/EntitySummaryGrid";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { useAdminKycReviews } from "@/hooks/useAdminEntities";
import {
  calculateKycMetrics,
  buildKycAgingBreakdown,
  breakdownKycByEntityType,
  breakdownKycByStatus,
  type ReportDateRange,
} from "@/data/admin/reports";
import { kycReviewStatusTone } from "@/data/admin/statusTones";
import { humanizeSnakeCase } from "@/lib/format";

/**
 * Terminology note: there is no formal SLA defined for KYC review turnaround
 * in this app, so nothing here is ever labeled an "SLA breach" — only
 * "Review Age" / "Aging" / "Pending for N days".
 */
export function KycReportTab({ range }: { range: ReportDateRange }) {
  const reviews = useAdminKycReviews();

  const metrics = useMemo(() => calculateKycMetrics(reviews, range), [reviews, range]);
  const aging = useMemo(() => buildKycAgingBreakdown(reviews), [reviews]);
  const entityTypeBreakdown = useMemo(() => breakdownKycByEntityType(reviews), [reviews]);
  const statusBreakdown = useMemo(() => breakdownKycByStatus(reviews), [reviews]);

  return (
    <div className="flex flex-col gap-4">
      <EntitySummaryGrid
        items={[
          { label: "Pending", value: String(metrics.pending) },
          { label: "In Review", value: String(metrics.inReview) },
          { label: "Approved in Period", value: String(metrics.approvedInPeriod) },
          { label: "Rejected", value: String(metrics.rejected), emphasis: metrics.rejected > 0 ? "error" : "default" },
          { label: "Resubmission Required", value: String(metrics.resubmissionRequired) },
          {
            label: "Avg. Review Age",
            value: metrics.averageReviewAgeDays !== null ? `${metrics.averageReviewAgeDays}d` : "—",
          },
        ]}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-lg border border-border bg-surface p-4">
          <h3 className="text-[13px] font-semibold text-text-primary">By Entity Type</h3>
          <ul className="mt-3 flex flex-col gap-2">
            {entityTypeBreakdown.map((row) => (
              <li key={row.key} className="flex items-center justify-between text-[12.5px]">
                <span className="capitalize text-text-secondary">{row.key}</span>
                <span className="font-semibold tabular-nums text-text-primary">{row.count}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-lg border border-border bg-surface p-4">
          <h3 className="text-[13px] font-semibold text-text-primary">By Review Status</h3>
          <ul className="mt-3 flex flex-col gap-2">
            {statusBreakdown.map((row) => (
              <li key={row.key} className="flex items-center justify-between text-[12.5px]">
                <StatusBadge tone={kycReviewStatusTone[row.key]}>{humanizeSnakeCase(row.key)}</StatusBadge>
                <span className="font-semibold tabular-nums text-text-primary">{row.count}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-surface p-4">
        <h3 className="text-[13px] font-semibold text-text-primary">Queue Aging</h3>
        <p className="mt-0.5 text-[11px] text-text-muted">Open reviews (pending / in review / resubmission required) by days pending.</p>
        <div className="mt-3 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
          {aging.map((bucket) => (
            <div key={bucket.bucket} className="rounded-lg border border-border bg-surface-muted/40 px-3 py-2.5 text-center">
              <p className="text-[18px] font-semibold tabular-nums text-text-primary">{bucket.count}</p>
              <p className="mt-0.5 text-[11px] text-text-muted">{bucket.bucket} days</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
