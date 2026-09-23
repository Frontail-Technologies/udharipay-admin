"use client";

import Link from "next/link";
import { normalizeApiError } from "@/api/http/errors";
import { usePayment } from "@/features/payments/hooks/usePayments";
import { formatPaymentTimestamp, paymentMethodLabels, paymentSourceLabels, paymentStatusTone, sumAllocationPaise } from "@/features/payments/utils/metadata";
import { PaymentAllocations } from "@/features/payments/components/PaymentAllocations";
import { EntityPageHeader } from "@/components/entity/EntityPageHeader";
import { EntitySummaryGrid } from "@/components/entity/EntitySummaryGrid";
import { DetailSection } from "@/components/entity/DetailSection";
import { KeyValueRow } from "@/components/entity/KeyValueRow";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatPaiseInr, humanizeSnakeCase } from "@/lib/format";

export function PaymentDetailView({ paymentId }: { paymentId: string }) {
  const query = usePayment(paymentId);
  if (query.isPending) return <div className="mx-auto flex max-w-6xl flex-col gap-5"><Skeleton className="h-24 w-full" /><Skeleton className="h-24 w-full" /><Skeleton className="h-64 w-full" /></div>;
  if (query.isError) return <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-8 text-center text-[13px] text-destructive">{normalizeApiError(query.error).message}</div>;
  const payment = query.data.data;
  const allocatedPaise = sumAllocationPaise(payment.allocations);
  return <div className="mx-auto flex max-w-6xl min-w-0 flex-col gap-5"><EntityPageHeader backHref={`/plans/${payment.planId}?tab=payments`} avatarLabel="PY" title={payment.publicId} meta="Payment ledger record" badges={<StatusBadge tone={paymentStatusTone[payment.status]}>{humanizeSnakeCase(payment.status)}</StatusBadge>} actions={<Button variant="outline" size="sm" asChild className="h-8 text-[12.5px]"><Link href={`/plans/${payment.planId}?tab=payments`}>View Plan</Link></Button>} /><EntitySummaryGrid items={[{ label: "Payment Amount", value: formatPaiseInr(payment.amountPaise) }, { label: "Allocated Amount", value: formatPaiseInr(allocatedPaise) }, { label: "Method", value: paymentMethodLabels[payment.method] }, { label: "Source", value: paymentSourceLabels[payment.source] }]} /><div className="grid grid-cols-1 gap-4 lg:grid-cols-2"><DetailSection title="Payment Details"><KeyValueRow label="Status" value={<StatusBadge tone={paymentStatusTone[payment.status]}>{humanizeSnakeCase(payment.status)}</StatusBadge>} /><KeyValueRow label="Paid At" value={formatPaymentTimestamp(payment.paidAt)} /><KeyValueRow label="Created At" value={formatPaymentTimestamp(payment.createdAt)} /><KeyValueRow label="Updated At" value={formatPaymentTimestamp(payment.updatedAt)} /></DetailSection><DetailSection title="Provider Information"><KeyValueRow label="Provider" value={payment.provider ?? "Not provided"} /><KeyValueRow label="Provider Reference" value={payment.providerReference ?? "Not provided"} /><KeyValueRow label="Plan ID" value={payment.planId} /><KeyValueRow label="Customer ID" value={payment.customerId} /></DetailSection></div><section className="flex flex-col gap-3"><div><h2 className="text-[15px] font-semibold text-text-primary">Allocations</h2><p className="mt-0.5 text-[12px] text-text-muted">Canonical applications of this Payment to Plan installments.</p></div><PaymentAllocations allocations={payment.allocations} /></section></div>;
}
