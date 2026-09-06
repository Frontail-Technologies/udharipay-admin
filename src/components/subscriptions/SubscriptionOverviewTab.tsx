"use client";

import Link from "next/link";
import { useMemo } from "react";
import { ChevronRight, Store } from "lucide-react";
import { DetailSection } from "@/components/entity/DetailSection";
import { KeyValueRow } from "@/components/entity/KeyValueRow";
import { StatusBadge } from "@/components/admin/StatusBadge";
import {
  useAdminMerchant,
  useAdminSubscriptionInvoicesBySubscription,
} from "@/hooks/useAdminEntities";
import type { MerchantSubscription } from "@/data/admin";
import {
  merchantStatusTone,
  activationFeeStatusTone,
  autoPayStatusTone,
  subscriptionInvoiceStatusTone,
} from "@/data/admin/statusTones";
import { formatCompactInr, formatDate, humanizeSnakeCase } from "@/lib/format";

export function SubscriptionOverviewTab({ subscription }: { subscription: MerchantSubscription }) {
  const merchant = useAdminMerchant(subscription.merchantId);
  const invoices = useAdminSubscriptionInvoicesBySubscription(subscription.id);

  const recentInvoices = useMemo(
    () => [...invoices].sort((a, b) => (a.dueDate < b.dueDate ? 1 : -1)).slice(0, 4),
    [invoices],
  );

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <DetailSection title="Plan & Billing">
        <KeyValueRow label="Plan" value={`${subscription.planName} (${subscription.planCode})`} />
        <KeyValueRow label="Monthly Fee" value={formatCompactInr(subscription.monthlyAmount)} />
        <KeyValueRow label="Payment Method" value={subscription.paymentMethod} />
        <KeyValueRow label="Current Period" value={`${formatDate(subscription.currentPeriodStart)} – ${formatDate(subscription.currentPeriodEnd)}`} />
        <KeyValueRow label="Next Billing" value={formatDate(subscription.nextBillingDate)} />
        <KeyValueRow label="Subscribed Since" value={formatDate(subscription.createdAt)} />
        {subscription.cancelledAt && <KeyValueRow label="Cancelled On" value={formatDate(subscription.cancelledAt)} />}
      </DetailSection>

      <DetailSection title="Merchant">
        {merchant ? (
          <Link
            href={`/merchants/${merchant.id}`}
            className="flex items-center gap-3 rounded-lg border border-border p-3 hover:bg-surface-hover"
          >
            <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-primary-muted text-primary">
              <Store className="size-4" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] font-medium text-text-primary">{merchant.businessName}</p>
              <p className="truncate text-[11.5px] text-text-muted">
                {merchant.id} · {merchant.address.city}
              </p>
            </div>
            <StatusBadge tone={merchantStatusTone[merchant.status]}>{humanizeSnakeCase(merchant.status)}</StatusBadge>
            <ChevronRight className="size-4 shrink-0 text-text-muted" />
          </Link>
        ) : (
          <p className="text-[12.5px] text-text-muted">Merchant not found.</p>
        )}
      </DetailSection>

      <DetailSection title="Activation Fee">
        <KeyValueRow label="Amount" value={formatCompactInr(subscription.activationFeeAmount)} />
        <KeyValueRow
          label="Status"
          value={
            <StatusBadge tone={activationFeeStatusTone[subscription.activationFeeStatus]}>
              {humanizeSnakeCase(subscription.activationFeeStatus)}
            </StatusBadge>
          }
        />
        <p className="mt-2 text-[11.5px] text-text-muted">
          One-time login/activation fee — kept separate from the recurring monthly subscription.
        </p>
      </DetailSection>

      <DetailSection title="AutoPay">
        <KeyValueRow
          label="AutoPay Status"
          value={
            <StatusBadge tone={autoPayStatusTone[subscription.autopayStatus]}>
              {humanizeSnakeCase(subscription.autopayStatus)}
            </StatusBadge>
          }
        />
        <KeyValueRow label="Payment Method" value={subscription.paymentMethod} />
        <KeyValueRow label="Next Debit" value={formatDate(subscription.nextBillingDate)} />
      </DetailSection>

      <DetailSection
        title="Recent Billing"
        className="lg:col-span-2"
        action={
          <Link href={`/subscriptions/${subscription.id}?tab=billing`} className="text-[12px] font-medium text-primary hover:underline">
            View full billing history
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
