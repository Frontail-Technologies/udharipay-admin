"use client";

import Link from "next/link";
import { normalizeApiError } from "@/api/http/errors";
import { useMandates } from "@/features/mandates/hooks/useMandates";
import { MandateListTable } from "@/features/mandates/components/MandateListTable";
import { Button } from "@/components/ui/button";

export function CustomerMandatesSection({ customerId, merchantId }: { customerId: string; merchantId: string }) {
  const query = useMandates(customerId, { limit: 10 });
  if (query.isError) return <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-8 text-center text-[13px] text-destructive">{normalizeApiError(query.error).message}</div>;
  return <section className="flex flex-col gap-3"><div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-[15px] font-semibold text-text-primary">Mandates</h2><p className="mt-0.5 text-[12px] text-text-muted">Customer payment authorizations and provider-neutral lifecycle status.</p></div><Button variant="outline" size="sm" asChild className="h-9"><Link href={`/mandates?merchantId=${merchantId}&customerId=${customerId}`}>View All</Link></Button></div><MandateListTable mandates={query.data?.data.items ?? []} isLoading={query.isPending} /></section>;
}
