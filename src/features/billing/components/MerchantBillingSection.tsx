"use client";

import { normalizeApiError } from "@/api/http/errors";
import { useMerchantSubscription } from "@/features/billing/hooks/useBilling";
import { invoiceOperationalStatusTone, invoiceTypeLabels, subscriptionStatusTone } from "@/features/billing/utils/metadata";
import { CreateSubscriptionDialog } from "@/features/billing/components/CreateSubscriptionDialog";
import { MerchantInvoiceHistory } from "@/features/billing/components/MerchantInvoiceHistory";
import { DetailSection } from "@/components/entity/DetailSection";
import { KeyValueRow } from "@/components/entity/KeyValueRow";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate, formatPaiseInr, humanizeSnakeCase } from "@/lib/format";

export function MerchantBillingSection({ merchantId }: { merchantId: string }) {
  const query = useMerchantSubscription(merchantId);

  if (query.isPending) return <Skeleton className="h-52 w-full" />;

  if (query.isError) {
    const error = normalizeApiError(query.error);
    if (error.status !== 404) return <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-8 text-center text-[13px] text-destructive">{error.message}</div>;
    return <DetailSection title="Billing" description="Merchant SaaS subscription" action={<CreateSubscriptionDialog merchantId={merchantId} />}>
      <p className="text-[13px] text-text-muted">This merchant has no subscription yet.</p>
    </DetailSection>;
  }

  const subscription = query.data.data;
  return <div className="flex flex-col gap-4">
    <DetailSection title="Billing" description={`${subscription.planName} plan`} action={<StatusBadge tone={subscriptionStatusTone[subscription.status]}>{humanizeSnakeCase(subscription.status)}</StatusBadge>}>
      <div className="grid gap-x-6 sm:grid-cols-2">
        <KeyValueRow label="Plan" value={subscription.planName} />
        <KeyValueRow label="Monthly Amount" value={formatPaiseInr(subscription.monthlyAmountPaise)} />
        <KeyValueRow label="Billing cycle" value={subscription.billingCycleMonths === 1 ? "Monthly" : `Every ${subscription.billingCycleMonths} months`} />
        <KeyValueRow label="Term End" value={formatDate(subscription.termEndDate)} />
        <KeyValueRow label="Entitlement" value={subscription.entitlement ? "Active" : "Not Entitled"} />
        <KeyValueRow label="Current Period" value={`${formatDate(subscription.currentPeriodStart)} - ${formatDate(subscription.currentPeriodEnd)}`} />
        <KeyValueRow label="Next Billing Date" value={subscription.nextBillingDate ? formatDate(subscription.nextBillingDate) : "-"} />
      </div>
    </DetailSection>

    {subscription.activationInvoice && <DetailSection title="Activation Invoice" description={invoiceTypeLabels[subscription.activationInvoice.type]}>
      <div className="grid gap-x-6 sm:grid-cols-2">
        <KeyValueRow label="Invoice" value={subscription.activationInvoice.publicId} />
        <KeyValueRow label="Amount" value={formatPaiseInr(subscription.activationInvoice.amountPaise)} />
        <KeyValueRow label="Status" value={<StatusBadge tone={invoiceOperationalStatusTone[subscription.activationInvoice.operationalStatus] ?? "neutral"}>{humanizeSnakeCase(subscription.activationInvoice.operationalStatus)}</StatusBadge>} />
        <KeyValueRow label="Due Date" value={formatDate(subscription.activationInvoice.dueDate)} />
      </div>
    </DetailSection>}

    <DetailSection title="Invoice History" description="All invoices billed to this merchant">
      <MerchantInvoiceHistory merchantId={merchantId} />
    </DetailSection>
  </div>;
}
