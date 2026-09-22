import type { CustomerStatus } from "@/api/generated/contracts/customers";
import type { StatusBadgeTone } from "@/components/admin/StatusBadge";

export const customerStatusTone: Record<CustomerStatus, StatusBadgeTone> = {
  active: "success",
  inactive: "neutral",
  blocked: "error",
};
