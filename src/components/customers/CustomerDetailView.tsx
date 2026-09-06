"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { EntityPageHeader } from "@/components/entity/EntityPageHeader";
import { EntitySummaryGrid } from "@/components/entity/EntitySummaryGrid";
import { EntityTabs } from "@/components/entity/EntityTabs";
import { EntityKycTab } from "@/components/entity/EntityKycTab";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { CustomerOverviewTab } from "@/components/customers/CustomerOverviewTab";
import { CustomerPlansTab } from "@/components/customers/CustomerPlansTab";
import { CustomerPaymentsTab } from "@/components/customers/CustomerPaymentsTab";
import { CustomerMandateSummary } from "@/components/customers/CustomerMandateSummary";
import { useAdminCustomer, useAdminMerchant, useAdminMandateByCustomer } from "@/hooks/useAdminEntities";
import { getPaymentsByCustomer } from "@/data/admin";
import { customerStatusTone } from "@/data/admin/statusTones";
import { formatCompactInr, formatDate, humanizeSnakeCase, initialsFromName } from "@/lib/format";

const TABS = [
  { value: "overview", label: "Overview" },
  { value: "plans", label: "Udhaar Plans" },
  { value: "payments", label: "Payments" },
  { value: "mandate", label: "Mandate" },
  { value: "documents", label: "Documents" },
];

export function CustomerDetailView({ customerId, defaultTab }: { customerId: string; defaultTab: string }) {
  const customer = useAdminCustomer(customerId);
  const merchant = useAdminMerchant(customer?.merchantId);
  const mandate = useAdminMandateByCustomer(customerId);

  if (!customer) return null;

  const payments = getPaymentsByCustomer(customer.id);

  return (
    <div className="mx-auto flex max-w-6xl min-w-0 flex-col gap-5">
      <EntityPageHeader
        backHref="/customers"
        avatarLabel={initialsFromName(customer.name)}
        title={customer.name}
        meta={`${customer.id} · ${merchant?.businessName ?? "Unknown merchant"} · Joined ${formatDate(customer.joinedAt)}`}
        badges={<StatusBadge tone={customerStatusTone[customer.status]}>{humanizeSnakeCase(customer.status)}</StatusBadge>}
        actions={
          merchant && (
            <>
              <Button variant="outline" size="sm" asChild className="h-8 text-[12.5px]">
                <Link href={`/merchants/${merchant.id}`}>View Merchant</Link>
              </Button>
              <Button variant="outline" size="sm" asChild className="h-8 text-[12.5px]">
                <Link href={`/customers/${customer.id}?tab=plans`}>View Plans</Link>
              </Button>
            </>
          )
        }
      />

      <EntitySummaryGrid
        items={[
          { label: "Outstanding", value: formatCompactInr(customer.outstanding) },
          { label: "Total Udhaar", value: formatCompactInr(customer.totalUdhaar) },
          { label: "Collected", value: formatCompactInr(customer.collected) },
          {
            label: "Overdue",
            value: formatCompactInr(customer.overdueAmount),
            emphasis: customer.overdueAmount > 0 ? "error" : "default",
          },
          { label: "Active Plans", value: String(customer.activePlanCount) },
        ]}
      />

      <EntityTabs
        tabs={TABS}
        defaultValue={defaultTab}
        panels={{
          overview: <CustomerOverviewTab customer={customer} />,
          plans: <CustomerPlansTab plans={customer.plans} />,
          payments: <CustomerPaymentsTab payments={payments} />,
          mandate: <CustomerMandateSummary mandate={mandate} />,
          documents: <EntityKycTab entityType="customer" entityId={customer.id} />,
        }}
      />
    </div>
  );
}
