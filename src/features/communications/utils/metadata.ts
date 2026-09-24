import { humanizeSnakeCase } from "@/lib/format";
import type { StatusBadgeTone } from "@/components/admin/StatusBadge";
import { AnnouncementAudienceType, AnnouncementStatus, TemplateApprovalStatus, type WhatsAppTemplate, type WhatsAppTemplateVersion } from "@/api/generated/contracts/communications";

export const approvalTone: Record<TemplateApprovalStatus, StatusBadgeTone> = {
  draft: "neutral",
  pending_approval: "warning",
  approved: "success",
  rejected: "error",
  disabled: "neutral",
};

export const approvalLabels: Record<TemplateApprovalStatus, string> = {
  draft: "Draft",
  pending_approval: "Pending Approval",
  approved: "Approved",
  rejected: "Rejected",
  disabled: "Disabled",
};

export const approvalTransitions: Record<TemplateApprovalStatus, TemplateApprovalStatus[]> = {
  draft: ["pending_approval", "disabled"],
  pending_approval: ["approved", "rejected", "draft"],
  approved: ["disabled"],
  rejected: ["draft", "disabled"],
  disabled: ["draft"],
};

export const audienceLabels: Record<AnnouncementAudienceType, string> = {
  merchants: "Merchants",
  employees: "Employees",
  both: "Merchants & Employees",
  selected_users: "Selected users",
};

export const announcementStatusTone: Record<AnnouncementStatus, StatusBadgeTone> = {
  sending: "warning",
  sent: "success",
  failed: "error",
};

export const reminderStatusTone: Record<string, StatusBadgeTone> = {
  pending: "warning",
  processing: "info",
  sent: "info",
  delivered: "success",
  failed: "error",
  cancelled: "neutral",
};

export const reminderTypeLabels: Record<string, string> = {
  "payment.upcoming": "Upcoming payment",
  "payment.due_today": "Due today",
  "payment.overdue": "Overdue",
  "payment.promise_due": "Promise due",
};

export const actionTargetLabels: Record<string, string> = {
  dashboard: "Dashboard",
  collections: "Collections",
  kyc: "KYC",
  billing: "Billing",
  notifications: "Notifications",
  payments: "Payments",
  mandates: "Mandates",
  customer: "Customer",
  plan: "Plan",
};

export function activeVersionOf(template: WhatsAppTemplate): WhatsAppTemplateVersion | undefined {
  return template.versions.find((version) => version.isActive);
}

export function reminderTypeLabel(type: string) {
  return reminderTypeLabels[type] ?? humanizeSnakeCase(type.replaceAll(".", "_"));
}
