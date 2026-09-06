import { addDays, toIsoDate, DEMO_TODAY } from "./seededRandom";
import { customers } from "./customers";
import { computeInstallmentAmounts } from "./planSchedule";
import type { PlanFrequency, UdhaarPlan } from "./types";

const PURCHASE_DESCRIPTIONS = [
  "Grocery essentials",
  "Festival stock purchase",
  "Monthly household supplies",
  "Electronics — mobile accessories",
  "Clothing & footwear",
  "Kirana restock",
  "Utensils & home goods",
] as const;

const FREQUENCIES: PlanFrequency[] = ["weekly", "monthly"];

function planCountForCustomer(globalCustomerIndex: number): number {
  return globalCustomerIndex % 2 === 0 ? 1 : 2;
}

export const plans: UdhaarPlan[] = customers.flatMap((customer, customerIndex) => {
  const planCount = planCountForCustomer(customerIndex);

  return Array.from({ length: planCount }, (_, localIndex) => {
    const globalIndex = customerIndex * 3 + localIndex;
    const originalAmount = 1500 + ((globalIndex * 673) % 12000);
    const totalInstallments = 4 + (globalIndex % 5);
    // Representative/display amount only — the real per-installment amounts
    // (which the seeded schedule and payments both use) are computed by
    // computeInstallmentAmounts() so the schedule total always reconciles
    // exactly to originalAmount, remainder absorbed by the final installment.
    const installmentAmount = computeInstallmentAmounts(originalAmount, totalInstallments)[0];
    const frequency = FREQUENCIES[globalIndex % FREQUENCIES.length];
    const startOffsetDays = frequency === "weekly" ? totalInstallments * 7 : totalInstallments * 30;
    // Stagger start dates so plans sit at different points in their schedule.
    // Every 5th plan is pushed fully into the past so some plans legitimately
    // reach "completed" once every installment has a due date behind today.
    const elapsedFraction = globalIndex % 5 === 0 ? 1.15 : 0.3 + ((globalIndex * 17) % 60) / 100;
    const startedAt = toIsoDate(
      addDays(DEMO_TODAY, -Math.round(startOffsetDays * elapsedFraction)),
    );

    return {
      id: `PLAN-${30021 + globalIndex * 3}`,
      customerId: customer.id,
      merchantId: customer.merchantId,
      purchaseDescription: PURCHASE_DESCRIPTIONS[globalIndex % PURCHASE_DESCRIPTIONS.length],
      originalAmount,
      installmentAmount,
      frequency,
      totalInstallments,
      startedAt,
    } satisfies UdhaarPlan;
  });
});

export function getPlanById(planId: string): UdhaarPlan | undefined {
  return plans.find((plan) => plan.id === planId);
}

export function getPlansByCustomer(customerId: string): UdhaarPlan[] {
  return plans.filter((plan) => plan.customerId === customerId);
}

export function getPlansByMerchant(merchantId: string): UdhaarPlan[] {
  return plans.filter((plan) => plan.merchantId === merchantId);
}
