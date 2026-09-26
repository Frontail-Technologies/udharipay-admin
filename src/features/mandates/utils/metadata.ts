import type { MandateMethod, MandateStatus } from "@/api/generated/common";
import type { MandateAttemptStatus } from "@/api/generated/contracts/mandates";
import type { StatusBadgeTone } from "@/components/admin/StatusBadge";

export const mandateStatusTone: Record<MandateStatus, StatusBadgeTone> = {
  pending: "neutral",
  authorization_pending: "warning",
  active: "success",
  paused: "warning",
  failed: "error",
  cancelled: "neutral",
  expired: "neutral",
};

export const mandateAttemptStatusTone: Record<MandateAttemptStatus, StatusBadgeTone> = {
  pending: "neutral",
  submitted: "info",
  successful: "success",
  failed: "error",
  cancelled: "neutral",
};

export const mandateMethodLabels: Record<MandateMethod, string> = {
  upi_autopay: "UPI AutoPay",
  enach: "eNACH / Bank AutoPay",
};
