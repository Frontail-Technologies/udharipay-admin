import { toIsoDate, DEMO_TODAY } from "./seededRandom";
import { DEFAULT_AT_RISK_OVERDUE_DAYS } from "./settings";
import type { Installment } from "./installments";
import type { CollectionFollowUp } from "./types";

/**
 * At Risk is a fixed, documented rule — not a score or model. An overdue
 * installment is At Risk when ANY of:
 *   - it's been overdue at least `thresholdDays` days, or
 *   - its matching payment attempt failed (status "failed"), or
 *   - it already has AT_RISK_NO_RESPONSE_THRESHOLD+ logged "no_response" follow-ups.
 *
 * `thresholdDays` is a required, explicit parameter — this function never
 * reads a hardcoded constant or localStorage itself (Part N: "Do not read
 * localStorage directly inside pure data files"). The canonical value comes
 * from `settings.collections.atRiskOverdueDays` via `useAdminSettings()`,
 * injected by every caller; `DEFAULT_AT_RISK_OVERDUE_DAYS` (settings.ts) is
 * only the shipped default for that setting, re-exported here for
 * call sites that haven't loaded settings yet.
 */
export { DEFAULT_AT_RISK_OVERDUE_DAYS };
export const AT_RISK_NO_RESPONSE_THRESHOLD = 2;

const DEMO_TODAY_ISO = toIsoDate(DEMO_TODAY);

export function daysOverdue(dueDate: string): number {
  const due = new Date(`${dueDate}T00:00:00`).getTime();
  const today = new Date(`${DEMO_TODAY_ISO}T00:00:00`).getTime();
  return Math.max(0, Math.round((today - due) / (1000 * 60 * 60 * 24)));
}

export function isInstallmentAtRisk(params: {
  installment: Installment;
  followUps: CollectionFollowUp[];
  thresholdDays: number;
}): boolean {
  const { installment, followUps, thresholdDays } = params;
  if (installment.status !== "overdue" && installment.status !== "failed") return false;

  if (installment.status === "failed") return true;
  if (daysOverdue(installment.dueDate) >= thresholdDays) return true;

  const noResponseCount = followUps.filter(
    (entry) => entry.installmentId === installment.id && entry.type === "no_response",
  ).length;
  return noResponseCount >= AT_RISK_NO_RESPONSE_THRESHOLD;
}
