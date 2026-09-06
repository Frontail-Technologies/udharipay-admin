"use client";

import { useMemo } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { EntitySummaryGrid } from "@/components/entity/EntitySummaryGrid";
import { ChartCard } from "@/components/dashboard/ChartCard";
import { CHART_AREA_HEIGHT_CLASS } from "@/components/dashboard/chartLayout";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { useAdminSubscriptions, useAdminSubscriptionInvoices } from "@/hooks/useAdminEntities";
import {
  calculateSubscriptionMetrics,
  breakdownSubscriptionsByPlan,
  breakdownSubscriptionsByStatus,
  breakdownInvoicesByStatus,
  type ReportDateRange,
} from "@/data/admin/reports";
import { subscriptionOperationalStatusTone, subscriptionInvoiceStatusTone } from "@/data/admin/statusTones";
import { formatCompactInr, humanizeSnakeCase } from "@/lib/format";

/**
 * UdhariPay's own SaaS/business revenue report. This tab is deliberately
 * NOT scoped by the top Merchant filter — Subscriptions is a platform-wide
 * revenue view (a single merchant's subscription already has its own page
 * at Merchant Detail -> Subscription and /subscriptions/[id]); filtering
 * MRR down to one merchant here would read as the wrong number for what
 * this report answers. Customer collections never enter any figure below.
 */
export function SubscriptionsReportTab({ range }: { range: ReportDateRange }) {
  const subscriptions = useAdminSubscriptions();
  const invoices = useAdminSubscriptionInvoices();

  const metrics = useMemo(() => calculateSubscriptionMetrics(subscriptions, invoices, range), [subscriptions, invoices, range]);
  const planBreakdown = useMemo(() => breakdownSubscriptionsByPlan(subscriptions), [subscriptions]);
  const statusBreakdown = useMemo(() => breakdownSubscriptionsByStatus(subscriptions), [subscriptions]);
  const billingStatusBreakdown = useMemo(() => breakdownInvoicesByStatus(invoices), [invoices]);

  return (
    <div className="flex flex-col gap-4">
      <EntitySummaryGrid
        items={[
          { label: "MRR", value: formatCompactInr(metrics.mrr) },
          { label: "Active Subscriptions", value: String(metrics.activeSubscriptions) },
          {
            label: "Past Due",
            value: String(metrics.pastDue),
            emphasis: metrics.pastDue > 0 ? "warning" : "default",
          },
          { label: "Activation Fees Collected", value: formatCompactInr(metrics.activationFeesCollected) },
          { label: "Activation Fees Pending", value: String(metrics.activationFeesPending) },
          { label: "Subscription Billing Collected", value: formatCompactInr(metrics.subscriptionBillingCollected) },
          { label: "Cancelled in Period", value: String(metrics.cancelledInPeriod) },
        ]}
      />

      <ChartCard title="MRR by Plan" subtitle="Active subscriptions only">
        {planBreakdown.every((row) => row.mrr === 0) ? (
          <div className="flex h-full min-h-[180px] items-center justify-center rounded-lg border border-dashed border-border-strong bg-surface-muted/40">
            <p className="text-[12.5px] text-text-muted">No active subscription revenue yet.</p>
          </div>
        ) : (
          <div className={CHART_AREA_HEIGHT_CLASS}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={planBreakdown} margin={{ top: 8, right: 4, left: -16, bottom: 0 }}>
                <CartesianGrid vertical={false} stroke="var(--border)" strokeOpacity={0.5} strokeDasharray="3 3" />
                <XAxis dataKey="key" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "var(--text-muted)" }} />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={formatCompactInr}
                  tick={{ fontSize: 11, fill: "var(--text-muted)" }}
                  tickCount={4}
                  width={44}
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (!active || !payload?.length) return null;
                    return (
                      <div className="rounded-xl border border-border bg-surface px-3 py-2.5 shadow-md">
                        <p className="text-[11px] font-medium text-text-muted">{label}</p>
                        <p className="mt-1 text-[12.5px] font-semibold tabular-nums text-text-primary">
                          {formatCompactInr(payload[0].value as number)}
                        </p>
                      </div>
                    );
                  }}
                  cursor={{ fill: "var(--surface-hover)" }}
                />
                <Bar dataKey="mrr" name="MRR" fill="var(--primary)" radius={[6, 6, 0, 0]} maxBarSize={48} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </ChartCard>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-lg border border-border bg-surface p-4">
          <h3 className="text-[13px] font-semibold text-text-primary">By Subscription Status</h3>
          <ul className="mt-3 flex flex-col gap-2">
            {statusBreakdown.map((row) => (
              <li key={row.key} className="flex items-center justify-between text-[12.5px]">
                <StatusBadge tone={subscriptionOperationalStatusTone[row.key]}>{humanizeSnakeCase(row.key)}</StatusBadge>
                <span className="font-semibold tabular-nums text-text-primary">{row.count}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-lg border border-border bg-surface p-4">
          <h3 className="text-[13px] font-semibold text-text-primary">By Billing Status</h3>
          <ul className="mt-3 flex flex-col gap-2">
            {billingStatusBreakdown.map((row) => (
              <li key={row.key} className="flex items-center justify-between text-[12.5px]">
                <StatusBadge tone={subscriptionInvoiceStatusTone[row.key]}>{humanizeSnakeCase(row.key)}</StatusBadge>
                <span className="font-semibold tabular-nums text-text-primary">{row.count}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
