import { isInstallmentAtRisk } from "../atRiskRules";
import { isMandateIssue } from "../reports/mandateReport";
import type { Payment, Mandate, MandateAttempt, SubscriptionInvoice, KycReview, CollectionFollowUp } from "../types";
import type { Installment } from "../installments";
import type { AdminOperationalEvent } from "./types";

/**
 * PART A / EVENT GENERATION — every event here is DERIVED from canonical
 * domain records, never hand-authored. No giant arbitrary seed file exists
 * for this: a failed MandateAttempt becomes a "Mandate debit failed" event,
 * an overdue Installment becomes a "Collection overdue" event, a failed
 * SubscriptionInvoice becomes a "Subscription billing failed" event, and a
 * KYC history entry becomes a KYC event — exactly the mapping in the brief.
 *
 * Only NOTABLE states produce an event (a collected Payment or an active
 * Mandate never does) — this keeps volume proportional to genuine
 * operational activity, not the whole dataset.
 *
 * Entity display names are deliberately NOT included here — every consumer
 * resolves `entityType`/`entityId` through the canonical entity hooks at
 * render time (see EventsTable.tsx), so a merchant rename is reflected
 * immediately without regenerating events.
 */
export function buildOperationalEvents(params: {
  payments: Payment[];
  installments: Installment[];
  mandates: Mandate[];
  mandateAttempts: MandateAttempt[];
  subscriptionInvoices: SubscriptionInvoice[];
  kycReviews: KycReview[];
  followUps: CollectionFollowUp[];
  atRiskOverdueDays: number;
}): AdminOperationalEvent[] {
  const { payments, installments, mandates, mandateAttempts, subscriptionInvoices, kycReviews, followUps, atRiskOverdueDays } =
    params;
  const events: AdminOperationalEvent[] = [];
  const mandateById = new Map(mandates.map((mandate) => [mandate.id, mandate]));

  // --- Payments -----------------------------------------------------
  for (const payment of payments) {
    if (payment.status !== "failed") continue;
    events.push({
      id: `EVT-PAY-${payment.id}`,
      category: "payment",
      type: "payment_failed",
      severity: "warning",
      entityType: "customer",
      entityId: payment.customerId,
      title: "Payment failed",
      description: `Installment #${payment.installmentNumber} on ${payment.planId} via ${payment.method}.`,
      occurredAt: payment.date,
      sourceType: "Payment",
      sourceId: payment.id,
      status: "open",
    });
  }

  // --- Installments ---------------------------------------------------
  for (const installment of installments) {
    if (installment.status === "overdue") {
      const atRisk = isInstallmentAtRisk({ installment, followUps, thresholdDays: atRiskOverdueDays });
      events.push({
        id: `EVT-INST-${installment.id}`,
        category: "collection",
        type: "installment_overdue",
        severity: atRisk ? "critical" : "warning",
        entityType: "customer",
        entityId: installment.customerId,
        title: "Collection overdue",
        description: `Installment #${installment.installmentNumber} on ${installment.planId} — ${formatAmount(installment.amount)} due ${installment.dueDate}.`,
        occurredAt: installment.dueDate,
        sourceType: "Installment",
        sourceId: installment.id,
        status: "open",
      });
    } else if (installment.status === "failed") {
      events.push({
        id: `EVT-INST-${installment.id}`,
        category: "collection",
        type: "installment_failed",
        severity: "critical",
        entityType: "customer",
        entityId: installment.customerId,
        title: "Collection payment failed",
        description: `Installment #${installment.installmentNumber} on ${installment.planId}.`,
        occurredAt: installment.dueDate,
        sourceType: "Installment",
        sourceId: installment.id,
        status: "open",
      });
    }
  }

  // --- Mandate attempts -------------------------------------------------
  for (const attempt of mandateAttempts) {
    if (attempt.status !== "failed") continue;
    const mandate = mandateById.get(attempt.mandateId);
    if (!mandate) continue;
    events.push({
      id: `EVT-MATT-${attempt.id}`,
      category: "mandate",
      type: "mandate_attempt_failed",
      severity: "warning",
      entityType: "mandate",
      entityId: mandate.id,
      title: "Mandate debit failed",
      description: attempt.failureReason ?? undefined,
      occurredAt: attempt.attemptedAt,
      sourceType: "Mandate Attempt",
      sourceId: attempt.id,
      status: "open",
    });
  }

  // --- Mandates -----------------------------------------------------
  for (const mandate of mandates) {
    if (mandate.authorizedAt) {
      events.push({
        id: `EVT-MAND-AUTH-${mandate.id}`,
        category: "mandate",
        type: "mandate_authorized",
        severity: "success",
        entityType: "mandate",
        entityId: mandate.id,
        title: "Mandate authorized",
        description: `${mandate.method} via ${mandate.provider}.`,
        occurredAt: mandate.authorizedAt,
        sourceType: "Mandate",
        sourceId: mandate.id,
        status: "informational",
      });
    }
    if (isMandateIssue(mandate)) {
      events.push({
        id: `EVT-MAND-ISSUE-${mandate.id}`,
        category: "mandate",
        type: `mandate_${mandate.status}`,
        severity: mandate.status === "failed" || mandate.status === "revoked" ? "critical" : "warning",
        entityType: "mandate",
        entityId: mandate.id,
        title: mandateIssueTitle(mandate.status),
        occurredAt: mandate.updatedAt,
        sourceType: "Mandate",
        sourceId: mandate.id,
        status: "open",
      });
    }
  }

  // --- Subscription invoices --------------------------------------------
  for (const invoice of subscriptionInvoices) {
    if (invoice.status !== "failed") continue;
    events.push({
      id: `EVT-SUBINV-${invoice.id}`,
      category: "subscription",
      type: "subscription_invoice_failed",
      severity: "critical",
      entityType: "subscription",
      entityId: invoice.subscriptionId,
      title: "Subscription billing failed",
      description: `${invoice.type === "activation_fee" ? "Activation fee" : "Subscription"} invoice ${invoice.id}, ${formatAmount(invoice.amount)}.`,
      occurredAt: invoice.dueDate,
      sourceType: "Subscription Invoice",
      sourceId: invoice.id,
      status: "open",
    });
  }

  // --- KYC reviews (history) --------------------------------------------
  for (const review of kycReviews) {
    for (const historyEvent of review.history) {
      const mapped = kycHistoryEventMapping(historyEvent.type);
      if (!mapped) continue;
      events.push({
        id: `EVT-KYC-${historyEvent.id}`,
        category: "kyc",
        type: mapped.type,
        severity: mapped.severity,
        entityType: review.entityType,
        entityId: review.entityId,
        title: mapped.title,
        description: historyEvent.note,
        occurredAt: historyEvent.at.slice(0, 10),
        sourceType: "KYC Review",
        sourceId: review.id,
        status: mapped.status,
      });
    }
  }

  // --- Follow-ups -----------------------------------------------------
  for (const followUp of followUps) {
    events.push({
      id: `EVT-FOLLOWUP-${followUp.id}`,
      category: "collection",
      type: "follow_up_added",
      severity: "info",
      entityType: "customer",
      entityId: followUp.customerId,
      title: "Follow-up logged",
      description: followUp.note,
      occurredAt: followUp.createdAt.slice(0, 10),
      sourceType: "Follow-up",
      sourceId: followUp.id,
      status: "informational",
    });
  }

  return events.sort((a, b) => (a.occurredAt < b.occurredAt ? 1 : -1));
}

