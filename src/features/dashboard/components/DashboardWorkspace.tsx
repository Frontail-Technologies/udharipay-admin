"use client";

import { RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { useDashboard } from "@/features/dashboard/hooks/useDashboard";
import { dashboardPeriodOptions, type DashboardPeriod } from "@/features/dashboard/utils/period";
import { DashboardPrimaryMetrics, DashboardSecondaryMetrics } from "@/features/dashboard/components/DashboardMetrics";
import { NeedsAttention } from "@/features/dashboard/components/NeedsAttention";
import { RecentActivity } from "@/features/dashboard/components/RecentActivity";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

export function DashboardWorkspace() {
  const dashboard = useDashboard();

  return <div className="mx-auto flex max-w-7xl min-w-0 flex-col gap-5 sm:gap-6">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="min-w-0">
        <h1 className="text-[22px] font-semibold tracking-tight text-text-primary sm:text-[26px]">Good morning, Admin</h1>
        <p className="text-[13px] text-text-secondary">Platform overview for the selected period.</p>
      </div>
      <div className="flex items-center gap-2">
        <Select value={dashboard.period} onValueChange={(value) => dashboard.setPeriod(value as DashboardPeriod)}>
          <SelectTrigger className="h-9 w-32 text-[13px] sm:w-36" aria-label="Date range"><SelectValue /></SelectTrigger>
          <SelectContent>{dashboardPeriodOptions.map((option) => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}</SelectContent>
        </Select>
        <Button variant="outline" size="sm" className="h-9 gap-1.5 text-[13px]" onClick={() => { dashboard.refresh(); toast.success("Dashboard refreshed"); }}>
          <RefreshCw className="size-3.5" />
          <span className="hidden sm:inline">Refresh</span>
        </Button>
      </div>
    </div>

    <DashboardPrimaryMetrics dashboard={dashboard} />
    <DashboardSecondaryMetrics dashboard={dashboard} />

    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(280px,1fr)_minmax(0,2fr)] lg:items-stretch">
      <div className="min-w-0"><NeedsAttention dashboard={dashboard} /></div>
      <div className="min-w-0"><RecentActivity dashboard={dashboard} /></div>
    </div>
  </div>;
}
