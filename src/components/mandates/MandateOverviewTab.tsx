"use client";

import Link from "next/link";
import { useMemo } from "react";
import { ChevronRight, Store, User } from "lucide-react";
import { DetailSection } from "@/components/entity/DetailSection";
import { KeyValueRow } from "@/components/entity/KeyValueRow";
import { StatusBadge } from "@/components/admin/StatusBadge";
import {
  useAdminCustomer,
  useAdminMerchant,
  useAdminMandateAttemptsByMandate,
} from "@/hooks/useAdminEntities";
import type { Mandate } from "@/data/admin";
import {
  customerStatusTone,
  merchantStatusTone,
  mandateAttemptStatusTone,
} from "@/data/admin/statusTones";
import { formatCompactInr, formatDate, humanizeSnakeCase } from "@/lib/format";

export function MandateOverviewTab({ mandate }: { mandate: Mandate }) {
  const customer = useAdminCustomer(mandate.customerId);
  const merchant = useAdminMerchant(mandate.merchantId);
  const attempts = useAdminMandateAttemptsByMandate(mandate.id);

  const recentAttempt = useMemo(
    () => [...attempts].sort((a, b) => (a.attemptedAt < b.attemptedAt ? 1 : -1))[0],
    [attempts],
  );

  const activePlans = customer?.plans.filter((plan) => plan.status !== "completed") ?? [];

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <DetailSection title="Authorization Details">
        <KeyValueRow label="Mandate ID" value={mandate.id} />
        <KeyValueRow label="Method" value={mandate.method} />
        <KeyValueRow label="Provider" value={mandate.provider} />
        <KeyValueRow label="Authorized On" value={formatDate(mandate.authorizedAt)} />
        <KeyValueRow label="Activated On" value={formatDate(mandate.activatedAt)} />
        <KeyValueRow label="Expires" value={formatDate(mandate.expiresAt)} />
        <KeyValueRow label="Frequency" value={mandate.frequency ? <span className="capitalize">{mandate.frequency}</span> : "—"} />
        <KeyValueRow label="Max Amount" value={mandate.maxAmount ? formatCompactInr(mandate.maxAmount) : "—"} />
      </DetailSection>

      <DetailSection title="Customer & Merchant">
        {customer && (
          <Link
            href={`/customers/${customer.id}`}
            className="flex items-center gap-3 rounded-lg border border-border p-3 hover:bg-surface-hover"
          >
            <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-primary-muted text-primary">
              <User className="size-4" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] font-medium text-text-primary">{customer.name}</p>
              <p className="truncate text-[11.5px] text-text-muted">
                {customer.id} · {customer.phone}
              </p>
            </div>
            <StatusBadge tone={customerStatusTone[customer.status]}>{humanizeSnakeCase(customer.status)}</StatusBadge>
            <ChevronRight className="size-4 shrink-0 text-text-muted" />
          </Link>
        )}
        {merchant && (
          <Link
            href={`/merchants/${merchant.id}`}
            className="mt-2 flex items-center gap-3 rounded-lg border border-border p-3 hover:bg-surface-hover"
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
        )}
      </DetailSection>

      <DetailSection title="Scope" description="This mandate authorizes collection for the customer's Udhaar plans with this merchant.">
        <KeyValueRow label="Scope" value={mandate.planId ?? "Customer-level (all plans)"} />
        <KeyValueRow label="Linked Plan" value={mandate.planId ?? "Not plan-specific"} />
      </DetailSection>

      <DetailSection title="Provider Reference">
        <KeyValueRow label="Provider" value={mandate.provider} />
        <KeyValueRow label="Reference" value={mandate.providerReferenceMasked} />
        <KeyValueRow label="Created" value={formatDate(mandate.createdAt)} />
        <KeyValueRow label="Last Updated" value={formatDate(mandate.updatedAt)} />
      </DetailSection>

      <DetailSection
        title="Collection Usage"
        action={
          customer && (
            <Link href={`/customers/${customer.id}?tab=plans`} className="text-[12px] font-medium text-primary hover:underline">
              View all plans
            </Link>
          )
        }
      >
        {activePlans.length === 0 ? (
          <p className="text-[12.5px] text-text-muted">No active Udhaar plans currently rely on this mandate.</p>
        ) : (
          <ul className="flex flex-col divide-y divide-border">
            {activePlans.map((plan) => (
              <li key={plan.id} className="flex items-center justify-between gap-3 py-2 text-[12.5px]">
                <Link href={`/plans/${plan.id}`} className="min-w-0 truncate text-primary hover:underline">
                  {plan.id}
                </Link>
                <span className="tabular-nums text-text-secondary">{formatCompactInr(plan.remainingAmount)} remaining</span>
              </li>
            ))}
          </ul>
        )}
      </DetailSection>

      <DetailSection title="Recent Attempt">
        {recentAttempt ? (
          <>
            <KeyValueRow label="Attempted" value={formatDate(recentAttempt.attemptedAt)} />
            <KeyValueRow label="Amount" value={recentAttempt.amount != null ? formatCompactInr(recentAttempt.amount) : "—"} />
            <KeyValueRow
              label="Status"
              value={
                <StatusBadge tone={mandateAttemptStatusTone[recentAttempt.status]}>
                  {humanizeSnakeCase(recentAttempt.status)}
                </StatusBadge>
              }
            />
            {recentAttempt.failureReason && <KeyValueRow label="Failure Reason" value={recentAttempt.failureReason} />}
          </>
        ) : (
          <p className="text-[12.5px] text-text-muted">No collection attempts yet.</p>
        )}
      </DetailSection>
    </div>
  );
}
