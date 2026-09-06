"use client";

import { useMemo } from "react";
import { DetailSection } from "@/components/entity/DetailSection";
import { KeyValueRow } from "@/components/entity/KeyValueRow";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { EmployeeProfileSection } from "@/components/employees/EmployeeProfileSection";
import { EmployeeContactSection } from "@/components/employees/EmployeeContactSection";
import { useAdminMerchants, useAdminCustomers } from "@/hooks/useAdminEntities";
import type { DerivedEmployee } from "@/data/admin";
import { getPaymentsByMerchant } from "@/data/admin";
import { kycStatusTone, paymentStatusTone } from "@/data/admin/statusTones";
import { formatCompactInr, formatDate, humanizeSnakeCase, pseudoTimeOfDay } from "@/lib/format";

export function EmployeeOverviewTab({ employee }: { employee: DerivedEmployee }) {
  const allMerchants = useAdminMerchants();
  const allCustomers = useAdminCustomers();

  const assignedMerchants = useMemo(
    () => allMerchants.filter((merchant) => merchant.assignedEmployeeName === employee.name),
    [allMerchants, employee.name],
  );

  const customerNameById = useMemo(
    () => new Map(allCustomers.map((customer) => [customer.id, customer.name])),
    [allCustomers],
  );

  const recentPayments = useMemo(() => {
    const payments = assignedMerchants.flatMap((merchant) => getPaymentsByMerchant(merchant.id));
    return [...payments].sort((a, b) => (a.date < b.date ? 1 : -1)).slice(0, 6);
  }, [assignedMerchants]);

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <EmployeeProfileSection employee={employee} />
      <EmployeeContactSection employee={employee} />

      <DetailSection title="Performance Snapshot">
        <KeyValueRow label="Assigned Merchants" value={String(employee.assignedMerchantCount)} />
        <KeyValueRow label="Customers Onboarded" value={String(employee.customersOnboarded)} />
        <KeyValueRow label="Active Plans Created" value={String(employee.activePlansCreated)} />
        <KeyValueRow label="Collections Handled" value={String(employee.collectionsHandled)} />
        <KeyValueRow label="Pending Requests" value={String(employee.pendingRequests)} />
      </DetailSection>

      <DetailSection title="KYC Summary">
        <KeyValueRow
          label="KYC Status"
          value={
            <StatusBadge tone={kycStatusTone[employee.kycStatus]}>
              {humanizeSnakeCase(employee.kycStatus)}
            </StatusBadge>
          }
        />
        <KeyValueRow label="PAN" value={employee.panMasked} />
        <KeyValueRow label="Identity Proof" value={employee.idProofMasked} />
        <KeyValueRow label="Last Reviewed" value={formatDate(employee.kycLastReviewedAt)} />
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
                  <p className="truncate text-[11.5px] text-text-muted">Installment · {payment.planId}</p>
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
