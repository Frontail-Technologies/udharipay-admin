"use client";

import { useMemo } from "react";
import { PhoneCall, MessageSquare, Bell, HandCoins, XCircle, CalendarClock, FileEdit } from "lucide-react";
import { AddFollowUpDialog } from "@/components/collections/AddFollowUpDialog";
import { useAdminFollowUpsByPlan } from "@/hooks/useAdminEntities";
import type { CollectionFollowUp, CollectionFollowUpType } from "@/data/admin";
import { formatDate, humanizeSnakeCase } from "@/lib/format";

const TYPE_ICON: Record<CollectionFollowUpType, typeof PhoneCall> = {
  call_attempted: PhoneCall,
  customer_contacted: MessageSquare,
  reminder_sent: Bell,
  promise_to_pay: HandCoins,
  no_response: XCircle,
  follow_up_scheduled: CalendarClock,
  note_added: FileEdit,
};

export function PlanFollowUpTab({
  planId,
  customerId,
  employeeId,
}: {
  planId: string;
  customerId: string;
  employeeId: string | null;
}) {
  const followUps = useAdminFollowUpsByPlan(planId);
  const sorted = useMemo(
    () => [...followUps].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1)),
    [followUps],
  );

  return (
    <div className="flex flex-col gap-3">
      <div className="flex justify-end">
        <AddFollowUpDialog customerId={customerId} planId={planId} employeeId={employeeId} />
      </div>

      <div className="rounded-lg border border-border bg-surface p-4">
        {sorted.length === 0 ? (
          <p className="py-8 text-center text-[13px] text-text-muted">No follow-up activity logged yet.</p>
        ) : (
          <ul className="flex flex-col divide-y divide-border">
            {sorted.map((entry) => (
              <FollowUpRow key={entry.id} entry={entry} />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function FollowUpRow({ entry }: { entry: CollectionFollowUp }) {
  const Icon = TYPE_ICON[entry.type];
  return (
    <li className="flex gap-3 py-3">
      <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-primary-muted text-primary">
        <Icon className="size-4" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-[13px] font-medium text-text-primary">{humanizeSnakeCase(entry.type)}</p>
          <p className="text-[11px] text-text-muted">{formatDate(entry.createdAt.slice(0, 10))}</p>
        </div>
        <p className="mt-0.5 text-[12.5px] text-text-secondary">{entry.note}</p>
        {entry.promisedDate && (
          <p className="mt-1 text-[11.5px] text-warning">
            Promise to Pay · {formatDate(entry.promisedDate)}{" "}
            <span className="text-text-muted">(does not change the contractual due date)</span>
          </p>
        )}
        {entry.nextFollowUpDate && (
          <p className="mt-1 text-[11.5px] text-info">Next follow-up · {formatDate(entry.nextFollowUpDate)}</p>
        )}
      </div>
    </li>
  );
}
