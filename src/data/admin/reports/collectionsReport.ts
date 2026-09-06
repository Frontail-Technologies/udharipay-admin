import { addDays, toIsoDate } from "../seededRandom";
import { formatDateShort } from "@/lib/format";
import type { Installment } from "../installments";
import type { Payment } from "../types";
import type { DerivedMerchant } from "../aggregates";
import { daysBetweenIso, isIsoDateInRange, type ReportDateRange } from "./reportDateRange";

export type CollectionMetrics = {
  /** Total amount that was due for collection in the range (paid + due + overdue + failed). */
  collectibleAmount: number;
  collectedAmount: number;
  dueAmount: number;
  overdueAmount: number;
  failedAmount: number;
  /** 0-100. */
  collectionRate: number;
  successfulCollections: number;
  failedAttempts: number;
};

/**
 * THE single collection-rate formula for the whole Reports module — every
 * card, chart and table that shows a rate calls this one function, never
 * its own inline division.
 *
 *   successful amount collected for installments due in range
 *   ------------------------------------------------------------
 *          total collectible amount due in range
 */
export function calculateCollectionRate(collectedAmount: number, collectibleAmount: number): number {
  if (collectibleAmount <= 0) return 0;
  return Math.round((collectedAmount / collectibleAmount) * 100);
}

/**
 * Reads canonical Installment-level data (never rolls a customer/plan up
 * into "overdue" just because one installment is overdue — that judgment
 * stays at the installment, matching how Installment.status is already
 * computed everywhere else in this app).
 */
export function calculateCollectionMetrics(
  installments: Installment[],
  payments: Payment[],
  range: ReportDateRange,
  merchantId?: string,
): CollectionMetrics {
  const scopedInstallments = installments.filter(
    (installment) =>
      isIsoDateInRange(installment.dueDate, range) && (!merchantId || installment.merchantId === merchantId),
  );

  const collectedAmount = scopedInstallments.reduce((sum, installment) => sum + installment.paidAmount, 0);
  const dueAmount = scopedInstallments
    .filter((installment) => installment.status === "due" || installment.status === "upcoming")
    .reduce((sum, installment) => sum + installment.amount, 0);
  const overdueAmount = scopedInstallments
    .filter((installment) => installment.status === "overdue")
    .reduce((sum, installment) => sum + (installment.amount - installment.paidAmount), 0);
  const failedAmount = scopedInstallments
    .filter((installment) => installment.status === "failed")
    .reduce((sum, installment) => sum + installment.amount, 0);
  const collectibleAmount = scopedInstallments.reduce((sum, installment) => sum + installment.amount, 0);

  const scopedPayments = payments.filter(
    (payment) => isIsoDateInRange(payment.date, range) && (!merchantId || payment.merchantId === merchantId),
  );
  const successfulCollections = scopedPayments.filter((payment) => payment.status === "collected").length;
  const failedAttempts = scopedPayments.filter((payment) => payment.status === "failed").length;

  return {
    collectibleAmount,
    collectedAmount,
    dueAmount,
    overdueAmount,
    failedAmount,
    collectionRate: calculateCollectionRate(collectedAmount, collectibleAmount),
    successfulCollections,
    failedAttempts,
  };
}

export type CollectionTrendPoint = { label: string; collected: number; due: number };

/**
 * Buckets daily when the range is 31 days or shorter, weekly beyond that —
 * a 90-day trend as 90 daily bars would be unreadable, same "keep it
 * compact" rule the rest of Reports follows.
 */
export function buildCollectionTrend(
  installments: Installment[],
  range: ReportDateRange,
  merchantId?: string,
): CollectionTrendPoint[] {
  const scoped = installments.filter(
    (installment) =>
      isIsoDateInRange(installment.dueDate, range) && (!merchantId || installment.merchantId === merchantId),
  );
  if (scoped.length === 0) return [];

  const spanDays = daysBetweenIso(range.start, range.end) + 1;
  const bucketDays = spanDays <= 31 ? 1 : 7;
  const rangeStartDate = new Date(`${range.start}T00:00:00`);

  const buckets = new Map<string, { collected: number; due: number }>();
  for (const installment of scoped) {
    const offset = daysBetweenIso(range.start, installment.dueDate);
    const bucketIndex = Math.floor(offset / bucketDays);
    const bucketStartIso = toIsoDate(addDays(rangeStartDate, bucketIndex * bucketDays));
    const entry = buckets.get(bucketStartIso) ?? { collected: 0, due: 0 };
    if (installment.status === "paid" || installment.status === "partially_paid") {
      entry.collected += installment.paidAmount;
    } else {
      entry.due += installment.amount;
    }
    buckets.set(bucketStartIso, entry);
  }

  return Array.from(buckets.entries())
    .sort(([a], [b]) => (a < b ? -1 : 1))
    .map(([bucketStartIso, entry]) => ({
      label: bucketDays === 1 ? formatDateShort(bucketStartIso) : `Wk of ${formatDateShort(bucketStartIso)}`,
      collected: entry.collected,
      due: entry.due,
    }));
}

export type MerchantCollectionBreakdownRow = {
  merchantId: string;
  businessName: string;
  due: number;
  collected: number;
  overdue: number;
  collectionRate: number;
};

export function calculateMerchantCollectionBreakdown(
  merchants: DerivedMerchant[],
  installments: Installment[],
  payments: Payment[],
  range: ReportDateRange,
): MerchantCollectionBreakdownRow[] {
  return merchants.map((merchant) => {
    const metrics = calculateCollectionMetrics(installments, payments, range, merchant.id);
    return {
      merchantId: merchant.id,
      businessName: merchant.businessName,
      due: metrics.dueAmount,
      collected: metrics.collectedAmount,
      overdue: metrics.overdueAmount,
      collectionRate: metrics.collectionRate,
    };
  });
}
