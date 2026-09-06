import { addDays, toIsoDate, DEMO_TODAY } from "./seededRandom";
import { merchants } from "./merchants";
import { getSubscriptionPlanCatalogEntryByName, DEFAULT_ACTIVATION_FEE_AMOUNT } from "./subscriptionPlanCatalog";
import type { MerchantSubscription, SubscriptionOperationalStatus, SubscriptionStatus } from "./types";

const PAYMENT_METHODS = ["UPI Autopay", "NACH"] as const;

/**
 * One Subscription per merchant, derived from the merchant's own seeded
 * `subscriptionStatus`/`subscriptionPlan`/`activationFeeStatus`/
 * `autoPayStatus`/`nextDebitDate` fields so the two start in agreement —
 * from here on the canonical Subscription is the source of truth and
 * `Merchant.subscriptionStatus` etc. are overridden to mirror it (see
 * useAdminEntities.ts), the same override pattern already used for KYC
 * and Mandate.
 */
function mapStatus(status: SubscriptionStatus, index: number): SubscriptionOperationalStatus {
  switch (status) {
    case "active":
      return index % 6 === 0 ? "trial" : "active";
    case "payment_due":
      return "past_due";
    case "grace":
      return "paused";
    case "restricted":
      return "cancelled";
  }
}

export const subscriptions: MerchantSubscription[] = merchants.map((merchant, index) => {
  const status = mapStatus(merchant.subscriptionStatus, index);
  const catalog = getSubscriptionPlanCatalogEntryByName(merchant.subscriptionPlan) ?? {
    code: "starter_monthly",
    monthlyAmount: 999,
  };

  const currentPeriodEnd = merchant.nextDebitDate ?? toIsoDate(addDays(DEMO_TODAY, 15));
  const currentPeriodStart = toIsoDate(addDays(new Date(`${currentPeriodEnd}T00:00:00`), -30));

  return {
    id: `SUB-${7001 + index * 5}`,
    merchantId: merchant.id,
    planCode: catalog.code,
    planName: merchant.subscriptionPlan,
    status,
    monthlyAmount: status === "trial" ? 0 : catalog.monthlyAmount,
    activationFeeAmount: DEFAULT_ACTIVATION_FEE_AMOUNT,
    activationFeeStatus: merchant.activationFeeStatus,
    currentPeriodStart,
    currentPeriodEnd,
    nextBillingDate: status === "cancelled" || status === "expired" ? null : merchant.nextDebitDate,
    paymentMethod: PAYMENT_METHODS[index % PAYMENT_METHODS.length],
    autopayStatus: merchant.autoPayStatus,
    cancelledAt: status === "cancelled" ? toIsoDate(addDays(DEMO_TODAY, -(5 + index * 3))) : null,
    createdAt: merchant.joinedAt,
  } satisfies MerchantSubscription;
});

export function getSubscriptionById(subscriptionId: string): MerchantSubscription | undefined {
  return subscriptions.find((subscription) => subscription.id === subscriptionId);
}

export function getSubscriptionByMerchant(merchantId: string): MerchantSubscription | undefined {
  return subscriptions.find((subscription) => subscription.merchantId === merchantId);
}
