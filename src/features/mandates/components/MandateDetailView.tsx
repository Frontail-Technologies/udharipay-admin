"use client";

import Link from "next/link";
import { normalizeApiError } from "@/api/http/errors";
import { useMandate } from "@/features/mandates/hooks/useMandates";
import { mandateMethodLabels, mandateStatusTone } from "@/features/mandates/utils/metadata";
import { MandateOverview } from "@/features/mandates/components/MandateOverview";
import { MandateAttempts } from "@/features/mandates/components/MandateAttempts";
import { EntityPageHeader } from "@/components/entity/EntityPageHeader";
import { EntitySummaryGrid } from "@/components/entity/EntitySummaryGrid";
import { EntityTabs } from "@/components/entity/EntityTabs";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatPaiseInr, humanizeSnakeCase } from "@/lib/format";
import { formatTimestamp } from "@/shared/utils/date";

const TABS = [{ value: "overview", label: "Overview" }, { value: "attempts", label: "Attempts" }];

export function MandateDetailView({ mandateId, defaultTab }: { mandateId: string; defaultTab: string }) {
  const query = useMandate(mandateId);
  if (query.isPending) return <div className="mx-auto flex max-w-6xl flex-col gap-5"><Skeleton className="h-24 w-full" /><Skeleton className="h-24 w-full" /><Skeleton className="h-64 w-full" /></div>;
  if (query.isError) return <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-8 text-center text-[13px] text-destructive">{normalizeApiError(query.error).message}</div>;
  const mandate = query.data.data;
  return <div className="mx-auto flex max-w-6xl min-w-0 flex-col gap-5"><EntityPageHeader backHref={`/mandates?merchantId=${mandate.merchantId}&customerId=${mandate.customerId}`} avatarLabel="MD" title={mandate.publicId} meta={mandate.planId ? "Plan-specific authorization" : "Customer-level authorization"} badges={<><StatusBadge tone={mandateStatusTone[mandate.status]}>{humanizeSnakeCase(mandate.status)}</StatusBadge><StatusBadge tone="neutral">{mandateMethodLabels[mandate.method]}</StatusBadge></>} actions={<Button variant="outline" size="sm" asChild className="h-8 text-[12.5px]"><Link href={`/customers/${mandate.customerId}`}>View Customer</Link></Button>} /><EntitySummaryGrid items={[{ label: "Status", value: humanizeSnakeCase(mandate.status) }, { label: "Method", value: mandateMethodLabels[mandate.method] }, { label: "Maximum Amount", value: mandate.maxAmountPaise ? formatPaiseInr(mandate.maxAmountPaise) : "Not set" }, { label: "Expires", value: formatTimestamp(mandate.expiresAt) }]} /><EntityTabs tabs={TABS} defaultValue={defaultTab} panels={{ overview: <MandateOverview mandate={mandate} />, attempts: <MandateAttempts mandateId={mandate.id} /> }} /></div>;
}
