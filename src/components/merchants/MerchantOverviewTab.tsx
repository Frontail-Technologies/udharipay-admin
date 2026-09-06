"use client";

import { useMemo } from "react";
import { DetailSection } from "@/components/entity/DetailSection";
import { KeyValueRow } from "@/components/entity/KeyValueRow";
import { MicroProgress } from "@/components/entity/MicroProgress";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { MerchantBusinessProfileSection } from "@/components/merchants/MerchantBusinessProfileSection";
import { MerchantContactAddressSection } from "@/components/merchants/MerchantContactAddressSection";
import { MerchantBankSummary } from "@/components/merchants/MerchantBankSummary";
import { useAdminCustomers } from "@/hooks/useAdminEntities";
import type { DerivedMerchant } from "@/data/admin";
import { getPaymentsByMerchant } from "@/data/admin";
import {
  kycStatusTone,
  subscriptionStatusTone,
  paymentStatusTone,
  activationFeeStatusTone,
  autoPayStatusTone,
} from "@/data/admin/statusTones";
import { formatCompactInr, formatDate, humanizeSnakeCase, pseudoTimeOfDay } from "@/lib/format";

export function MerchantOverviewTab({ merchant }: { merchant: DerivedMerchant }) {
  const recentPayments = useMemo(
    () => [...getPaymentsByMerchant(merchant.id)].sort((a, b) => (a.date < b.date ? 1 : -1)).slice(0, 6),
    [merchant.id],
  );
  const customers = useAdminCustomers();
  const customerNameById = useMemo(
    () => new Map(customers.map((customer) => [customer.id, customer.name])),
    [customers],
  );

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <MerchantBusinessProfileSection merchant={merchant} />
      <MerchantContactAddressSection merchant={merchant} />

      <DetailSection title="Collection Health">
        <KeyValueRow label="Outstanding" value={formatCompactInr(merchant.outstanding)} />
        <KeyValueRow
          label="Overdue"
          value={
            merchant.overdueAmount > 0 ? (
              <span className="text-error">{formatCompactInr(merchant.overdueAmount)}</span>
            ) : (
              formatCompactInr(0)
            )
          }
        />
        <KeyValueRow label="Due Today" value={formatCompactInr(merchant.dueToday)} />
        <KeyValueRow label="Collected This Month" value={formatCompactInr(merchant.collectedThisMonth)} />
        <KeyValueRow label="Active Customers" value={String(merchant.activeCustomerCount)} />
        <KeyValueRow label="Active Plans" value={String(merchant.activePlans)} />
        <KeyValueRow label="Collection Rate" value={<MicroProgress percent={merchant.collectionRate} />} />
      </DetailSection>

      <DetailSection title="Verification Summary">
        <KeyValueRow
          label="KYC Status"
          value={
            <StatusBadge tone={kycStatusTone[merchant.kycStatus]}>
              {humanizeSnakeCase(merchant.kycStatus)}
            </StatusBadge>
          }
        />
        <KeyValueRow label="Business PAN" value={merchant.businessPanMasked} />
        <KeyValueRow label="GST" value={merchant.gstMasked} />
        <KeyValueRow
          label="Bank Verified"
          value={
            <StatusBadge tone={merchant.bank.verified ? "success" : "warning"}>
              {merchant.bank.verified ? "Verified" : "Pending"}
            </StatusBadge>
          }
        />
        <KeyValueRow
          label="Owner Identity"
          value={
            <StatusBadge tone={merchant.ownerIdVerified ? "success" : "warning"}>
              {merchant.ownerIdVerified ? "Verified" : "Pending"}
            </StatusBadge>
          }
        />
        <KeyValueRow label="Last Reviewed" value={formatDate(merchant.kycLastReviewedAt)} />
      </DetailSection>

      <MerchantBankSummary merchant={merchant} />

      <DetailSection title="Subscription Summary">
        <KeyValueRow label="Plan" value={merchant.subscriptionPlan} />
        <KeyValueRow
          label="Subscription Status"
          value={
            <StatusBadge tone={subscriptionStatusTone[merchant.subscriptionStatus]}>
              {humanizeSnakeCase(merchant.subscriptionStatus)}
            </StatusBadge>
          }
        />
        <KeyValueRow
          label="Activation Fee"
          value={
            <StatusBadge tone={activationFeeStatusTone[merchant.activationFeeStatus]}>
              {humanizeSnakeCase(merchant.activationFeeStatus)}
            </StatusBadge>
          }
        />
        <KeyValueRow
          label="AutoPay"
          value={
            <StatusBadge tone={autoPayStatusTone[merchant.autoPayStatus]}>
              {humanizeSnakeCase(merchant.autoPayStatus)}
            </StatusBadge>
          }
        />
        <KeyValueRow label="Next Debit" value={formatDate(merchant.nextDebitDate)} />
        {(merchant.subscriptionStatus === "grace" || merchant.subscriptionStatus === "restricted") && (
          <p className="mt-2 text-[11.5px] text-warning">
            {merchant.subscriptionStatus === "grace"
              ? "In grace period — resolve billing to avoid restriction."
              : "Access restricted pending subscription resolution."}
          </p>
        )}
      </DetailSection>

      <DetailSection title="Recent Activity" className="lg:col-span-2">
        {recentPayments.length === 0 ? (
          <p className="py-4 text-center text-[12.5px] text-text-muted">No activity yet.</p>
        ) : (
          <ul className="flex flex-col divide-y divide-border">
            {recentPayments.map((payment) => (
              <li key={payment.id} className="flex items-center justify-between gap-3 py-2.5 text-[13px]">
                <div className="min-w-0">
                  <p className="truncate font-medium text-text-primary">
                    {customerNameById.get(payment.customerId) ?? "—"}
                  </p>
                  <p className="truncate text-[11.5px] text-text-muted">
                    Installment · {payment.planId}
                  </p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-0.5">
                  <div className="flex items-center gap-2">
                    <span className="tabular-nums text-text-primary">{formatCompactInr(payment.amount)}</span>
                    <StatusBadge tone={paymentStatusTone[payment.status]}>
                      {humanizeSnakeCase(payment.status)}
                    </StatusBadge>
                  </div>
                  <p className="text-[11px] text-text-muted">
                    {formatDate(payment.date)} · {pseudoTimeOfDay(payment.id)}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </DetailSection>
    </div>
  );
}
