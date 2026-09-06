"use client";

import Link from "next/link";
import { EntityPageHeader } from "@/components/entity/EntityPageHeader";
import { EntitySummaryGrid } from "@/components/entity/EntitySummaryGrid";
import { EntityTabs, ComingSoonPanel } from "@/components/entity/EntityTabs";
import { EntityKycTab } from "@/components/entity/EntityKycTab";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { Button } from "@/components/ui/button";
import { MerchantOverviewTab } from "@/components/merchants/MerchantOverviewTab";
import { MerchantSubscriptionTab } from "@/components/merchants/MerchantSubscriptionTab";
import { CustomersTable } from "@/components/customers/CustomersTable";
import { useAdminMerchant } from "@/hooks/useAdminEntities";
import { merchantStatusTone, kycStatusTone, subscriptionStatusTone } from "@/data/admin/statusTones";
import { formatCompactInr, formatDate, humanizeSnakeCase, initialsFromName } from "@/lib/format";

const TABS = [
  { value: "overview", label: "Overview" },
  { value: "customers", label: "Customers" },
  { value: "collections", label: "Collections" },
  { value: "kyc", label: "KYC & Documents" },
  { value: "subscription", label: "Subscription" },
];

export function MerchantDetailView({ merchantId, defaultTab }: { merchantId: string; defaultTab: string }) {
  const merchant = useAdminMerchant(merchantId);

  // The server page already validated the id exists (404s otherwise); this
  // only guards the brief instant before the client store hydrates.
  if (!merchant) return null;

  const kycReviewNeeded = merchant.kycStatus !== "verified";

  return (
    <div className="mx-auto flex max-w-6xl min-w-0 flex-col gap-5">
      <EntityPageHeader
        backHref="/merchants"
        avatarLabel={initialsFromName(merchant.businessName)}
        title={merchant.businessName}
        meta={`${merchant.id} · Merchant since ${formatDate(merchant.joinedAt)}`}
        badges={
          <>
            <StatusBadge tone={merchantStatusTone[merchant.status]}>
              Account {humanizeSnakeCase(merchant.status)}
            </StatusBadge>
            <StatusBadge tone={kycStatusTone[merchant.kycStatus]}>
              KYC {humanizeSnakeCase(merchant.kycStatus)}
            </StatusBadge>
            <StatusBadge tone={subscriptionStatusTone[merchant.subscriptionStatus]}>
              Subscription {humanizeSnakeCase(merchant.subscriptionStatus)}
            </StatusBadge>
          </>
        }
        actions={
          <>
            <Button
              variant={kycReviewNeeded ? "default" : "outline"}
              size="sm"
              asChild
              className="h-8 text-[12.5px]"
            >
              <Link href={`/merchants/${merchant.id}?tab=kyc`}>Review KYC</Link>
            </Button>
            <Button variant="outline" size="sm" asChild className="h-8 text-[12.5px]">
              <Link href={`/merchants/${merchant.id}?tab=collections`}>View Collections</Link>
            </Button>
          </>
        }
      />

      <EntitySummaryGrid
        items={[
          { label: "Customers", value: String(merchant.customerCount) },
          { label: "Outstanding", value: formatCompactInr(merchant.outstanding) },
          { label: "Collected This Month", value: formatCompactInr(merchant.collectedThisMonth) },
          {
            label: "Overdue",
            value: formatCompactInr(merchant.overdueAmount),
            emphasis: merchant.overdueAmount > 0 ? "error" : "default",
          },
          { label: "Active Plans", value: String(merchant.activePlans) },
        ]}
      />

      <EntityTabs
        tabs={TABS}
        defaultValue={defaultTab}
        panels={{
          overview: <MerchantOverviewTab merchant={merchant} />,
          customers: (
            <CustomersTable merchantId={merchant.id} showMerchantColumn={false} showLastPaymentColumn={false} />
          ),
          collections: <ComingSoonPanel label="Merchant collections view" />,
          kyc: <EntityKycTab entityType="merchant" entityId={merchant.id} />,
          subscription: <MerchantSubscriptionTab merchantId={merchant.id} />,
        }}
      />
    </div>
  );
}
