/**
 * PART A — two deliberately distinct concepts, never merged:
 *
 * AdminOperationalEvent: something happened in the product/domain (a
 * mandate debit failed, an installment went overdue, KYC was approved).
 * Derived from canonical domain records — never hand-authored.
 *
 * AdminAuditEvent: who changed what, administratively (an admin edited a
 * merchant's phone, made a KYC decision, changed a setting). See
 * adminAuditStore.ts for why this is explicitly a DEMO presentation, not a
 * production audit trail.
 */

export type EventCategory =
  | "collection"
  | "payment"
  | "mandate"
  | "subscription"
  | "kyc"
  | "merchant"
  | "customer"
  | "employee"
  | "plan"
  | "system";

export type EventSeverity = "info" | "success" | "warning" | "critical";

/** Deliberately separate from severity — see Part A "SEVERITY". */
export type EventStatus = "open" | "resolved" | "informational";

export type EventEntityType =
  | "merchant"
  | "customer"
  | "employee"
  | "plan"
  | "mandate"
  | "subscription"
  | "kyc_review"
  | "installment"
  | "payment";

export type AdminOperationalEvent = {
  id: string;
  category: EventCategory;
  type: string;
  severity: EventSeverity;
  entityType: EventEntityType;
  /** Resolve display names through canonical relationships at render time — never stored here. */
  entityId: string;
  title: string;
  description?: string;
  /** ISO date (yyyy-mm-dd) — display time-of-day is a deterministic presentation detail, see format.ts's pseudoTimeOfDay. */
  occurredAt: string;
  sourceType: string;
  sourceId: string;
  status: EventStatus;
};

export type AdminAuditChange = {
  field: string;
  from: string;
  to: string;
};

export type AdminAuditEvent = {
  id: string;
  actorId?: string;
  actorName: string;
  action: string;
  entityType: EventEntityType | "settings";
  entityId: string;
  /** Human label for the entity — resolved once at record time (settings/audit are not read through a canonical entity hook the way operational events are). */
  entityLabel: string;
  changes?: AdminAuditChange[];
  metadata?: string;
  createdAt: string;
};
