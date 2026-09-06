"use client";

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { KeyValueRow } from "@/components/entity/KeyValueRow";
import type { AdminAuditEvent } from "@/data/admin/events/types";
import { formatDate, pseudoTimeOfDay } from "@/lib/format";

export function AuditDetailSheet({
  event,
  onOpenChange,
}: {
  event: AdminAuditEvent | null;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Sheet open={Boolean(event)} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full gap-0 overflow-y-auto sm:max-w-md">
        {event && (
          <>
            <SheetHeader className="border-b border-border px-4 py-4">
              <SheetTitle className="text-[15px] font-semibold text-text-primary">{event.action}</SheetTitle>
              <SheetDescription className="text-[12px] text-text-muted">
                {formatDate(event.createdAt.slice(0, 10))} · {pseudoTimeOfDay(event.id)}
              </SheetDescription>
            </SheetHeader>

            <div className="flex flex-col gap-4 px-4 py-4">
              <div className="rounded-lg border border-border bg-surface p-3.5">
                <div className="flex flex-col divide-y divide-border">
                  <KeyValueRow label="Actor" value={event.actorName} />
                  <KeyValueRow label="Action" value={event.action} />
                  <KeyValueRow label="Entity" value={event.entityLabel} />
                  <KeyValueRow label="Timestamp" value={formatDate(event.createdAt.slice(0, 10))} />
                </div>
                {event.metadata && <p className="mt-3 text-[12.5px] text-text-secondary">{event.metadata}</p>}
              </div>

              <div className="rounded-lg border border-border bg-surface p-3.5">
                <h3 className="text-[12.5px] font-semibold text-text-primary">Changes</h3>
                {!event.changes || event.changes.length === 0 ? (
                  <p className="mt-2 text-[12px] text-text-muted">No field-level changes recorded for this action.</p>
                ) : (
                  <ul className="mt-2 flex flex-col divide-y divide-border">
                    {event.changes.map((change) => (
                      <li key={change.field} className="flex flex-col gap-1 py-2.5">
                        <span className="text-[11.5px] font-medium text-text-secondary">{change.field}</span>
                        <div className="flex items-center gap-2 text-[12.5px]">
                          <span className="rounded bg-surface-muted px-1.5 py-0.5 text-text-muted line-through">
                            {change.from}
                          </span>
                          <span className="text-text-muted">→</span>
                          <span className="rounded bg-primary/10 px-1.5 py-0.5 font-medium text-primary">{change.to}</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <p className="text-[11px] text-text-muted">
                Demo audit history — production audit logging will be server-side.
              </p>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
