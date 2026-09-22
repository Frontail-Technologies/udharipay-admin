import type { UserStatus } from "@/api/generated/common";
import type { StatusBadgeTone } from "@/components/admin/StatusBadge";

export const employeeStatusTone: Record<UserStatus, StatusBadgeTone> = {
  active: "success",
  inactive: "neutral",
  suspended: "error",
};
