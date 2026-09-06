import type { MerchantSubscription, SubscriptionInvoice } from "../types";
import { countByKey } from "./reportHelpers";
import { isIsoDateInRange, type ReportDateRange } from "./reportDateRange";

/**
 * UdhariPay's own SaaS revenue helpers — the ONLY place MRR and subscription
 * revenue are computed. These read exclusively from `subscriptions.ts` /
 * `subscriptionInvoices.ts` and NEVER from `payments.ts`/`installments.ts`.
 * Customer Udhaar repayments settle to the Merchant, not to UdhariPay, and
 * must never enter any figure in this file — see the same note on
 * MerchantSubscription/SubscriptionInvoice in types.ts.
 */

/** MRR = sum of monthlyAmount for currently active recurring subscriptions. Trial subscriptions are not yet paying, so they're excluded. */
export function calculateMrr(subscriptions: MerchantSubscription[]): number {
  return subscriptions
    .filter((subscription) => subscription.status === "active")
    .reduce((sum, subscription) => sum + subscription.monthlyAmount, 0);
}

/** Subscription Revenue = successful (paid) "subscription" type invoices, optionally scoped to a period by paidAt. */
export function calculateSubscriptionRevenue(invoices: SubscriptionInvoice[], range?: ReportDateRange): number {
  return invoices
    .filter(
      (invoice) =>
        invoice.type === "subscription" &&
        invoice.status === "paid" &&
        invoice.paidAt &&
        (!range || isIsoDateInRange(invoice.paidAt, range)),
    )
    .reduce((sum, invoice) => sum + invoice.amount, 0);
}

/** Activation Fee Revenue = paid activation_fee invoices, optionally scoped to a period by paidAt. */
export function calculateActivationFeeRevenue(invoices: SubscriptionInvoice[], range?: ReportDateRange): number {
  return invoices
    .filter(
      (invoice) =>
        invoice.type === "activation_fee" &&
        invoice.status === "paid" &&
        invoice.paidAt &&
        (!range || isIsoDateInRange(invoice.paidAt, range)),
    )
    .reduce((sum, invoice) => sum + invoice.amount, 0);
}

export type SubscriptionMetrics = {
  mrr: number;
  activeSubscriptions: number;
  pastDue: number;
  activationFeesCollected: number;
  activationFeesPending: number;
  subscriptionBillingCollected: number;
  cancelledInPeriod: number;
};

export function calculateSubscriptionMetrics(
  subscriptions: MerchantSubscription[],
  invoices: SubscriptionInvoice[],
  range: ReportDateRange,
): SubscriptionMetrics {
  return {
    mrr: calculateMrr(subscriptions),
    activeSubscriptions: subscriptions.filter((s) => s.status === "active" || s.status === "trial").length,
    pastDue: subscriptions.filter((s) => s.status === "past_due").length,
    activationFeesCollected: calculateActivationFeeRevenue(invoices, range),
    activationFeesPending: subscriptions.filter((s) => s.activationFeeStatus === "pending").length,
    subscriptionBillingCollected: calculateSubscriptionRevenue(invoices, range),
    cancelledInPeriod: subscriptions.filter(
      (s) => s.status === "cancelled" && s.cancelledAt && isIsoDateInRange(s.cancelledAt, range),
    ).length,
  };
}

export type SubscriptionAttentionItem = {
  title: string;
  context: string;
  severity: "error" | "warning" | "info";
  badgeLabel: string;
};

/**
 * Picks ONE real, canonical subscription/invoice-derived attention item for
 * the Dashboard's Needs Attention row — never an invented event. Priority:
 * an actively past-due subscription, then a failed invoice, then a pending
 * activation fee. Returns null rather than fabricating a row when none of
 * the current demo data qualifies.
 */
export function findSubscriptionAttentionItem(
  subscriptions: MerchantSubscription[],
  invoices: SubscriptionInvoice[],
  merchantNameById: Map<string, string>,
): SubscriptionAttentionItem | null {
  const pastDue = subscriptions.find((s) => s.status === "past_due");
  if (pastDue) {
    return {
      title: "Subscription past due",
      context: merchantNameById.get(pastDue.merchantId) ?? pastDue.merchantId,
      severity: "error",
      badgeLabel: "Past Due",
    };
  }

  const failedInvoice = invoices.find((invoice) => invoice.status === "failed");
  if (failedInvoice) {
    return {
      title: failedInvoice.type === "activation_fee" ? "Activation fee payment failed" : "Subscription invoice payment failed",
      context: merchantNameById.get(failedInvoice.merchantId) ?? failedInvoice.merchantId,
      severity: "warning",
      badgeLabel: "Retry needed",
    };
  }

  const pendingActivation = subscriptions.find((s) => s.activationFeeStatus === "pending");
  if (pendingActivation) {
    return {
      title: "Activation fee pending",
      context: merchantNameById.get(pendingActivation.merchantId) ?? pendingActivation.merchantId,
      severity: "warning",
      badgeLabel: "Pending",
    };
  }

  return null;
}

export type SubscriptionPlanBreakdownRow = { key: string; count: number; mrr: number };

export function breakdownSubscriptionsByPlan(subscriptions: MerchantSubscription[]): SubscriptionPlanBreakdownRow[] {
  const rows = new Map<string, SubscriptionPlanBreakdownRow>();
  for (const subscription of subscriptions) {
    const row = rows.get(subscription.planName) ?? { key: subscription.planName, count: 0, mrr: 0 };
    row.count += 1;
    if (subscription.status === "active") row.mrr += subscription.monthlyAmount;
    rows.set(subscription.planName, row);
  }
  return Array.from(rows.values());
}

export function breakdownSubscriptionsByStatus(subscriptions: MerchantSubscription[]): { key: MerchantSubscription["status"]; count: number }[] {
  return countByKey(subscriptions, (subscription) => subscription.status);
}

export function breakdownInvoicesByStatus(invoices: SubscriptionInvoice[]): { key: SubscriptionInvoice["status"]; count: number }[] {
  return countByKey(invoices, (invoice) => invoice.status);
}
