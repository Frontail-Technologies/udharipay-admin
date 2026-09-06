"use client";

import Link from "next/link";
import { ChevronRight, Store } from "lucide-react";
import { DetailSection } from "@/components/entity/DetailSection";
import { KeyValueRow } from "@/components/entity/KeyValueRow";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { CustomerProfileSection } from "@/components/customers/CustomerProfileSection";
import { useAdminMerchant, useAdminMandateByCustomer } from "@/hooks/useAdminEntities";
import type { DerivedCustomer } from "@/data/admin";
import { getPaymentsByCustomer } from "@/data/admin";
import {
  paymentStatusTone,
  kycStatusTone,
  mandateOperationalStatusTone,
  merchantStatusTone,
  planStatusTone,
  customerStatusTone,
} from "@/data/admin/statusTones";
import { formatCompactInr, formatDate, humanizeSnakeCase } from "@/lib/format";

export function CustomerOverviewTab({ customer }: { customer: DerivedCustomer }) {
  const merchant = useAdminMerchant(customer.merchantId);
  const mandate = useAdminMandateByCustomer(customer.id);
  const recentPayments = [...getPaymentsByCustomer(customer.id)]
    .sort((a, b) => (a.date < b.date ? 1 : -1))
    .slice(0, 6);

  const previewPlans = [...customer.plans]
    .sort((a, b) => (a.status === "completed") === (b.status === "completed") ? 0 : a.status === "completed" ? 1 : -1)
    .slice(0, 2);

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <CustomerProfileSection customer={customer} />

      <DetailSection title="Merchant Relationship">
        {merchant ? (
          <Link
            href={`/merchants/${merchant.id}`}
            className="flex items-center gap-3 rounded-lg border border-border p-3 hover:bg-surface-hover"
          >
            <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-primary-muted text-primary">
              <Store className="size-4" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13.5px] font-medium text-text-primary">{merchant.businessName}</p>
              <p className="truncate text-[11.5px] text-text-muted">
                {merchant.id} · {merchant.address.city}
              </p>
            </div>
            <StatusBadge tone={merchantStatusTone[merchant.status]}>
              {humanizeSnakeCase(merchant.status)}
            </StatusBadge>
            <ChevronRight className="size-4 shrink-0 text-text-muted" />
          </Link>
        ) : (
          <p className="text-[12.5px] text-text-muted">Merchant not found.</p>
        )}
      </DetailSection>

      <DetailSection title="Collection / Udhaar Health">
        <KeyValueRow label="Total Udhaar" value={formatCompactInr(customer.totalUdhaar)} />
        <KeyValueRow label="Collected" value={formatCompactInr(customer.collected)} />
        <KeyValueRow label="Outstanding" value={formatCompactInr(customer.outstanding)} />
        <KeyValueRow
          label="Overdue"
          value={
            customer.overdueAmount > 0 ? (
              <span className="text-error">{formatCompactInr(customer.overdueAmount)}</span>
            ) : (
              formatCompactInr(0)
            )
          }
        />
        <KeyValueRow label="Next Due" value={formatDate(customer.nextDueDate)} />
        <KeyValueRow label="Active Plans" value={String(customer.activePlanCount)} />
        <KeyValueRow label="Completed Plans" value={String(customer.completedPlanCount)} />
        <KeyValueRow
          label="Status"
          value={
            <StatusBadge tone={customerStatusTone[customer.status]}>
              {humanizeSnakeCase(customer.status)}
            </StatusBadge>
          }
        />
      </DetailSection>

      <DetailSection
        title="Verification & Mandate"
        action={
          mandate && (
            <Link href={`/mandates/${mandate.id}`} className="text-[12px] font-medium text-primary hover:underline">
              View Mandate
            </Link>
          )
        }
      >
        <KeyValueRow
          label="Verification"
          value={
            <StatusBadge tone={kycStatusTone[customer.verificationStatus]}>
              {humanizeSnakeCase(customer.verificationStatus)}
            </StatusBadge>
          }
        />
        <KeyValueRow label="PAN" value={customer.panMasked} />
        <KeyValueRow label="ID Type" value={customer.idType} />
        <KeyValueRow label="ID Reference" value={customer.idReferenceMasked} />
        {mandate ? (
          <>
            <KeyValueRow
              label="Mandate Status"
              value={
                <StatusBadge tone={mandateOperationalStatusTone[mandate.status]}>
                  {humanizeSnakeCase(mandate.status)}
                </StatusBadge>
              }
            />
            <KeyValueRow label="Mandate Method" value={mandate.method} />
            <KeyValueRow label="Authorized" value={formatDate(mandate.authorizedAt)} />
          </>
        ) : (
          <KeyValueRow label="Mandate" value="Not set up" />
        )}
      </DetailSection>

      <DetailSection
        title="Active Plans"
        action={
          <Link href={`/customers/${customer.id}?tab=plans`} className="text-[12px] font-medium text-primary hover:underline">
            View all plans
          </Link>
        }
      >
        {previewPlans.length === 0 ? (
          <p className="py-4 text-center text-[12.5px] text-text-muted">No Udhaar plans yet.</p>
        ) : (
          <div className="flex flex-col gap-2.5">
            {previewPlans.map((plan) => {
              const remainingInstallments = Math.max(
                plan.totalInstallments - plan.payments.filter((p) => p.status === "collected").length,
                0,
              );
              return (
                <Link
                  key={plan.id}
                  href={`/plans/${plan.id}`}
                  className="block rounded-lg border border-border p-2.5 hover:bg-surface-hover"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[12.5px] font-semibold text-text-primary">{plan.id}</span>
                    <StatusBadge tone={planStatusTone[plan.status]}>{humanizeSnakeCase(plan.status)}</StatusBadge>
                  </div>
                  <p className="mt-0.5 truncate text-[11.5px] text-text-muted">{plan.purchaseDescription}</p>
                  <div className="mt-1.5 flex items-center justify-between text-[11.5px] text-text-secondary">
                    <span>
                      {formatCompactInr(plan.originalAmount)} original ·{" "}
                      {formatCompactInr(plan.remainingAmount)} remaining
                    </span>
                    <span>{remainingInstallments} left</span>
                  </div>
                  <p className="mt-0.5 text-[11.5px] text-text-muted">Next due {formatDate(plan.nextDueDate)}</p>
                </Link>
              );
            })}
          </div>
        )}
      </DetailSection>

      <DetailSection title="Recent Payments">
        {recentPayments.length === 0 ? (
          <p className="py-4 text-center text-[12.5px] text-text-muted">No payments yet.</p>
        ) : (
          <ul className="flex flex-col divide-y divide-border">
            {recentPayments.map((payment) => (
              <li key={payment.id} className="flex items-center justify-between gap-3 py-2 text-[12.5px]">
                <div className="min-w-0">
                  <p className="truncate text-text-primary">
                    {payment.planId} · #{payment.installmentNumber}
                  </p>
                  <p className="text-[11px] text-text-muted">
                    {formatDate(payment.date)} · {payment.method}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <span className="tabular-nums text-text-primary">{formatCompactInr(payment.amount)}</span>
                  <StatusBadge tone={paymentStatusTone[payment.status]}>
                    {humanizeSnakeCase(payment.status)}
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
