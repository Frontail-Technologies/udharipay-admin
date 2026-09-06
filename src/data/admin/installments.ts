import { toIsoDate, DEMO_TODAY } from "./seededRandom";
import { plans } from "./plans";
import { getPaymentsByPlan } from "./payments";
import { computeInstallmentAmounts, computeInstallmentDueDates } from "./planSchedule";
import type { Payment } from "./types";

/**
 * The full, explicit installment schedule — "what is expected/due" — kept
 * deliberately separate from Payment ("what was actually collected", see
 * payments.ts). A Payment may satisfy an Installment; they are never the
 * same record. `payments.ts` only ever materializes past-due rows plus one
 * upcoming row, so most installments here have no matching Payment at
 * all — that's expected, not a data gap: those are the genuinely-upcoming
 * ones.
 *
 * Every installment's `amount` comes from the same `computeInstallmentAmounts`
 * split `payments.ts` uses for the same plan/index, so
 * `sum(installments.amount) === plan.originalAmount` exactly (remainder
 * absorbed by the final installment), and a "paid" installment's
 * `paidAmount` always equals its matching Payment's `amount` — nothing
 * here is a hand-duplicated total.
 */
export type InstallmentStatus = "upcoming" | "due" | "overdue" | "paid" | "partially_paid" | "failed";

export type Installment = {
  id: string;
  planId: string;
  customerId: string;
  merchantId: string;
  installmentNumber: number;
  dueDate: string;
  amount: number;
  status: InstallmentStatus;
  paidAmount: number;
  paidAt: string | null;
  paymentId: string | null;
};

const DEMO_TODAY_ISO = toIsoDate(DEMO_TODAY);

function statusFromPayment(payment: Payment | undefined, dueDate: string): InstallmentStatus {
  if (!payment) {
    // No materialized Payment row for this installment number — it's
    // beyond what payments.ts generated, i.e. genuinely still ahead.
    return dueDate > DEMO_TODAY_ISO ? "upcoming" : "overdue";
  }
  switch (payment.status) {
    case "collected":
      return "paid";
    case "overdue":
      return "overdue";
    case "failed":
      return "failed";
    case "due":
      return dueDate === DEMO_TODAY_ISO ? "due" : dueDate > DEMO_TODAY_ISO ? "upcoming" : "overdue";
  }
}

export const installments: Installment[] = plans.flatMap((plan) => {
  const dueDates = computeInstallmentDueDates(plan);
  const amounts = computeInstallmentAmounts(plan.originalAmount, plan.totalInstallments);
  const planPayments = getPaymentsByPlan(plan.id);

  return dueDates.map((dueDate, index) => {
    const installmentNumber = index + 1;
    const amount = amounts[index];
    const matchingPayment = planPayments.find((payment) => payment.installmentNumber === installmentNumber);
    const status = statusFromPayment(matchingPayment, dueDate);

    return {
      id: `INST-${plan.id}-${installmentNumber}`,
      planId: plan.id,
      customerId: plan.customerId,
      merchantId: plan.merchantId,
      installmentNumber,
      dueDate,
      amount,
      status,
      paidAmount: status === "paid" ? amount : 0,
      paidAt: status === "paid" ? (matchingPayment?.date ?? null) : null,
      paymentId: matchingPayment?.id ?? null,
    } satisfies Installment;
  });
});

export function getInstallmentsByPlan(planId: string): Installment[] {
  return installments.filter((installment) => installment.planId === planId);
}

export function getInstallmentsByCustomer(customerId: string): Installment[] {
  return installments.filter((installment) => installment.customerId === customerId);
}

export function getInstallmentsByMerchant(merchantId: string): Installment[] {
  return installments.filter((installment) => installment.merchantId === merchantId);
}
