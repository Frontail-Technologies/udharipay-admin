import type { DerivedMerchant } from "../aggregates";
import type { Installment } from "../installments";
import type { Payment, Mandate } from "../types";
import { calculateCollectionMetrics } from "./collectionsReport";
import { isMandateIssue } from "./mandateReport";
import type { ReportDateRange } from "./reportDateRange";

export type MandateHealthTone = "healthy" | "attention" | "none";

export type MerchantReportRow = {
  merchantId: string;
  businessName: string;
  customers: number;
  activePlans: number;
  outstanding: number;
  collectedInPeriod: number;
  overdue: number;
  collectionRate: number;
  mandateHealth: { tone: MandateHealthTone; label: string };
  subscriptionStatus: string;
};

/**
 * Reuses the exact same `calculateCollectionMetrics`/`isMandateIssue`
 * helpers the Collections and Mandates reports use, scoped per merchant —
 * a merchant's row here always reconciles with what those reports show
 * when filtered to that merchant.
 */
export function calculateMerchantReport(
  merchants: DerivedMerchant[],
  installments: Installment[],
  payments: Payment[],
  mandates: Mandate[],
  range: ReportDateRange,
): MerchantReportRow[] {
  return merchants.map((merchant) => {
    const merchantMandates = mandates.filter((mandate) => mandate.merchantId === merchant.id);
    const issueCount = merchantMandates.filter((mandate) => isMandateIssue(mandate)).length;
    const mandateHealth: { tone: MandateHealthTone; label: string } =
      merchantMandates.length === 0
        ? { tone: "none", label: "No mandates" }
        : issueCount > 0
          ? { tone: "attention", label: `${issueCount} needing action` }
          : { tone: "healthy", label: "Healthy" };

    const metrics = calculateCollectionMetrics(installments, payments, range, merchant.id);

    return {
      merchantId: merchant.id,
      businessName: merchant.businessName,
      customers: merchant.customerCount,
      activePlans: merchant.activePlans,
      outstanding: merchant.outstanding,
      collectedInPeriod: metrics.collectedAmount,
      overdue: metrics.overdueAmount,
      collectionRate: metrics.collectionRate,
      mandateHealth,
      subscriptionStatus: merchant.subscriptionStatus,
    };
  });
}
