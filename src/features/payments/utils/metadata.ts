import type { PaymentMethod, PaymentSource, PaymentStatus } from "@/api/generated/contracts/payments";
import type { StatusBadgeTone } from "@/components/admin/StatusBadge";

export const paymentStatusTone: Record<PaymentStatus, StatusBadgeTone> = {
  pending: "warning",
  successful: "success",
  failed: "error",
  reversed: "neutral",
};

export const paymentMethodLabels: Record<PaymentMethod, string> = {
  cash: "Cash",
  upi: "UPI",
  bank_transfer: "Bank Transfer",
  mandate: "Mandate",
  card: "Card",
  other: "Other",
};

export const paymentSourceLabels: Record<PaymentSource, string> = {
  provider: "Provider",
  manual: "Manual",
  system_import: "System Import",
};

export function formatPaymentTimestamp(value: string | null) {
  if (!value) return "Not available";
  return new Date(value).toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

export function sumAllocationPaise(values: { amountPaise: string }[]) {
  return values.reduce((total, value) => total + BigInt(value.amountPaise), BigInt(0)).toString();
}
