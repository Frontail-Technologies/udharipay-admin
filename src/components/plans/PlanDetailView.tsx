"use client";

import Link from "next/link";
import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { EntityPageHeader } from "@/components/entity/EntityPageHeader";
import { EntitySummaryGrid } from "@/components/entity/EntitySummaryGrid";
import { EntityTabs } from "@/components/entity/EntityTabs";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { PlanOverviewTab } from "@/components/plans/PlanOverviewTab";
import { PlanScheduleTab } from "@/components/plans/PlanScheduleTab";
import { PlanPaymentsTab } from "@/components/plans/PlanPaymentsTab";
import { PlanFollowUpTab } from "@/components/plans/PlanFollowUpTab";
import {
  useAdminPlan,
  useAdminCustomer,
  useAdminMerchant,
  useAdminEmployees,
  useAdminInstallmentsByPlan,
  useAdminPaymentsByPlan,
} from "@/hooks/useAdminEntities";
import { planStatusTone, mandateStatusTone } from "@/data/admin/statusTones";
import { formatCompactInr, humanizeSnakeCase } from "@/lib/format";

const TABS = [
  { value: "overview", label: "Overview" },
  { value: "schedule", label: "Schedule" },
  { value: "payments", label: "Payments" },
  { value: "followup", label: "Follow-up" },
];

export function PlanDetailView({ planId, defaultTab }: { planId: string; defaultTab: string }) {
  const plan = useAdminPlan(planId);
  const customer = useAdminCustomer(plan?.customerId);
  const merchant = useAdminMerchant(plan?.merchantId);
  const employees = useAdminEmployees();
  const installments = useAdminInstallmentsByPlan(planId);
  const planPayments = useAdminPaymentsByPlan(planId);

  // Same name-based Merchant -> Employee relationship used elsewhere
  // (Merchant.assignedEmployeeName) — a documented limitation, not a new
  // one introduced here.
  const assignedEmployee = useMemo(
    () => (merchant ? employees.find((employee) => employee.name === merchant.assignedEmployeeName) : undefined),
    [employees, merchant],
  );

  const overdueAmount = useMemo(
    () =>
      installments
        .filter((installment) => installment.status === "overdue" || installment.status === "failed")
        .reduce((sum, installment) => sum + installment.amount, 0),
    [installments],
  );
  const remainingCollections = useMemo(
    () => installments.filter((installment) => installment.status !== "paid").length,
    [installments],
  );

  if (!plan) return null;

  return (
    <div className="mx-auto flex max-w-6xl min-w-0 flex-col gap-5">
      <EntityPageHeader
        backHref="/plans"
        avatarLabel="PL"
        title={plan.id}
        meta={`${plan.purchaseDescription} · ${customer?.name ?? "—"} · ${merchant?.businessName ?? "—"}`}
        badges={
          <>
            <StatusBadge tone={planStatusTone[plan.status]}>Plan {humanizeSnakeCase(plan.status)}</StatusBadge>
            {customer && (
              <StatusBadge tone={mandateStatusTone[customer.mandateStatus]}>
                Mandate {humanizeSnakeCase(customer.mandateStatus)}
              </StatusBadge>
            )}
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
          { label: "Original Udhaar", value: formatCompactInr(plan.originalAmount) },
          { label: "Collected", value: formatCompactInr(plan.collectedAmount) },
          { label: "Outstanding", value: formatCompactInr(plan.remainingAmount) },
          {
            label: "Overdue",
            value: formatCompactInr(overdueAmount),
            emphasis: overdueAmount > 0 ? "error" : "default",
          },
          { label: "Collections Remaining", value: String(remainingCollections) },
        ]}
      />

      <EntityTabs
        tabs={TABS}
        defaultValue={defaultTab}
        panels={{
          overview: <PlanOverviewTab plan={plan} />,
          schedule: <PlanScheduleTab installments={installments} />,
          payments: <PlanPaymentsTab payments={planPayments} />,
          followup: (
            <PlanFollowUpTab
              planId={plan.id}
              customerId={plan.customerId}
              employeeId={assignedEmployee?.id ?? null}
            />
          ),
        }}
      />
    </div>
  );
}
