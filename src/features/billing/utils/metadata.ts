import type { SubscriptionAutopayStatus, SubscriptionInvoiceType, SubscriptionStatus } from "@/api/generated/contracts/billing";
import type { StatusBadgeTone } from "@/components/admin/StatusBadge";

export const subscriptionStatusTone: Record<SubscriptionStatus, StatusBadgeTone> = {
  trialing: "info",
  active: "success",
  past_due: "warning",
  grace: "warning",
  restricted: "error",
  cancelled: "neutral",
};

export const autoPayStatusTone: Record<SubscriptionAutopayStatus, StatusBadgeTone> = {
  pending: "neutral",
  active: "success",
  failed: "error",
  cancelled: "neutral",
};

export const invoiceOperationalStatusTone: Record<string, StatusBadgeTone> = {
  pending: "warning",
  paid: "success",
  failed: "error",
  void: "neutral",
  overdue: "error",
};

export const invoiceTypeLabels: Record<SubscriptionInvoiceType, string> = {
  activation_fee: "Activation Fee",
  subscription: "Subscription",
  addon: "Add-on",
};

export const billingPlanCatalog = [
  { code: "standard", name: "Standard", monthlyAmountPaise: "349900" },
  { code: "premium", name: "Premium", monthlyAmountPaise: "599900" },
  { code: "enterprise", name: "Enterprise", monthlyAmountPaise: "999900" },
] as const;
