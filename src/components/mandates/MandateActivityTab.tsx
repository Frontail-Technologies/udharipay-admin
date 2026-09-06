"use client";

import { useMemo } from "react";
import { CheckCircle2, CircleDashed, FileSignature, PauseCircle, PlusCircle, XCircle } from "lucide-react";
import type { Mandate, MandateAttempt } from "@/data/admin";
import { formatDate } from "@/lib/format";

type ActivityEvent = {
  id: string;
  label: string;
  note?: string;
  at: string;
  icon: typeof PlusCircle;
};

/**
 * Synthesized, read-only lifecycle feed derived purely from the canonical
 * Mandate record and its Attempts — there is no separate activity store
 * (mandates are read-only operational monitoring this phase). Labeled as
 * demo history, same convention as the KYC "Review History" panel.
 */
function buildActivity(mandate: Mandate, attempts: MandateAttempt[]): ActivityEvent[] {
  const events: ActivityEvent[] = [
    { id: "created", label: "Mandate Created", at: mandate.createdAt, icon: PlusCircle },
  ];

  if (mandate.status === "pending_authorization") {
    events.push({
      id: "requested",
      label: "Authorization Requested",
      note: `Awaiting customer action via ${mandate.method}`,
      at: mandate.createdAt,
      icon: CircleDashed,
    });
  }

  if (mandate.authorizedAt) {
    events.push({ id: "authorized", label: "Authorized", note: mandate.method, at: mandate.authorizedAt, icon: FileSignature });
  }

  if (mandate.activatedAt) {
    events.push({ id: "activated", label: "Mandate Activated", at: mandate.activatedAt, icon: CheckCircle2 });
  }

  for (const attempt of attempts) {
    if (attempt.status === "success") {
      events.push({
        id: attempt.id,
        label: "Debit Attempted",
        note: attempt.amount != null ? `Collected via mandate` : undefined,
        at: attempt.attemptedAt,
        icon: CheckCircle2,
      });
    } else if (attempt.status === "failed") {
      events.push({
        id: attempt.id,
        label: "Debit Failed",
        note: attempt.failureReason ?? undefined,
        at: attempt.attemptedAt,
        icon: XCircle,
      });
    } else {
      events.push({ id: attempt.id, label: "Debit Pending", at: attempt.attemptedAt, icon: CircleDashed });
    }
  }

  if (mandate.status === "paused") {
    events.push({ id: "paused", label: "Mandate Paused", at: mandate.updatedAt, icon: PauseCircle });
  }
  if (mandate.status === "revoked") {
    events.push({ id: "revoked", label: "Mandate Revoked", at: mandate.updatedAt, icon: XCircle });
  }
  if (mandate.status === "expired") {
    events.push({ id: "expired", label: "Mandate Expired", at: mandate.expiresAt ?? mandate.updatedAt, icon: XCircle });
  }
  if (mandate.status === "failed" && !mandate.authorizedAt) {
    events.push({ id: "auth-failed", label: "Authorization Failed", at: mandate.updatedAt, icon: XCircle });
  }

  return events.sort((a, b) => (a.at < b.at ? 1 : -1));
}

export function MandateActivityTab({ mandate, attempts }: { mandate: Mandate; attempts: MandateAttempt[] }) {
  const events = useMemo(() => buildActivity(mandate, attempts), [mandate, attempts]);

  return (
    <div className="rounded-lg border border-border bg-surface p-4">
      <h3 className="text-[13.5px] font-semibold text-text-primary">Mandate Activity</h3>
      <p className="mt-0.5 text-[11px] text-text-muted">Demo operational history synthesized from mandate and attempt records.</p>
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
