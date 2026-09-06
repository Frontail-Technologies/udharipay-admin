"use client";

import { useMemo } from "react";
import { AlertTriangle, CheckCircle2, CircleDashed, PlusCircle, XCircle } from "lucide-react";
import type { MerchantSubscription, SubscriptionInvoice } from "@/data/admin";
import { formatDate } from "@/lib/format";

type ActivityEvent = {
  id: string;
  label: string;
  note?: string;
  at: string;
  icon: typeof PlusCircle;
};

/**
 * Synthesized, read-only lifecycle feed derived from the canonical
 * MerchantSubscription and its Invoices — no separate activity store
 * (subscriptions are read-only operational monitoring this phase).
 */
function buildActivity(subscription: MerchantSubscription, invoices: SubscriptionInvoice[]): ActivityEvent[] {
  const events: ActivityEvent[] = [
    { id: "created", label: "Subscription Created", note: subscription.planName, at: subscription.createdAt, icon: PlusCircle },
  ];

  for (const invoice of invoices) {
    if (invoice.status === "paid" && invoice.paidAt) {
      events.push({
        id: invoice.id,
        label: invoice.type === "activation_fee" ? "Activation Fee Paid" : "Subscription Invoice Paid",
        note: invoice.id,
        at: invoice.paidAt,
        icon: CheckCircle2,
      });
    } else if (invoice.status === "failed") {
      events.push({
        id: invoice.id,
        label: "Billing Attempt Failed",
        note: invoice.id,
        at: invoice.dueDate,
        icon: XCircle,
      });
    } else if (invoice.status === "pending") {
      events.push({ id: invoice.id, label: "Invoice Pending", note: invoice.id, at: invoice.dueDate, icon: CircleDashed });
    } else if (invoice.status === "waived") {
      events.push({ id: invoice.id, label: "Invoice Waived", note: invoice.id, at: invoice.dueDate, icon: AlertTriangle });
    }
  }

  if (subscription.status === "past_due") {
    events.push({ id: "past-due", label: "Subscription Marked Past Due", at: subscription.currentPeriodStart, icon: AlertTriangle });
  }
  if (subscription.status === "paused") {
    events.push({ id: "paused", label: "Subscription Paused", at: subscription.currentPeriodStart, icon: AlertTriangle });
  }
  if (subscription.status === "cancelled" && subscription.cancelledAt) {
    events.push({ id: "cancelled", label: "Subscription Cancelled", at: subscription.cancelledAt, icon: XCircle });
  }

  return events.sort((a, b) => (a.at < b.at ? 1 : -1));
}

export function SubscriptionActivityTab({
  subscription,
  invoices,
}: {
  subscription: MerchantSubscription;
  invoices: SubscriptionInvoice[];
}) {
  const events = useMemo(() => buildActivity(subscription, invoices), [subscription, invoices]);

  return (
    <div className="rounded-lg border border-border bg-surface p-4">
      <h3 className="text-[13.5px] font-semibold text-text-primary">Subscription Activity</h3>
      <p className="mt-0.5 text-[11px] text-text-muted">Demo operational history synthesized from subscription and invoice records.</p>
      <ul className="mt-3 flex flex-col gap-3">
        {events.map((event) => (
          <li key={event.id} className="flex gap-2.5 text-[12.5px]">
            <event.icon className="mt-0.5 size-3.5 shrink-0 text-text-muted" />
            <div className="min-w-0">
              <p className="text-text-primary">{event.label}</p>
              {event.note && <p className="text-text-secondary">{event.note}</p>}
              <p className="text-[11px] text-text-muted">{formatDate(event.at.slice(0, 10))}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
