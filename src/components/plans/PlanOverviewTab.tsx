"use client";

import Link from "next/link";
import { useMemo } from "react";
import { ChevronRight, Store, User } from "lucide-react";
import { DetailSection } from "@/components/entity/DetailSection";
import { KeyValueRow } from "@/components/entity/KeyValueRow";
import { MicroProgress } from "@/components/entity/MicroProgress";
import { StatusBadge } from "@/components/admin/StatusBadge";
import {
  useAdminCustomer,
  useAdminMerchant,
  useAdminMandateByCustomer,
  useAdminInstallmentsByPlan,
  useAdminPaymentsByPlan,
} from "@/hooks/useAdminEntities";
import type { DerivedPlan } from "@/data/admin";
import {
  planStatusTone,
  customerStatusTone,
  merchantStatusTone,
  mandateOperationalStatusTone,
  paymentStatusTone,
  installmentStatusTone,
} from "@/data/admin/statusTones";
import { formatCompactInr, formatDate, humanizeSnakeCase } from "@/lib/format";

export function PlanOverviewTab({ plan }: { plan: DerivedPlan }) {
  const customer = useAdminCustomer(plan.customerId);
  const merchant = useAdminMerchant(plan.merchantId);
  const mandate = useAdminMandateByCustomer(plan.customerId);
  const installments = useAdminInstallmentsByPlan(plan.id);
  const planPayments = useAdminPaymentsByPlan(plan.id);

  const collectionRate =
    plan.originalAmount > 0 ? Math.round((plan.collectedAmount / plan.originalAmount) * 100) : 0;
  const paidCount = installments.filter((i) => i.status === "paid").length;
  const remainingCount = installments.length - paidCount;
  const overdueCount = installments.filter((i) => i.status === "overdue" || i.status === "failed").length;

  const expectedEndDate = installments[installments.length - 1]?.dueDate ?? null;

  const recentPayment = useMemo(
    () => [...planPayments].filter((p) => p.status === "collected").sort((a, b) => (a.date < b.date ? 1 : -1))[0],
    [planPayments],
  );

  const nextInstallment = useMemo(
    () => installments.find((i) => i.status === "due" || i.status === "upcoming" || i.status === "overdue"),
    [installments],
  );

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <DetailSection title="Plan Details">
        <KeyValueRow label="Plan ID" value={plan.id} />
        <KeyValueRow label="Purchase" value={plan.purchaseDescription} />
        <KeyValueRow label="Original Udhaar" value={formatCompactInr(plan.originalAmount)} />
        <KeyValueRow label="Frequency" value={<span className="capitalize">{plan.frequency}</span>} />
        <KeyValueRow label="Number of Collections" value={String(plan.totalInstallments)} />
        <KeyValueRow label="Installment Amount" value={formatCompactInr(plan.installmentAmount)} />
        <KeyValueRow label="Start Date" value={formatDate(plan.startedAt)} />
        <KeyValueRow label="Expected End Date" value={formatDate(expectedEndDate)} />
        <KeyValueRow
          label="Status"
          value={<StatusBadge tone={planStatusTone[plan.status]}>{humanizeSnakeCase(plan.status)}</StatusBadge>}
        />
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

      <DetailSection title="Collection Progress">
        <p className="text-[12.5px] text-text-secondary">
          {formatCompactInr(plan.collectedAmount)} / {formatCompactInr(plan.originalAmount)} collected
        </p>
        <div className="mt-1.5">
          <MicroProgress percent={collectionRate} />
        </div>
        <div className="mt-3 flex flex-col divide-y divide-border">
          <KeyValueRow label="Collected" value={formatCompactInr(plan.collectedAmount)} />
          <KeyValueRow label="Outstanding" value={formatCompactInr(plan.remainingAmount)} />
          <KeyValueRow label="Paid Collections" value={`${paidCount} of ${installments.length}`} />
          <KeyValueRow label="Remaining Collections" value={String(remainingCount)} />
          <KeyValueRow
            label="Overdue Collections"
            value={overdueCount > 0 ? <span className="text-error">{overdueCount}</span> : "0"}
          />
        </div>
      </DetailSection>

      <DetailSection
        title="Mandate Summary"
        action={
          mandate && (
            <Link href={`/mandates/${mandate.id}`} className="text-[12px] font-medium text-primary hover:underline">
              View Mandate
            </Link>
          )
        }
      >
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
            <KeyValueRow label="Method" value={mandate.method} />
            <KeyValueRow label="Authorized" value={formatDate(mandate.authorizedAt)} />
          </>
        ) : (
          <p className="text-[12.5px] text-text-muted">No mandate set up for this customer.</p>
        )}
      </DetailSection>

      <DetailSection title="Recent Payment">
        {recentPayment ? (
          <>
            <KeyValueRow label="Installment" value={`#${recentPayment.installmentNumber}`} />
            <KeyValueRow label="Amount" value={formatCompactInr(recentPayment.amount)} />
            <KeyValueRow label="Method" value={recentPayment.method} />
            <KeyValueRow label="Date" value={formatDate(recentPayment.date)} />
            <KeyValueRow
              label="Status"
              value={
                <StatusBadge tone={paymentStatusTone[recentPayment.status]}>
                  {humanizeSnakeCase(recentPayment.status)}
                </StatusBadge>
              }
            />
          </>
        ) : (
          <p className="text-[12.5px] text-text-muted">No payments collected yet.</p>
        )}
      </DetailSection>

      <DetailSection
        title="Next Collection"
        action={
          <Link href="/collections" className="text-[12px] font-medium text-primary hover:underline">
            View in Collections
          </Link>
        }
      >
        {nextInstallment ? (
          <>
            <KeyValueRow label="Installment" value={`#${nextInstallment.installmentNumber} of ${plan.totalInstallments}`} />
            <KeyValueRow label="Due Date" value={formatDate(nextInstallment.dueDate)} />
            <KeyValueRow label="Amount" value={formatCompactInr(nextInstallment.amount)} />
            <KeyValueRow
              label="Status"
              value={
                <StatusBadge tone={installmentStatusTone[nextInstallment.status]}>
                  {humanizeSnakeCase(nextInstallment.status)}
                </StatusBadge>
              }
            />
          </>
        ) : (
          <p className="text-[12.5px] text-text-muted">No upcoming collections — plan complete.</p>
        )}
      </DetailSection>
    </div>
  );
}
