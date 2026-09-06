import { addDays, toIsoDate } from "./seededRandom";
import type { PlanFrequency } from "./types";

/**
 * The one source of truth for turning (originalAmount, frequency,
 * totalInstallments, startedAt) into a concrete schedule — used by the
 * seed generators for both `payments.ts` (which only materializes
 * past-due + the next upcoming row) and `installments.ts` (which
 * materializes the full schedule). Both read from these two functions so
 * a given installment number always has the identical due date and amount
 * in both places — that identity is what lets a paid Installment resolve
 * against its Payment without ever needing a second, hand-maintained copy
 * of the number.
 *
 * Number of Collections is the source of truth (matches the approved
 * mobile Collection Plan model) — installment amount is always derived
 * from it, never the other way around.
 */

/** Per-installment amounts, guaranteed to sum to exactly `originalAmount` — the final installment absorbs any remainder from integer division. */
export function computeInstallmentAmounts(originalAmount: number, totalInstallments: number): number[] {
  const base = Math.floor(originalAmount / totalInstallments);
  const amounts = Array.from({ length: totalInstallments }, () => base);
  const remainder = originalAmount - base * totalInstallments;
  amounts[totalInstallments - 1] += remainder;
  return amounts;
}

export function installmentStepDays(frequency: PlanFrequency): number {
  return frequency === "weekly" ? 7 : 30;
}

/** ISO due date for each installment (index 0 = installment #1), evenly stepped from `startedAt`. */
export function computeInstallmentDueDates(params: {
  startedAt: string;
  frequency: PlanFrequency;
  totalInstallments: number;
}): string[] {
  const stepDays = installmentStepDays(params.frequency);
  const started = new Date(`${params.startedAt}T00:00:00`);
  return Array.from({ length: params.totalInstallments }, (_, index) =>
    toIsoDate(addDays(started, index * stepDays)),
  );
}
