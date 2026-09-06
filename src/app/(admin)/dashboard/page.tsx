"use client";

import { useMemo } from "react";
import { RefreshCw } from "lucide-react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  MetricCard,
  SecondaryMetricCard,
} from "@/components/dashboard/MetricCard";
import { CollectionTrendChart } from "@/components/dashboard/CollectionTrendChart";
import { StatusBreakdownChart } from "@/components/dashboard/StatusBreakdownChart";
import { NeedsAttention } from "@/components/dashboard/NeedsAttention";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { primaryMetrics, secondaryMetrics } from "@/data/admin-demo-data";
import { ANALYTICS_ROW_HEIGHT_CLASS } from "@/components/dashboard/chartLayout";
import { useAdminInstallments, useAdminPlans, useAdminMandates } from "@/hooks/useAdminEntities";
import { countMandateIssues } from "@/data/admin/reports";
import { formatCompactInr } from "@/lib/format";

/**
 * Phase 4 audit flagged "Active Udhaar Plans", "Overdue", "Due Today" and
 * "Mandate Issues" as disconnected static facts now that canonical
 * Plan/Installment/Mandate data exists. All four are recomputed here from
 * that canonical data — same card style, same icon/tone, only the value
 * source changed. `primaryMetrics` (Active Merchants, Active Customers,
 * Outstanding Amount, Collected This Month) is intentionally left as
 * explicit demo presentation data: the seed dataset only has ~16 merchants
 * and ~65 customers, far below the hero-scale numbers the approved design
 * shows, and Part A's scope was the Mandate/Plan/Installment-shaped
 * figures, not merchant/customer volume.
 */
export default function DashboardPage() {
  const installments = useAdminInstallments();
  const plans = useAdminPlans();
  const mandates = useAdminMandates();

  const liveSecondaryMetrics = useMemo(() => {
    const dueTodayAmount = installments
      .filter((installment) => installment.status === "due")
      .reduce((sum, installment) => sum + installment.amount, 0);
    const overdueAmount = installments
      .filter((installment) => installment.status === "overdue")
      .reduce((sum, installment) => sum + installment.amount, 0);
    const activePlanCount = plans.filter((plan) => plan.status !== "completed").length;
    // Same isMandateIssue() definition the Mandates Report uses for
    // "Mandates Needing Action" — this number always reconciles with /mandates.
    const mandateIssueCount = countMandateIssues(mandates);

    const overrides: Record<string, string> = {
      "due-today": formatCompactInr(dueTodayAmount),
      overdue: formatCompactInr(overdueAmount),
      "active-plans": activePlanCount.toLocaleString("en-IN"),
      "mandate-issues": String(mandateIssueCount),
    };

    return secondaryMetrics.map((metric) =>
      overrides[metric.id] !== undefined ? { ...metric, value: overrides[metric.id] } : metric,
    );
  }, [installments, plans, mandates]);

  return (
    <div className="mx-auto flex max-w-7xl min-w-0 flex-col gap-5 sm:gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-[22px] font-semibold tracking-tight text-text-primary sm:text-[26px]">
            Good morning, Admin
          </h1>
          <p className="text-[13px] text-text-secondary">
            Platform overview and collection performance.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select defaultValue="30d">
            <SelectTrigger
              className="h-9 w-32 text-[13px] sm:w-36"
              aria-label="Date range"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">7 Days</SelectItem>
              <SelectItem value="30d">30 Days</SelectItem>
              <SelectItem value="90d">90 Days</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="sm"
            className="h-9 gap-1.5 text-[13px]"
            onClick={() => toast.success("Dashboard refreshed")}
          >
            <RefreshCw className="size-3.5" />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
        </div>
      </div>

      {/* Row 1: primary KPIs — CSS grid, items-stretch is the grid default, h-full on each card fills it. */}
      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 xl:grid-cols-4">
        {primaryMetrics.map((metric) => (
          <MetricCard key={metric.id} {...metric} />
        ))}
      </div>

      {/* Row 2: secondary KPIs */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {liveSecondaryMetrics.map((metric) => (
          <SecondaryMetricCard key={metric.id} {...metric} />
        ))}
      </div>

      {/* Row 3: analytics — 2fr/1fr, row height locked from lg up so both panels match. */}
      <div
        className={`grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(300px,1fr)] lg:items-stretch ${ANALYTICS_ROW_HEIGHT_CLASS}`}
      >
        <div className="min-w-0">
          <CollectionTrendChart />
        </div>
        <div className="min-w-0">
          <StatusBreakdownChart />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(280px,1fr)_minmax(0,2fr)] lg:items-stretch">
        <div className="min-w-0">
          <NeedsAttention />
        </div>
        <div className="min-w-0">
          <RecentActivity />
        </div>
      </div>
    </div>
  );
}
