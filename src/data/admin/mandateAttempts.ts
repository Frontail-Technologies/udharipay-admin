import { addDays, toIsoDate, DEMO_TODAY } from "./seededRandom";
import { mandates } from "./mandates";
import type { MandateAttempt, MandateAttemptStatus } from "./types";

const FAILURE_REASONS = [
  "Insufficient balance",
  "Bank declined the debit request",
  "Account limit exceeded",
  "Customer bank server timeout",
] as const;

/**
 * Deterministic demo attempt history only — an attempt never creates or
 * touches a Payment record, and "failed" here is not the same thing as a
 * failed Payment or an automatic mandate revocation.
 */
function attemptsForMandate(index: number, status: MandateAttempt["status"] | string): number {
  if (status === "pending_authorization") return 0;
  if (status === "failed") return 1;
  return 2 + (index % 2);
}

let counter = 0;

export const mandateAttempts: MandateAttempt[] = mandates.flatMap((mandate, mandateIndex) => {
  const total = attemptsForMandate(mandateIndex, mandate.status);
  return Array.from({ length: total }, (_, attemptIndex) => {
    counter += 1;
    const attemptedAt = toIsoDate(addDays(DEMO_TODAY, -(3 + attemptIndex * 9 + (mandateIndex % 5))));

    let status: MandateAttemptStatus;
    if (mandate.status === "pending_authorization") {
      status = "pending";
    } else if (mandate.status === "failed" || (attemptIndex === 0 && counter % 5 === 0)) {
      status = "failed";
    } else {
      status = "success";
    }

    return {
      id: `MATT-${5001 + counter * 3}`,
      mandateId: mandate.id,
      planId: mandate.planId,
      installmentId: null,
      attemptedAt,
      amount: mandate.maxAmount ? Math.round(mandate.maxAmount * 0.4) : null,
      status,
      failureReason: status === "failed" ? FAILURE_REASONS[counter % FAILURE_REASONS.length] : null,
      providerReferenceMasked: status !== "pending" ? `TXN${900000 + counter * 13}` : null,
    } satisfies MandateAttempt;
  });
});

export function getMandateAttemptsByMandate(mandateId: string): MandateAttempt[] {
  return mandateAttempts.filter((attempt) => attempt.mandateId === mandateId);
}
