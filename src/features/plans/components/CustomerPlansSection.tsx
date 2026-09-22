"use client";

import Link from "next/link";
import { normalizeApiError } from "@/api/http/errors";
import { usePlans } from "@/features/plans/hooks/usePlans";
import { CreatePlanDialog } from "@/features/plans/components/CreatePlanDialog";
import { PlanListTable } from "@/features/plans/components/PlanListTable";
import { Button } from "@/components/ui/button";

export function CustomerPlansSection({ customerId, merchantId }: { customerId: string; merchantId: string }) {
  const query = usePlans(customerId, { limit: 10 });
  if (query.isError) return <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-8 text-center text-[13px] text-destructive">{normalizeApiError(query.error).message}</div>;
  const plans = query.data?.data.items ?? [];
  return <section className="flex flex-col gap-3"><div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-[15px] font-semibold text-text-primary">Udhaar Plans</h2><p className="mt-0.5 text-[12px] text-text-muted">Contractual plans and backend-generated installment schedules.</p></div><div className="flex items-center gap-2"><Button variant="outline" size="sm" asChild className="h-9"><Link href={`/plans?merchantId=${merchantId}&customerId=${customerId}`}>View All</Link></Button><CreatePlanDialog customerId={customerId} /></div></div><PlanListTable plans={plans} isLoading={query.isPending} /></section>;
}
