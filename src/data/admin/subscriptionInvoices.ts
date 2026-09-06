import { addDays, toIsoDate } from "./seededRandom";
import { subscriptions } from "./subscriptions";
import type { SubscriptionInvoice, SubscriptionInvoiceStatus } from "./types";

const MONTHLY_HISTORY_LENGTH = 4;

let counter = 0;

function nextId(prefix: string): string {
  counter += 1;
  return `${prefix}-${9001 + counter * 3}`;
}

/**
 * Separate SaaS billing records — never built from or reconciled against
 * Customer Payment records. This is money owed TO UdhariPay (activation
 * fee + monthly subscription), not customer principal collected on the
 * merchant's behalf.
 */
export const subscriptionInvoices: SubscriptionInvoice[] = subscriptions.flatMap((subscription) => {
  const rows: SubscriptionInvoice[] = [];

  const activationPaid = subscription.activationFeeStatus === "paid";
  rows.push({
    id: nextId("INV-ACT"),
    subscriptionId: subscription.id,
    merchantId: subscription.merchantId,
    type: "activation_fee",
    period: null,
    amount: subscription.activationFeeAmount,
    status: activationPaid ? "paid" : "pending",
    dueDate: subscription.createdAt,
    paidAt: activationPaid ? subscription.createdAt : null,
    reference: activationPaid ? `TXN${700000 + counter * 11}` : null,
  });

  if (subscription.status === "trial") return rows;

  const periodStart = new Date(`${subscription.currentPeriodStart}T00:00:00`);

  for (let cycle = MONTHLY_HISTORY_LENGTH - 1; cycle >= 0; cycle -= 1) {
    const cycleStart = toIsoDate(addDays(periodStart, -cycle * 30));
    const isCurrentCycle = cycle === 0;
    const isPastCancellation = subscription.cancelledAt !== null && cycleStart > subscription.cancelledAt;
    if (isPastCancellation) continue;

    let status: SubscriptionInvoiceStatus = "paid";
    if (isCurrentCycle && subscription.status === "past_due") status = "failed";
    else if (isCurrentCycle && subscription.status === "paused") status = "pending";
    else if (isCurrentCycle && subscription.status === "cancelled") status = "waived";

    rows.push({
      id: nextId("INV-SUB"),
      subscriptionId: subscription.id,
      merchantId: subscription.merchantId,
      type: "subscription",
      period: cycleStart.slice(0, 7),
      amount: subscription.monthlyAmount,
      status,
      dueDate: cycleStart,
      paidAt: status === "paid" ? cycleStart : null,
      reference: status === "paid" ? `TXN${710000 + counter * 7}` : null,
    });
  }

  return rows;
});

export function getSubscriptionInvoicesBySubscription(subscriptionId: string): SubscriptionInvoice[] {
  return subscriptionInvoices.filter((invoice) => invoice.subscriptionId === subscriptionId);
}

export function getSubscriptionInvoicesByMerchant(merchantId: string): SubscriptionInvoice[] {
  return subscriptionInvoices.filter((invoice) => invoice.merchantId === merchantId);
}
