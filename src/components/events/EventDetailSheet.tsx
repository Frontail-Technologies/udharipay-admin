"use client";

import Link from "next/link";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { KeyValueRow } from "@/components/entity/KeyValueRow";
import { useEventEntityResolver } from "@/components/events/resolveEventEntity";
import type { AdminOperationalEvent } from "@/data/admin/events/types";
import { eventSeverityTone, eventStatusTone } from "@/data/admin/statusTones";
import { formatDate, humanizeSnakeCase, pseudoTimeOfDay } from "@/lib/format";

export function EventDetailSheet({
  event,
  onOpenChange,
}: {
  event: AdminOperationalEvent | null;
  onOpenChange: (open: boolean) => void;
}) {
  const resolveEntity = useEventEntityResolver();
  const entity = event ? resolveEntity(event.entityType, event.entityId) : null;
  const kycHref = event?.sourceType === "KYC Review" ? `/kyc/${event.sourceId}` : null;

  return (
    <Sheet open={Boolean(event)} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full gap-0 overflow-y-auto sm:max-w-md">
        {event && entity && (
          <>
            <SheetHeader className="border-b border-border px-4 py-4">
              <div className="flex flex-wrap items-center gap-1.5">
                <StatusBadge tone={eventSeverityTone[event.severity]}>{humanizeSnakeCase(event.severity)}</StatusBadge>
                <StatusBadge tone={eventStatusTone[event.status]}>{humanizeSnakeCase(event.status)}</StatusBadge>
              </div>
              <SheetTitle className="text-[15px] font-semibold text-text-primary">{event.title}</SheetTitle>
              <SheetDescription className="text-[12px] text-text-muted">
                {formatDate(event.occurredAt)} · {pseudoTimeOfDay(event.sourceId)}
              </SheetDescription>
            </SheetHeader>

            <div className="flex flex-col gap-4 px-4 py-4">
              <div className="rounded-lg border border-border bg-surface p-3.5">
                <h3 className="text-[12.5px] font-semibold text-text-primary">Details</h3>
                <div className="mt-2 flex flex-col divide-y divide-border">
                  <KeyValueRow label="Category" value={<span className="capitalize">{event.category}</span>} />
                  <KeyValueRow label="Entity" value={entity.label} />
                  <KeyValueRow label="Source" value={event.sourceType} />
                  <KeyValueRow label="Occurred" value={formatDate(event.occurredAt)} />
                </div>
                {event.description && (
                  <p className="mt-3 text-[12.5px] text-text-secondary">{event.description}</p>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <h3 className="text-[12.5px] font-semibold text-text-primary">Related Links</h3>
                {entity.href && (
                  <Button variant="outline" size="sm" asChild className="h-8 justify-start text-[12.5px]">
                    <Link href={entity.href}>{entity.actionLabel}</Link>
                  </Button>
                )}
                {kycHref && (
                  <Button variant="outline" size="sm" asChild className="h-8 justify-start text-[12.5px]">
                    <Link href={kycHref}>View KYC Review</Link>
                  </Button>
                )}
                {!entity.href && !kycHref && (
                  <p className="text-[12px] text-text-muted">No linked record is available for this event.</p>
                )}
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
