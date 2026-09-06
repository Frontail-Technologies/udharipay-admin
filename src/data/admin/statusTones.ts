import type { StatusBadgeTone } from "@/components/admin/StatusBadge";
import type {
  MerchantStatus,
  KycStatus,
  SubscriptionStatus,
  MandateStatus,
  PaymentStatus,
  ActivationFeeStatus,
  AutoPayStatus,
  KycReviewStatus,
  KycDocumentCheckStatus,
} from "./types";
import type { CustomerStatus, PlanStatus } from "./aggregates";
import type { EmployeeStatus } from "./employees";
import type { InstallmentStatus } from "./installments";
import type {
  MandateOperationalStatus,
  MandateAttemptStatus,
  SubscriptionOperationalStatus,
  SubscriptionInvoiceStatus,
} from "./types";
import type { EventSeverity, EventStatus } from "./events/types";

/**
 * One tone map per status concept, kept deliberately separate — account
 * status, KYC status and subscription status are different concepts and
 * must never be merged into a single "status" field or a shared tone map.
 */
export const merchantStatusTone: Record<MerchantStatus, StatusBadgeTone> = {
  active: "success",
  restricted: "warning",
  inactive: "neutral",
};

export const kycStatusTone: Record<KycStatus, StatusBadgeTone> = {
  verified: "success",
  pending: "warning",
  action_required: "warning",
  rejected: "error",
};

export const subscriptionStatusTone: Record<SubscriptionStatus, StatusBadgeTone> = {
  active: "success",
  payment_due: "warning",
  grace: "warning",
  restricted: "error",
};

export const customerStatusTone: Record<CustomerStatus, StatusBadgeTone> = {
  active: "success",
  due: "warning",
  overdue: "error",
  completed: "neutral",
  restricted: "error",
};

export const mandateStatusTone: Record<MandateStatus, StatusBadgeTone> = {
  active: "success",
  pending: "warning",
  failed: "error",
  not_set: "neutral",
};

export const planStatusTone: Record<PlanStatus, StatusBadgeTone> = {
  active: "success",
  due: "warning",
  overdue: "error",
  completed: "neutral",
};

export const paymentStatusTone: Record<PaymentStatus, StatusBadgeTone> = {
  collected: "success",
  due: "warning",
  overdue: "error",
  failed: "error",
};

export const activationFeeStatusTone: Record<ActivationFeeStatus, StatusBadgeTone> = {
  paid: "success",
  pending: "warning",
};

export const autoPayStatusTone: Record<AutoPayStatus, StatusBadgeTone> = {
  active: "success",
  pending: "warning",
  not_set: "neutral",
};

export const employeeStatusTone: Record<EmployeeStatus, StatusBadgeTone> = {
  active: "success",
  inactive: "neutral",
  suspended: "error",
};

export const kycReviewStatusTone: Record<KycReviewStatus, StatusBadgeTone> = {
  pending: "neutral",
  in_review: "info",
  approved: "success",
  rejected: "error",
  resubmission_required: "warning",
};

export const kycDocumentCheckTone: Record<KycDocumentCheckStatus, StatusBadgeTone> = {
  not_reviewed: "neutral",
  accepted: "success",
  issue_found: "error",
};

export const installmentStatusTone: Record<InstallmentStatus, StatusBadgeTone> = {
  upcoming: "neutral",
  due: "warning",
  overdue: "error",
  paid: "success",
  partially_paid: "warning",
  failed: "error",
};

export const mandateOperationalStatusTone: Record<MandateOperationalStatus, StatusBadgeTone> = {
  pending_authorization: "warning",
  active: "success",
  paused: "warning",
  revoked: "error",
  failed: "error",
  expired: "neutral",
};

export const mandateAttemptStatusTone: Record<MandateAttemptStatus, StatusBadgeTone> = {
  success: "success",
  failed: "error",
  pending: "warning",
};

export const subscriptionOperationalStatusTone: Record<SubscriptionOperationalStatus, StatusBadgeTone> = {
  trial: "info",
  active: "success",
  past_due: "warning",
  paused: "warning",
  cancelled: "error",
  expired: "neutral",
};

export const subscriptionInvoiceStatusTone: Record<SubscriptionInvoiceStatus, StatusBadgeTone> = {
  paid: "success",
  pending: "warning",
  failed: "error",
  waived: "neutral",
};

/**
 * Event SEVERITY and event workflow STATUS are different concepts and are
 * never merged (Part A "SEVERITY") — two separate tone maps, same as
 * everywhere else in this file.
 */
export const eventSeverityTone: Record<EventSeverity, StatusBadgeTone> = {
  info: "info",
  success: "success",
  warning: "warning",
  critical: "error",
};

export const eventStatusTone: Record<EventStatus, StatusBadgeTone> = {
  open: "warning",
  resolved: "success",
  informational: "neutral",
};