function formatAmount(amount: number): string {
  return `₹${amount.toLocaleString("en-IN")}`;
}

function mandateIssueTitle(status: Mandate["status"]): string {
  switch (status) {
    case "failed":
      return "Mandate failed";
    case "revoked":
      return "Mandate revoked";
    case "expired":
      return "Mandate expired";
    case "paused":
      return "Mandate paused";
    case "pending_authorization":
      return "Mandate authorization pending";
    case "active":
      return "Mandate";
  }
}

function kycHistoryEventMapping(
  type: KycReview["history"][number]["type"],
): { type: string; title: string; severity: AdminOperationalEvent["severity"]; status: AdminOperationalEvent["status"] } | null {
  switch (type) {
    case "submitted":
      return { type: "kyc_submitted", title: "KYC submitted", severity: "info", status: "informational" };
    case "review_started":
      return { type: "kyc_review_started", title: "KYC review started", severity: "info", status: "informational" };
    case "approved":
      return { type: "kyc_approved", title: "KYC approved", severity: "success", status: "informational" };
    case "rejected":
      return { type: "kyc_rejected", title: "KYC rejected", severity: "critical", status: "informational" };
    case "resubmission_requested":
      return { type: "kyc_resubmission_requested", title: "KYC resubmission requested", severity: "warning", status: "open" };
    case "note_added":
      return null; // internal reviewer note — not a meaningful platform event
  }
}
