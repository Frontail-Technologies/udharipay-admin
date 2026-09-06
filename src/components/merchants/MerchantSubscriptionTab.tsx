"use client";

import Link from "next/link";
import { useMemo } from "react";
import { DetailSection } from "@/components/entity/DetailSection";
import { KeyValueRow } from "@/components/entity/KeyValueRow";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { Button } from "@/components/ui/button";
import { ComingSoonPanel } from "@/components/entity/EntityTabs";
import {
  useAdminSubscriptionByMerchant,
  useAdminSubscriptionInvoicesBySubscription,
} from "@/hooks/useAdminEntities";
import {
  subscriptionOperationalStatusTone,
  activationFeeStatusTone,
  autoPayStatusTone,
  subscriptionInvoiceStatusTone,
} from "@/data/admin/statusTones";
import { formatCompactInr, formatDate, humanizeSnakeCase } from "@/lib/format";

export function MerchantSubscriptionTab({ merchantId }: { merchantId: string }) {
  const subscription = useAdminSubscriptionByMerchant(merchantId);
  const invoices = useAdminSubscriptionInvoicesBySubscription(subscription?.id);

  const recentInvoices = useMemo(
    () => [...invoices].sort((a, b) => (a.dueDate < b.dueDate ? 1 : -1)).slice(0, 3),
    [invoices],
  );

  if (!subscription) {
    return <ComingSoonPanel label="No SaaS subscription set up for this merchant" />;
  }

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <DetailSection
        title="Plan & Billing"
        action={
          <Button variant="outline" size="sm" asChild className="h-7 text-[12px]">
            <Link href={`/subscriptions/${subscription.id}`}>View Full Subscription</Link>
          </Button>
        }
      >
        <KeyValueRow label="Plan" value={`${subscription.planName} (${subscription.planCode})`} />
        <KeyValueRow label="Monthly Fee" value={formatCompactInr(subscription.monthlyAmount)} />
        <KeyValueRow
          label="Status"
          value={
            <StatusBadge tone={subscriptionOperationalStatusTone[subscription.status]}>
              {humanizeSnakeCase(subscription.status)}
            </StatusBadge>
          }
        />
        <KeyValueRow label="Next Billing" value={formatDate(subscription.nextBillingDate)} />
      </DetailSection>

      <DetailSection title="Activation Fee & AutoPay">
        <KeyValueRow label="Activation Fee" value={formatCompactInr(subscription.activationFeeAmount)} />
        <KeyValueRow
          label="Activation Fee Status"
          value={
            <StatusBadge tone={activationFeeStatusTone[subscription.activationFeeStatus]}>
              {humanizeSnakeCase(subscription.activationFeeStatus)}
            </StatusBadge>
          }
        />
        <KeyValueRow
          label="AutoPay"
          value={
            <StatusBadge tone={autoPayStatusTone[subscription.autopayStatus]}>
              {humanizeSnakeCase(subscription.autopayStatus)}
            </StatusBadge>
          }
        />
        <KeyValueRow label="Payment Method" value={subscription.paymentMethod} />
      </DetailSection>

      <DetailSection
        title="Billing History Preview"
        className="lg:col-span-2"
        action={
          <Link href={`/subscriptions/${subscription.id}?tab=billing`} className="text-[12px] font-medium text-primary hover:underline">
            View Full Billing History
          </Link>
        }
      >
        {recentInvoices.length === 0 ? (
          <p className="py-4 text-center text-[12.5px] text-text-muted">No billing history yet.</p>
        ) : (
          <ul className="flex flex-col divide-y divide-border">
            {recentInvoices.map((invoice) => (
              <li key={invoice.id} className="flex items-center justify-between gap-3 py-2 text-[12.5px]">
                <div className="min-w-0">
                  <p className="truncate text-text-primary">{invoice.id}</p>
                  <p className="text-[11px] text-text-muted">
                    {formatDate(invoice.dueDate)} · {humanizeSnakeCase(invoice.type)}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <span className="tabular-nums text-text-primary">{formatCompactInr(invoice.amount)}</span>
                  <StatusBadge tone={subscriptionInvoiceStatusTone[invoice.status]}>
                    {humanizeSnakeCase(invoice.status)}
                  </StatusBadge>
                </div>
              </li>
            ))}
          </ul>
        )}
      </DetailSection>
    </div>
  );
}
