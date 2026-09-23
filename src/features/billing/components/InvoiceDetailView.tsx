"use client";

import { normalizeApiError } from "@/api/http/errors";
import { formatTimestamp } from "@/shared/utils/date";
import { useSubscriptionInvoice } from "@/features/billing/hooks/useBilling";
import { invoiceOperationalStatusTone, invoiceTypeLabels } from "@/features/billing/utils/metadata";
import { EntityPageHeader } from "@/components/entity/EntityPageHeader";
import { EntitySummaryGrid } from "@/components/entity/EntitySummaryGrid";
import { DetailSection } from "@/components/entity/DetailSection";
import { KeyValueRow } from "@/components/entity/KeyValueRow";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate, formatPaiseInr, humanizeSnakeCase } from "@/lib/format";

export function InvoiceDetailView({ invoiceId }: { invoiceId: string }) {
  const query = useSubscriptionInvoice(invoiceId);
  if (query.isPending) return <div className="mx-auto flex max-w-4xl flex-col gap-5"><Skeleton className="h-24 w-full" /><Skeleton className="h-24 w-full" /><Skeleton className="h-52 w-full" /></div>;
  if (query.isError) return <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-8 text-center text-[13px] text-destructive">{normalizeApiError(query.error).message}</div>;

  const invoice = query.data.data;
  return <div className="mx-auto flex max-w-4xl min-w-0 flex-col gap-5">
    <EntityPageHeader backHref="/subscriptions" avatarLabel="IN" title={invoice.publicId} meta={invoiceTypeLabels[invoice.type]} badges={<StatusBadge tone={invoiceOperationalStatusTone[invoice.operationalStatus] ?? "neutral"}>{humanizeSnakeCase(invoice.operationalStatus)}</StatusBadge>} actions={<a href={`/merchants/${invoice.merchantId}`} className="text-[12.5px] font-medium text-primary hover:underline">View Merchant</a>} />
    <EntitySummaryGrid items={[{ label: "Amount", value: formatPaiseInr(invoice.amountPaise) }, { label: "Due Date", value: formatDate(invoice.dueDate) }, { label: "Paid At", value: formatTimestamp(invoice.paidAt) }]} />
    <DetailSection title="Invoice Details">
      <div className="grid gap-x-6 sm:grid-cols-2">
        <KeyValueRow label="Type" value={invoiceTypeLabels[invoice.type]} />
        <KeyValueRow label="Status" value={humanizeSnakeCase(invoice.status)} />
        <KeyValueRow label="Period Start" value={invoice.periodStart ? formatDate(invoice.periodStart) : "-"} />
        <KeyValueRow label="Period End" value={invoice.periodEnd ? formatDate(invoice.periodEnd) : "-"} />
        <KeyValueRow label="Created" value={formatTimestamp(invoice.createdAt)} />
        <KeyValueRow label="Updated" value={formatTimestamp(invoice.updatedAt)} />
      </div>
    </DetailSection>
  </div>;
}
