import { PlanFrequency, type PlanFrequency as PlanFrequencyType } from "@/api/generated/common";
import { PlanStatus, type InstallmentDisplayState, type PlanStatus as PlanStatusType } from "@/api/generated/contracts/plans";
import type { StatusBadgeTone } from "@/components/admin/StatusBadge";

export const planStatusTone: Record<PlanStatusType, StatusBadgeTone> = {
  active: "success",
  completed: "info",
  paused: "warning",
  cancelled: "error",
};

export const installmentStateTone: Record<InstallmentDisplayState, StatusBadgeTone> = {
  paid: "success",
  partially_paid: "warning",
  scheduled: "neutral",
};

export const planStatusOptions = Object.values(PlanStatus);
export const planFrequencyOptions = Object.values(PlanFrequency);

export const planFrequencyLabels: Record<PlanFrequencyType, string> = {
  daily: "Daily",
  weekly: "Weekly",
  monthly: "Monthly",
};
