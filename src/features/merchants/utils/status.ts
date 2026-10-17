import type { MerchantStatus } from "@/api/generated/contracts/merchants";
import type { StatusBadgeTone } from "@/components/admin/StatusBadge";

export const merchantStatusTone: Record<MerchantStatus, StatusBadgeTone> = {
  draft: "neutral",
  in_review: "info",
  active: "success",
  payment_due: "warning",
  grace: "warning",
  restricted: "error",
};
