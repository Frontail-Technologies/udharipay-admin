import { addDays, toIsoDate, DEMO_TODAY } from "../seededRandom";
import type { Mandate, MandateAttempt, MandateMethod } from "../types";
import { countByKey } from "./reportHelpers";
import { daysBetweenIso, isIsoDateInRange, type ReportDateRange } from "./reportDateRange";

/**
 * A pending-authorization mandate only counts as an "issue" once it has sat
 * unresolved for this many days — a mandate created yesterday is still a
 * normal in-flight authorization, not an operational problem yet.
 */
export const MANDATE_PENDING_ISSUE_THRESHOLD_DAYS = 2;

/**
 * Single, shared definition of "this mandate needs operator attention" —
 * reused by BOTH the Dashboard's "Mandate Issues" metric and the Mandates
 * Report's "Mandates Needing Action" metric, so the same mandate is never
 * counted differently in two places (Dashboard reconciles with /mandates).
 * A healthy Active mandate is never counted.
 *
 * - failed / revoked / expired: always an issue — collection cannot happen.
 * - paused: always an issue in this demo — pausing is a deliberate manual
 *   action that always requires an equally deliberate resume; it never
 *   "heals" on its own.
 * - pending_authorization: only an issue once it has been waiting longer
 *   than MANDATE_PENDING_ISSUE_THRESHOLD_DAYS.
 * - active: never an issue.
 */
export function isMandateIssue(mandate: Mandate, referenceDate: Date = DEMO_TODAY): boolean {
  switch (mandate.status) {
    case "failed":
    case "revoked":
    case "expired":
    case "paused":
      return true;
    case "pending_authorization": {
      const ageDays = daysBetweenIso(mandate.createdAt, toIsoDate(referenceDate));
      return ageDays >= MANDATE_PENDING_ISSUE_THRESHOLD_DAYS;
    }
    case "active":
      return false;
  }
}

export function countMandateIssues(mandates: Mandate[], referenceDate: Date = DEMO_TODAY): number {
  return mandates.filter((mandate) => isMandateIssue(mandate, referenceDate)).length;
}

export type MandateMetrics = {
  activeMandates: number;
  pendingAuthorization: number;
  needingAction: number;
  /** % of all mandates that were ever authorized (authorizedAt set). */
  authorizationRate: number;
  /**
   * % of resolved (non-pending) attempts that succeeded — null when there
   * are no attempts at all, per "only calculate attempt success when
   * attempts exist" (never render a fake 0%).
   */
  attemptSuccessRate: number | null;
  totalAttempts: number;
};

export function calculateMandateMetrics(
  mandates: Mandate[],
  attempts: MandateAttempt[] = [],
  referenceDate: Date = DEMO_TODAY,
): MandateMetrics {
  const activeMandates = mandates.filter((mandate) => mandate.status === "active").length;
  const pendingAuthorization = mandates.filter((mandate) => mandate.status === "pending_authorization").length;
  const needingAction = countMandateIssues(mandates, referenceDate);
  const authorizationRate =
    mandates.length > 0
      ? Math.round((mandates.filter((mandate) => mandate.authorizedAt !== null).length / mandates.length) * 100)
      : 0;

  const resolvedAttempts = attempts.filter((attempt) => attempt.status !== "pending");
  const attemptSuccessRate =
    resolvedAttempts.length > 0
      ? Math.round(
          (resolvedAttempts.filter((attempt) => attempt.status === "success").length / resolvedAttempts.length) * 100,
        )
      : null;

  return { activeMandates, pendingAuthorization, needingAction, authorizationRate, attemptSuccessRate, totalAttempts: attempts.length };
}

export function breakdownMandatesByMethod(mandates: Mandate[]): { key: MandateMethod; count: number }[] {
  return countByKey(mandates, (mandate) => mandate.method);
}

export function breakdownMandatesByStatus(mandates: Mandate[]): { key: Mandate["status"]; count: number }[] {
  return countByKey(mandates, (mandate) => mandate.status);
}

export function breakdownMandatesByProvider(mandates: Mandate[]): { key: string; count: number }[] {
  return countByKey(mandates, (mandate) => mandate.provider);
}

export type MandateAttemptTrendPoint = { label: string; success: number; failed: number };

/** Below this many resolved attempts in range, a week-by-week trend is noise, not signal. */
export const MANDATE_ATTEMPT_TREND_MIN_VOLUME = 5;

export function buildMandateAttemptTrend(attempts: MandateAttempt[], range: ReportDateRange): MandateAttemptTrendPoint[] {
  const scoped = attempts.filter(
    (attempt) => attempt.status !== "pending" && isIsoDateInRange(attempt.attemptedAt, range),
  );
  if (scoped.length < MANDATE_ATTEMPT_TREND_MIN_VOLUME) return [];

  const rangeStartDate = new Date(`${range.start}T00:00:00`);
  const buckets = new Map<string, { success: number; failed: number }>();
  for (const attempt of scoped) {
    const offset = daysBetweenIso(range.start, attempt.attemptedAt);
    const bucketIndex = Math.floor(offset / 7);
    const bucketStartIso = toIsoDate(addDays(rangeStartDate, bucketIndex * 7));
    const entry = buckets.get(bucketStartIso) ?? { success: 0, failed: 0 };
    if (attempt.status === "success") entry.success += 1;
    else entry.failed += 1;
    buckets.set(bucketStartIso, entry);
  }

  return Array.from(buckets.entries())
    .sort(([a], [b]) => (a < b ? -1 : 1))
    .map(([bucketStartIso, entry]) => ({ label: `Wk of ${bucketStartIso.slice(5)}`, ...entry }));
}
