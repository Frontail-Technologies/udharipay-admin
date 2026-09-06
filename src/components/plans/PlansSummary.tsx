"use client";

import { useMemo } from "react";
import { EntitySummaryGrid } from "@/components/entity/EntitySummaryGrid";
import { useAdminPlans, useAdminInstallments } from "@/hooks/useAdminEntities";
import { formatCompactInr } from "@/lib/format";

export function PlansSummary() {
  const plans = useAdminPlans();
  const installments = useAdminInstallments();

  const items = useMemo(() => {
    const activePlans = plans.filter((plan) => plan.status !== "completed").length;
    const outstanding = plans.reduce((sum, plan) => sum + plan.remainingAmount, 0);
    const collected = plans.reduce((sum, plan) => sum + plan.collectedAmount, 0);
    const dueToday = installments
      .filter((installment) => installment.status === "due")
      .reduce((sum, installment) => sum + installment.amount, 0);
    const overdue = installments
      .filter((installment) => installment.status === "overdue")
      .reduce((sum, installment) => sum + installment.amount, 0);
    const collectionRate = collected + outstanding > 0 ? Math.round((collected / (collected + outstanding)) * 100) : 0;

    return [
      { label: "Active Plans", value: String(activePlans) },
      { label: "Outstanding", value: formatCompactInr(outstanding) },
      { label: "Due Today", value: formatCompactInr(dueToday) },
      { label: "Overdue", value: formatCompactInr(overdue), emphasis: overdue > 0 ? ("error" as const) : ("default" as const) },
      { label: "Collection Rate", value: `${collectionRate}%` },
    ];
  }, [plans, installments]);

  return <EntitySummaryGrid items={items} />;
}
