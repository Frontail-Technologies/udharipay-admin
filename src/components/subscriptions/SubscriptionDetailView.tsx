"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { EntityPageHeader } from "@/components/entity/EntityPageHeader";
import { EntitySummaryGrid } from "@/components/entity/EntitySummaryGrid";
import { EntityTabs } from "@/components/entity/EntityTabs";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { SubscriptionOverviewTab } from "@/components/subscriptions/SubscriptionOverviewTab";
import { SubscriptionBillingHistoryTab } from "@/components/subscriptions/SubscriptionBillingHistoryTab";
import { SubscriptionActivityTab } from "@/components/subscriptions/SubscriptionActivityTab";
import {
  useAdminSubscription,
  useAdminMerchant,
  useAdminSubscriptionInvoicesBySubscription,
} from "@/hooks/useAdminEntities";
import {
  subscriptionOperationalStatusTone,
  autoPayStatusTone,
} from "@/data/admin/statusTones";
import { formatCompactInr, formatDate, humanizeSnakeCase, initialsFromName } from "@/lib/format";

const TABS = [
  { value: "overview", label: "Overview" },
  { value: "billing", label: "Billing History" },
  { value: "activity", label: "Activity" },
];

export function SubscriptionDetailView({ subscriptionId, defaultTab }: { subscriptionId: string; defaultTab: string }) {
  const subscription = useAdminSubscription(subscriptionId);
  const merchant = useAdminMerchant(subscription?.merchantId);
  const invoices = useAdminSubscriptionInvoicesBySubscription(subscriptionId);

  if (!subscription) return null;

  return (
    <div className="mx-auto flex max-w-6xl min-w-0 flex-col gap-5">
      <EntityPageHeader
        backHref="/subscriptions"
        avatarLabel={merchant ? initialsFromName(merchant.businessName) : "SB"}
        title={merchant?.businessName ?? subscription.id}
        meta={`${subscription.id} · ${subscription.planName}`}
        badges={
          <>
            <StatusBadge tone={subscriptionOperationalStatusTone[subscription.status]}>
              Subscription {humanizeSnakeCase(subscription.status)}
            </StatusBadge>
            <StatusBadge tone={autoPayStatusTone[subscription.autopayStatus]}>
              AutoPay {humanizeSnakeCase(subscription.autopayStatus)}
            </StatusBadge>
          </>
        }
        actions={
          merchant && (
            <Button variant="outline" size="sm" asChild className="h-8 text-[12.5px]">
              <Link href={`/merchants/${merchant.id}`}>View Merchant</Link>
            </Button>
          )
        }
      />

      <EntitySummaryGrid
        items={[
          { label: "Monthly Fee", value: formatCompactInr(subscription.monthlyAmount) },
          { label: "Current Plan", value: subscription.planName },
          { label: "Next Billing", value: formatDate(subscription.nextBillingDate) },
          { label: "Activation Fee", value: formatCompactInr(subscription.activationFeeAmount) },
          { label: "Current Period Ends", value: formatDate(subscription.currentPeriodEnd) },
        ]}
      />

      <EntityTabs
        tabs={TABS}
        defaultValue={defaultTab}
        panels={{
          overview: <SubscriptionOverviewTab subscription={subscription} />,
          billing: <SubscriptionBillingHistoryTab invoices={invoices} />,
          activity: <SubscriptionActivityTab subscription={subscription} invoices={invoices} />,
        }}
      />
    </div>
  );
}
