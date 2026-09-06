"use client";

import { useMemo } from "react";
import { EntitySummaryGrid } from "@/components/entity/EntitySummaryGrid";
import { useAdminSubscriptions } from "@/hooks/useAdminEntities";
import { DEMO_TODAY } from "@/data/admin/seededRandom";
import { formatCompactInr } from "@/lib/format";

/**
 * MRR and every figure here derive strictly from subscription/billing
 * records (src/data/admin/subscriptions.ts) — never from customer Udhaar
 * principal or collection data. See Financial Separation note in
 * subscriptions.ts / subscriptionInvoices.ts.
 */
export function SubscriptionsSummary() {
  const subscriptions = useAdminSubscriptions();

  const items = useMemo(() => {
    const activeSubs = subscriptions.filter((s) => s.status === "active" || s.status === "trial");
    const mrr = subscriptions
      .filter((s) => s.status === "active")
      .reduce((sum, s) => sum + s.monthlyAmount, 0);
    const pastDue = subscriptions.filter((s) => s.status === "past_due").length;
    const activationFeesPending = subscriptions.filter((s) => s.activationFeeStatus === "pending").length;

    const currentMonth = DEMO_TODAY.toISOString().slice(0, 7);
    const cancelledThisMonth = subscriptions.filter(
      (s) => s.status === "cancelled" && s.cancelledAt?.slice(0, 7) === currentMonth,
    ).length;

    return [
      { label: "Active Subscriptions", value: String(activeSubs.length) },
      { label: "MRR", value: formatCompactInr(mrr) },
      { label: "Past Due", value: String(pastDue), emphasis: pastDue > 0 ? ("warning" as const) : ("default" as const) },
      { label: "Activation Fees Pending", value: String(activationFeesPending) },
      { label: "Cancelled This Month", value: String(cancelledThisMonth) },
    ];
  }, [subscriptions]);

  return <EntitySummaryGrid items={items} />;
}
