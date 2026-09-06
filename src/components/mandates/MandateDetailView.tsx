"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { EntityPageHeader } from "@/components/entity/EntityPageHeader";
import { EntitySummaryGrid } from "@/components/entity/EntitySummaryGrid";
import { EntityTabs } from "@/components/entity/EntityTabs";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { MandateOverviewTab } from "@/components/mandates/MandateOverviewTab";
import { MandateAttemptsTab } from "@/components/mandates/MandateAttemptsTab";
import { MandateActivityTab } from "@/components/mandates/MandateActivityTab";
import {
  useAdminMandate,
  useAdminCustomer,
  useAdminMerchant,
  useAdminMandateAttemptsByMandate,
} from "@/hooks/useAdminEntities";
import { mandateOperationalStatusTone } from "@/data/admin/statusTones";
import { formatDate, humanizeSnakeCase } from "@/lib/format";

const TABS = [
  { value: "overview", label: "Overview" },
  { value: "attempts", label: "Attempts" },
  { value: "activity", label: "Activity" },
];

export function MandateDetailView({ mandateId, defaultTab }: { mandateId: string; defaultTab: string }) {
  const mandate = useAdminMandate(mandateId);
  const customer = useAdminCustomer(mandate?.customerId);
  const merchant = useAdminMerchant(mandate?.merchantId);
  const attempts = useAdminMandateAttemptsByMandate(mandateId);

  if (!mandate) return null;

  const lastAttempt = [...attempts].sort((a, b) => (a.attemptedAt < b.attemptedAt ? 1 : -1))[0];

  return (
    <div className="mx-auto flex max-w-6xl min-w-0 flex-col gap-5">
      <EntityPageHeader
        backHref="/mandates"
        avatarLabel="MD"
        title={mandate.id}
        meta={`${customer?.name ?? "—"} · ${merchant?.businessName ?? "—"} · ${mandate.providerReferenceMasked}`}
        badges={
          <>
            <StatusBadge tone={mandateOperationalStatusTone[mandate.status]}>
              {humanizeSnakeCase(mandate.status)}
            </StatusBadge>
            <StatusBadge tone="neutral">{mandate.method}</StatusBadge>
          </>
        }
        actions={
          <>
            {customer && (
              <Button variant="outline" size="sm" asChild className="h-8 text-[12.5px]">
                <Link href={`/customers/${customer.id}`}>View Customer</Link>
              </Button>
            )}
            {merchant && (
              <Button variant="outline" size="sm" asChild className="h-8 text-[12.5px]">
                <Link href={`/merchants/${merchant.id}`}>View Merchant</Link>
              </Button>
            )}
          </>
        }
      />

      <EntitySummaryGrid
        items={[
          { label: "Status", value: humanizeSnakeCase(mandate.status) },
          { label: "Method", value: mandate.method },
          { label: "Authorized", value: formatDate(mandate.authorizedAt) },
          { label: "Last Attempt", value: lastAttempt ? formatDate(lastAttempt.attemptedAt) : "—" },
          { label: "Provider", value: mandate.provider },
        ]}
      />

      <EntityTabs
        tabs={TABS}
        defaultValue={defaultTab}
        panels={{
          overview: <MandateOverviewTab mandate={mandate} />,
          attempts: <MandateAttemptsTab attempts={attempts} />,
          activity: <MandateActivityTab mandate={mandate} attempts={attempts} />,
        }}
      />
    </div>
  );
}
