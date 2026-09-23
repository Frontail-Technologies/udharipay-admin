import type { CollectionState, CollectionTimingState, FollowUpType } from "@/api/generated/contracts/collections";
import type { StatusBadgeTone } from "@/components/admin/StatusBadge";

export const collectionStateLabels: Record<CollectionState, string> = {
  upcoming: "Upcoming",
  due: "Due",
  overdue: "Overdue",
  partially_paid: "Partially Paid",
  paid: "Paid",
};

export const collectionStateTones: Record<CollectionState, StatusBadgeTone> = {
  upcoming: "info",
  due: "warning",
  overdue: "error",
  partially_paid: "warning",
  paid: "success",
};

export const timingStateLabels: Record<CollectionTimingState, string> = {
  upcoming: "Upcoming",
  due: "Due Today",
  overdue: "Overdue",
  paid: "Paid",
};

export const followUpTypeLabels: Record<FollowUpType, string> = {
  customer_contacted: "Customer Contacted",
  will_pay: "Will Pay",
  requested_visit: "Requested Visit",
  dispute: "Dispute",
  no_answer: "No Answer",
};

export const riskSignalLabels = {
  failedMandateAttempt: "Autopay attempt failed",
  repeatedNoAnswer: "Repeated no answer",
  overdueThresholdReached: "Overdue threshold reached",
} as const;

export function timingContext(timingState: CollectionTimingState, daysOverdue: number) {
  if (timingState === "overdue") return `${daysOverdue} day${daysOverdue === 1 ? "" : "s"} overdue`;
  return timingStateLabels[timingState];
}
