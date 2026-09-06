import { addDays, toIsoDate, DEMO_TODAY } from "./seededRandom";
import { installments } from "./installments";
import { getPlanById } from "./plans";
import { getMerchantById } from "./merchants";
import { getEmployeeByName } from "./employees";
import type { CollectionFollowUp, CollectionFollowUpType } from "./types";

const FOLLOW_UP_TEMPLATES: { type: CollectionFollowUpType; note: string }[] = [
  { type: "call_attempted", note: "Called customer — no answer, will retry tomorrow." },
  { type: "customer_contacted", note: "Spoke with customer, confirmed they received the reminder." },
  { type: "reminder_sent", note: "Reminder logged for outstanding installment." },
  { type: "promise_to_pay", note: "Customer promised to pay by the date below." },
  { type: "no_response", note: "No response after two contact attempts." },
];

/**
 * A handful of deterministic follow-up entries seeded against overdue/failed
 * installments — enough to demonstrate the Follow-up tab and Collections
 * workspace with real relational data, not meant to cover every overdue row.
 * Anything added by an admin during a session goes through
 * `adminCollectionsStore.ts` instead, layered on top of this seed.
 */
const overdueInstallments = installments.filter(
  (installment) => installment.status === "overdue" || installment.status === "failed",
);

export const collectionFollowUps: CollectionFollowUp[] = overdueInstallments
  .slice(0, 10)
  .map((installment, index) => {
    const plan = getPlanById(installment.planId);
    const template = FOLLOW_UP_TEMPLATES[index % FOLLOW_UP_TEMPLATES.length];
    // Same name-based Merchant -> Employee relationship used elsewhere
    // (Merchant.assignedEmployeeName) — a documented limitation, not a new
    // one introduced here.
    const merchant = plan ? getMerchantById(plan.merchantId) : undefined;
    const assignedEmployee = merchant ? getEmployeeByName(merchant.assignedEmployeeName) : undefined;
    const createdAt = toIsoDate(addDays(DEMO_TODAY, -(1 + (index % 4))));
    const isPromise = template.type === "promise_to_pay";

    return {
      id: `FOLLOWUP-${5001 + index * 3}`,
      customerId: installment.customerId,
      planId: installment.planId,
      installmentId: installment.id,
      employeeId: assignedEmployee?.id ?? null,
      type: template.type,
      note: template.note,
      promisedDate: isPromise ? toIsoDate(addDays(DEMO_TODAY, 2 + (index % 5))) : null,
      nextFollowUpDate: template.type === "no_response" ? toIsoDate(addDays(DEMO_TODAY, 1)) : null,
      createdAt,
    } satisfies CollectionFollowUp;
  });

export function getFollowUpsByPlan(planId: string): CollectionFollowUp[] {
  return collectionFollowUps.filter((entry) => entry.planId === planId);
}

export function getFollowUpsByCustomer(customerId: string): CollectionFollowUp[] {
  return collectionFollowUps.filter((entry) => entry.customerId === customerId);
}

export function getFollowUpsByInstallment(installmentId: string): CollectionFollowUp[] {
  return collectionFollowUps.filter((entry) => entry.installmentId === installmentId);
}
