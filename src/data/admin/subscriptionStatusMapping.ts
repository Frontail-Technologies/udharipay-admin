import type { SubscriptionOperationalStatus, SubscriptionStatus } from "./types";

/**
 * The ONE place a canonical Subscription's rich status maps down to the
 * simpler legacy `Merchant.subscriptionStatus` vocabulary — same role as
 * `mandateStatusMapping.ts`. Only `useAdminMerchants()` applies this.
 */
export function subscriptionOperationalStatusToLegacy(status: SubscriptionOperationalStatus): SubscriptionStatus {
  switch (status) {
    case "trial":
    case "active":
      return "active";
    case "past_due":
      return "payment_due";
    case "paused":
      return "grace";
    case "cancelled":
    case "expired":
      return "restricted";
  }
}
