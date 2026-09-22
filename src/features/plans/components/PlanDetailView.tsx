"use client";

import { normalizeApiError } from "@/api/http/errors";
import { usePlan } from "@/features/plans/hooks/usePlans";
import { planFrequencyLabels, planStatusTone } from "@/features/plans/utils/metadata";
import { PlanOverview } from "@/features/plans/components/PlanOverview";
import { PlanSchedule } from "@/features/plans/components/PlanSchedule";
import { EntityPageHeader } from "@/components/entity/EntityPageHeader";
import { EntitySummaryGrid } from "@/components/entity/EntitySummaryGrid";
import { EntityTabs } from "@/components/entity/EntityTabs";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate, formatPaiseInr, humanizeSnakeCase } from "@/lib/format";

const TABS = [{ value: "overview", label: "Overview" }, { value: "schedule", label: "Installment Schedule" }];

export function PlanDetailView({ planId, defaultTab }: { planId: string; defaultTab: string }) {
  const query = usePlan(planId);
  if (query.isPending) return <div className="mx-auto flex max-w-6xl flex-col gap-5"><Skeleton className="h-24 w-full" /><Skeleton className="h-24 w-full" /><Skeleton className="h-64 w-full" /></div>;
  if (query.isError) return <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-8 text-center text-[13px] text-destructive">{normalizeApiError(query.error).message}</div>;
  const plan = query.data.data;
  return <div className="mx-auto flex max-w-6xl min-w-0 flex-col gap-5"><EntityPageHeader backHref={`/plans?merchantId=${plan.merchantId}&customerId=${plan.customerId}`} avatarLabel="PL" title={plan.publicId} meta={plan.description} badges={<StatusBadge tone={planStatusTone[plan.status]}>{humanizeSnakeCase(plan.status)}</StatusBadge>} /><EntitySummaryGrid items={[{ label: "Original Udhaar", value: formatPaiseInr(plan.originalAmountPaise) }, { label: "Collections", value: String(plan.numberOfCollections) }, { label: "Frequency", value: planFrequencyLabels[plan.frequency] }, { label: "Start Date", value: formatDate(plan.startDate) }]} /><EntityTabs tabs={TABS} defaultValue={defaultTab} panels={{ overview: <PlanOverview plan={plan} />, schedule: <PlanSchedule installments={plan.installments} /> }} /></div>;
}
