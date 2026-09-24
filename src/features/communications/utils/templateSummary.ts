import type { StatusBadgeTone } from "@/components/admin/StatusBadge";
import { TemplateApprovalStatus, type WhatsAppTemplate, type WhatsAppTemplateVersion } from "@/api/generated/contracts/communications";
import { activeVersionOf } from "@/features/communications/utils/metadata";

export type TemplateEffectiveStatus = "active" | "draft" | "awaiting_approval" | "disabled" | "needs_setup" | "rejected";

export const effectiveStatusLabels: Record<TemplateEffectiveStatus, string> = {
  active: "Active",
  draft: "Draft",
  awaiting_approval: "Awaiting Approval",
  disabled: "Disabled",
  needs_setup: "Needs Setup",
  rejected: "Rejected",
};

export const effectiveStatusTone: Record<TemplateEffectiveStatus, StatusBadgeTone> = {
  active: "success",
  draft: "neutral",
  awaiting_approval: "warning",
  disabled: "neutral",
  needs_setup: "neutral",
  rejected: "error",
};

export const templateSchedules: Record<string, string> = {
  payment_upcoming: "Sent the day before an installment is due",
  payment_due_today: "Sent on the installment due date",
  payment_overdue: "Sent 1, 3 and 7 days after the due date",
  payment_promise_due: "Sent on the date a customer promised to pay",
};

const sampleValues: Record<string, string> = {
  customerName: "Asha Rao",
  merchantName: "Sharma Traders",
  outstandingAmount: "₹2,500",
  dueDate: "15 Oct",
  planReference: "PLN-1A2B3C",
};

export function latestVersionOf(template: WhatsAppTemplate): WhatsAppTemplateVersion | undefined {
  return template.versions.slice().sort((a, b) => b.version - a.version)[0];
}

export function featuredVersionOf(template: WhatsAppTemplate) {
  return activeVersionOf(template) ?? latestVersionOf(template);
}

export function effectiveStatusOf(template: WhatsAppTemplate): TemplateEffectiveStatus {
  if (!template.isEnabled) return "disabled";
  if (activeVersionOf(template)) return "active";
  const statuses = template.versions.map((version) => version.approvalStatus);
  if (statuses.includes(TemplateApprovalStatus.pending_approval)) return "awaiting_approval";
  if (statuses.includes(TemplateApprovalStatus.approved)) return "needs_setup";
  if (statuses.includes(TemplateApprovalStatus.draft)) return "draft";
  if (statuses.includes(TemplateApprovalStatus.rejected)) return "rejected";
  return "needs_setup";
}

export function resolvePreview(bodyTemplate: string) {
  return bodyTemplate.replace(/\{\{\s*([A-Za-z0-9_]+)\s*\}\}/g, (_match, name: string) => sampleValues[name] ?? "");
}
