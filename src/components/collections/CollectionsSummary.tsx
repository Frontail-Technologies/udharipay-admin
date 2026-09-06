"use client";

import { useMemo } from "react";
import { EntitySummaryGrid } from "@/components/entity/EntitySummaryGrid";
import { useAdminInstallments, useAdminPayments, useAdminCollectionFollowUps } from "@/hooks/useAdminEntities";
import { isInstallmentAtRisk, DEMO_TODAY } from "@/data/admin";
import { useAdminSettings } from "@/store/adminSettingsStore";
import { formatCompactInr } from "@/lib/format";

function daysFromToday(dueDate: string, todayIso: string): number {
  const due = new Date(`${dueDate}T00:00:00`).getTime();
  const today = new Date(`${todayIso}T00:00:00`).getTime();
  return Math.round((due - today) / (1000 * 60 * 60 * 24));
}

export function CollectionsSummary() {
  const installments = useAdminInstallments();
  const payments = useAdminPayments();
  const followUps = useAdminCollectionFollowUps();
  const todayIso = DEMO_TODAY.toISOString().slice(0, 10);
  const atRiskOverdueDays = useAdminSettings().collections.atRiskOverdueDays;

  const items = useMemo(() => {
    const dueToday = installments
      .filter((installment) => installment.status === "due")
      .reduce((sum, installment) => sum + installment.amount, 0);

    const overdue = installments
      .filter((installment) => installment.status === "overdue")
      .reduce((sum, installment) => sum + installment.amount, 0);

    const dueThisWeek = installments
      .filter((installment) => {
        const days = daysFromToday(installment.dueDate, todayIso);
        return (
          (installment.status === "due" || installment.status === "upcoming") && days >= 0 && days <= 7
        );
      })
      .reduce((sum, installment) => sum + installment.amount, 0);

    const collectedToday = payments
      .filter((payment) => payment.status === "collected" && payment.date === todayIso)
      .reduce((sum, payment) => sum + payment.amount, 0);

    const atRisk = installments.filter((installment) =>
      isInstallmentAtRisk({ installment, followUps, thresholdDays: atRiskOverdueDays }),
    ).length;

    return [
      { label: "Due Today", value: formatCompactInr(dueToday) },
      { label: "Overdue", value: formatCompactInr(overdue), emphasis: overdue > 0 ? ("error" as const) : ("default" as const) },
      { label: "Due This Week", value: formatCompactInr(dueThisWeek) },
      { label: "Collected Today", value: formatCompactInr(collectedToday) },
      { label: "At Risk", value: String(atRisk), emphasis: atRisk > 0 ? ("warning" as const) : ("default" as const) },
    ];
  }, [installments, payments, followUps, todayIso, atRiskOverdueDays]);

  return <EntitySummaryGrid items={items} />;
}
