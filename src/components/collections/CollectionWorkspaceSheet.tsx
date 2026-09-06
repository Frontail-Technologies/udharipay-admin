"use client";

import Link from "next/link";
import { useMemo } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { AddFollowUpDialog } from "@/components/collections/AddFollowUpDialog";
import {
  useAdminCustomer,
  useAdminMerchant,
  useAdminPaymentsByPlan,
  useAdminFollowUpsByPlan,
  useAdminEmployees,
} from "@/hooks/useAdminEntities";
import type { Installment } from "@/data/admin";
import {
  installmentStatusTone,
  paymentStatusTone,
  mandateStatusTone,
} from "@/data/admin/statusTones";
import { formatCompactInr, formatDate, formatDueContext, humanizeSnakeCase } from "@/lib/format";
import { DEMO_TODAY } from "@/data/admin";

const TODAY_ISO = DEMO_TODAY.toISOString().slice(0, 10);

export function CollectionWorkspaceSheet({
  installment,
  onOpenChange,
}: {
  installment: Installment | null;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Sheet open={Boolean(installment)} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full gap-0 overflow-y-auto sm:max-w-md">
        {installment && <WorkspaceBody installment={installment} />}
      </SheetContent>
    </Sheet>
  );
}

function WorkspaceBody({ installment }: { installment: Installment }) {
  const customer = useAdminCustomer(installment.customerId);
  const merchant = useAdminMerchant(installment.merchantId);
  const employees = useAdminEmployees();
  const planPayments = useAdminPaymentsByPlan(installment.planId);
  const followUps = useAdminFollowUpsByPlan(installment.planId);

  const assignedEmployee = useMemo(
    () => (merchant ? employees.find((employee) => employee.name === merchant.assignedEmployeeName) : undefined),
    [employees, merchant],
  );

  const recentPayments = useMemo(
    () => [...planPayments].sort((a, b) => (a.date < b.date ? 1 : -1)).slice(0, 3),
    [planPayments],
  );
  const recentFollowUps = useMemo(
    () => [...followUps].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1)).slice(0, 3),
    [followUps],
  );

  return (
    <div className="flex h-full flex-col">
      <SheetHeader className="border-b border-border px-4 py-4">
        <SheetTitle className="text-[15px] font-semibold text-text-primary">
          {customer?.name ?? installment.customerId}
        </SheetTitle>
        <SheetDescription className="text-[12px] text-text-muted">
          {installment.planId} · Installment #{installment.installmentNumber}
        </SheetDescription>
      </SheetHeader>

      <div className="flex-1 overflow-y-auto px-4 py-4">
        <div className="rounded-lg border border-border bg-surface-muted/40 p-3">
          <div className="grid grid-cols-2 gap-y-2 text-[12.5px]">
            <span className="text-text-muted">Merchant</span>
            <span className="text-right text-text-primary">{merchant?.businessName ?? "—"}</span>
            <span className="text-text-muted">Due</span>
            <span className="text-right text-text-primary">
              {formatDate(installment.dueDate)} · {formatDueContext(installment.dueDate, TODAY_ISO)}
            </span>
            <span className="text-text-muted">Amount</span>
            <span className="text-right font-medium text-text-primary">{formatCompactInr(installment.amount)}</span>
            <span className="text-text-muted">Status</span>
            <span className="text-right">
              <StatusBadge tone={installmentStatusTone[installment.status]}>
                {humanizeSnakeCase(installment.status)}
              </StatusBadge>
            </span>
          </div>
        </div>

        <div className="mt-4">
          <h3 className="text-[12.5px] font-semibold text-text-primary">Contact Context</h3>
          <div className="mt-2 flex flex-col gap-1.5 text-[12.5px]">
            <div className="flex items-center justify-between">
              <span className="text-text-muted">Phone</span>
              <span className="text-text-primary">{customer?.phone ?? "—"}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-text-muted">Mandate</span>
              {customer ? (
                <StatusBadge tone={mandateStatusTone[customer.mandateStatus]}>
                  {humanizeSnakeCase(customer.mandateStatus)}
                </StatusBadge>
              ) : (
                <span className="text-text-primary">—</span>
              )}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-text-muted">Assigned Employee</span>
              <span className="text-text-primary">{assignedEmployee?.name ?? "—"}</span>
            </div>
          </div>
        </div>

        <div className="mt-4">
          <h3 className="text-[12.5px] font-semibold text-text-primary">Recent Payments</h3>
          {recentPayments.length === 0 ? (
            <p className="mt-2 text-[12px] text-text-muted">No payments recorded yet.</p>
          ) : (
            <ul className="mt-2 flex flex-col divide-y divide-border">
              {recentPayments.map((payment) => (
                <li key={payment.id} className="flex items-center justify-between gap-2 py-1.5 text-[12.5px]">
                  <span className="text-text-secondary">
                    #{payment.installmentNumber} · {formatDate(payment.date)}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="tabular-nums text-text-primary">{formatCompactInr(payment.amount)}</span>
                    <StatusBadge tone={paymentStatusTone[payment.status]}>
                      {humanizeSnakeCase(payment.status)}
                    </StatusBadge>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="mt-4">
          <h3 className="text-[12.5px] font-semibold text-text-primary">Recent Follow-ups</h3>
          {recentFollowUps.length === 0 ? (
            <p className="mt-2 text-[12px] text-text-muted">No follow-up activity logged yet.</p>
          ) : (
            <ul className="mt-2 flex flex-col gap-2">
              {recentFollowUps.map((entry) => (
                <li key={entry.id} className="rounded-md bg-surface-muted px-2.5 py-2 text-[12px]">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-text-primary">{humanizeSnakeCase(entry.type)}</span>
                    <span className="text-[10.5px] text-text-muted">{formatDate(entry.createdAt.slice(0, 10))}</span>
                  </div>
                  <p className="mt-0.5 text-text-secondary">{entry.note}</p>
                </li>
              ))}
            </ul>
          )}
          <Link
            href={`/plans/${installment.planId}?tab=followup`}
            className="mt-2 inline-block text-[12px] font-medium text-primary hover:underline"
          >
            View full follow-up history
          </Link>
        </div>
      </div>

      <div className="border-t border-border p-4">
        <AddFollowUpDialog
          customerId={installment.customerId}
          planId={installment.planId}
          installmentId={installment.id}
          employeeId={assignedEmployee?.id ?? null}
          triggerVariant="default"
          triggerLabel="Add Follow-up"
        />
      </div>
    </div>
  );
}
