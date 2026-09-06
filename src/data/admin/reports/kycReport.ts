import { toIsoDate, DEMO_TODAY } from "../seededRandom";
import type { KycEntityType, KycReview, KycReviewStatus } from "../types";
import { countByKey } from "./reportHelpers";
import { daysBetweenIso, isIsoDateInRange, type ReportDateRange } from "./reportDateRange";

function getApprovedAt(review: KycReview): string | null {
  const approvedEvent = [...review.history].reverse().find((event) => event.type === "approved");
  return approvedEvent?.at ?? null;
}

const OPEN_STATUSES: KycReviewStatus[] = ["pending", "in_review", "resubmission_required"];

export type KycMetrics = {
  pending: number;
  inReview: number;
  approvedInPeriod: number;
  rejected: number;
  resubmissionRequired: number;
  /** Average days open for still-unresolved reviews; null when none are open. */
  averageReviewAgeDays: number | null;
};

/**
 * Terminology note: this app has no formal SLA defined anywhere, so
 * nothing here is ever called an "SLA breach" — only "Review Age" /
 * "Aging" / "Pending for N days".
 */
export function calculateKycMetrics(reviews: KycReview[], range: ReportDateRange, referenceDate: Date = DEMO_TODAY): KycMetrics {
  const pending = reviews.filter((review) => review.status === "pending").length;
  const inReview = reviews.filter((review) => review.status === "in_review").length;
  const rejected = reviews.filter((review) => review.status === "rejected").length;
  const resubmissionRequired = reviews.filter((review) => review.status === "resubmission_required").length;

  const approvedInPeriod = reviews.filter((review) => {
    if (review.status !== "approved") return false;
    const approvedAt = getApprovedAt(review);
    return approvedAt ? isIsoDateInRange(approvedAt, range) : false;
  }).length;

  const openReviews = reviews.filter((review) => OPEN_STATUSES.includes(review.status));
  const referenceIso = toIsoDate(referenceDate);
  const averageReviewAgeDays =
    openReviews.length > 0
      ? Math.round(
          openReviews.reduce((sum, review) => sum + daysBetweenIso(review.submittedAt, referenceIso), 0) /
            openReviews.length,
        )
      : null;

  return { pending, inReview, approvedInPeriod, rejected, resubmissionRequired, averageReviewAgeDays };
}

export type KycAgingBucket = "0-1" | "2-3" | "4-7" | "7+";
export type KycAgingBreakdownRow = { bucket: KycAgingBucket; count: number };

const AGING_BUCKETS: KycAgingBucket[] = ["0-1", "2-3", "4-7", "7+"];

export function buildKycAgingBreakdown(reviews: KycReview[], referenceDate: Date = DEMO_TODAY): KycAgingBreakdownRow[] {
  const referenceIso = toIsoDate(referenceDate);
  const openReviews = reviews.filter((review) => OPEN_STATUSES.includes(review.status));
  const counts: Record<KycAgingBucket, number> = { "0-1": 0, "2-3": 0, "4-7": 0, "7+": 0 };

  for (const review of openReviews) {
    const age = daysBetweenIso(review.submittedAt, referenceIso);
    if (age <= 1) counts["0-1"] += 1;
    else if (age <= 3) counts["2-3"] += 1;
    else if (age <= 7) counts["4-7"] += 1;
    else counts["7+"] += 1;
  }

  return AGING_BUCKETS.map((bucket) => ({ bucket, count: counts[bucket] }));
}

export function breakdownKycByEntityType(reviews: KycReview[]): { key: KycEntityType; count: number }[] {
  return countByKey(reviews, (review) => review.entityType);
}

export function breakdownKycByStatus(reviews: KycReview[]): { key: KycReviewStatus; count: number }[] {
  return countByKey(reviews, (review) => review.status);
}
