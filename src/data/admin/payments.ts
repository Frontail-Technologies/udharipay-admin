import { toIsoDate, DEMO_TODAY } from "./seededRandom";
import { plans } from "./plans";
import { computeInstallmentAmounts, computeInstallmentDueDates } from "./planSchedule";
import type { Payment, PaymentMethod, PaymentStatus } from "./types";

const METHODS: PaymentMethod[] = ["UPI", "Mandate Debit", "Cash", "Card"];
const DEMO_TODAY_ISO = toIsoDate(DEMO_TODAY);

function statusForPastInstallment(counter: number): PaymentStatus {
  if (counter % 9 === 0) return "overdue";
  if (counter % 13 === 0) return "failed";
  return "collected";
}

let globalCounter = 0;

/**
 * Materializes one row per past-due installment (collected/overdue/failed)
 * plus exactly one "due" row for the next upcoming installment — future
 * installments beyond that aren't materialized as rows here (the full
 * schedule, including untouched future rows, lives in `installments.ts`).
 * Due dates and per-installment amounts come from `planSchedule.ts`, the
 * same functions `installments.ts` uses, so a given installment number
 * always has an identical due date and amount in both places — that's
 * what lets a paid Installment resolve against its Payment with no
 * separate reconciliation step.
 */
export const payments: Payment[] = plans.flatMap((plan) => {
  const dueDates = computeInstallmentDueDates(plan);
  const amounts = computeInstallmentAmounts(plan.originalAmount, plan.totalInstallments);
  const rows: Payment[] = [];

  for (let installmentIndex = 0; installmentIndex < plan.totalInstallments; installmentIndex += 1) {
    const dueDate = dueDates[installmentIndex];
    const amount = amounts[installmentIndex];
    const isPast = dueDate <= DEMO_TODAY_ISO;

    globalCounter += 1;
    const method = METHODS[globalCounter % METHODS.length];

    if (isPast) {
      const status = statusForPastInstallment(globalCounter);
      rows.push({
        id: `PAY-${500000 + globalCounter * 7}`,
        planId: plan.id,
        customerId: plan.customerId,
        merchantId: plan.merchantId,
        installmentNumber: installmentIndex + 1,
        amount,
        method,
        status,
        date: dueDate,
        reference: `TXN${800000 + globalCounter * 11}`,
      });
    } else {
      rows.push({
        id: `PAY-${500000 + globalCounter * 7}`,
        planId: plan.id,
        customerId: plan.customerId,
        merchantId: plan.merchantId,
        installmentNumber: installmentIndex + 1,
        amount,
        method,
        status: "due",
        date: dueDate,
        reference: "-",
      });
      // Only the next upcoming installment is materialized as a row.
      break;
    }
  }

  return rows;
});

export function getPaymentsByPlan(planId: string): Payment[] {
  return payments.filter((payment) => payment.planId === planId);
}

export function getPaymentsByCustomer(customerId: string): Payment[] {
  return payments.filter((payment) => payment.customerId === customerId);
}

export function getPaymentsByMerchant(merchantId: string): Payment[] {
  return payments.filter((payment) => payment.merchantId === merchantId);
}
