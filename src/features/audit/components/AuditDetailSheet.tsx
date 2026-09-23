"use client";

import Link from "next/link";
import type { AuditEvent } from "@/api/generated/contracts/audit";
import { auditEntityRoutes, humanizeAuditToken } from "@/features/audit/utils/metadata";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { KeyValueRow } from "@/components/entity/KeyValueRow";
import { formatTimestamp } from "@/shared/utils/date";

export function AuditDetailSheet({ event, onOpenChange }: { event: AuditEvent | null; onOpenChange: (open: boolean) => void }) {
  const route = event ? auditEntityRoutes[event.entityType] : undefined;
  return <Sheet open={Boolean(event)} onOpenChange={onOpenChange}>
    <SheetContent side="right" className="w-full gap-0 overflow-y-auto sm:max-w-md">
      {event && <>
        <SheetHeader className="border-b border-border px-4 py-4">
          <SheetTitle className="text-[15px] font-semibold text-text-primary">{humanizeAuditToken(event.action)}</SheetTitle>
          <SheetDescription className="text-[12px] text-text-muted">{formatTimestamp(event.createdAt)}</SheetDescription>
        </SheetHeader>
        <div className="flex flex-col gap-4 px-4 py-4">
          <div className="rounded-lg border border-border bg-surface p-3.5">
            <div className="flex flex-col divide-y divide-border">
              <KeyValueRow label="Actor" value={event.actorUserId ? `${humanizeAuditToken(event.actorRole ?? "user")} · ${event.actorUserId}` : "System"} />
              <KeyValueRow label="Action" value={humanizeAuditToken(event.action)} />
              <KeyValueRow label="Entity Type" value={humanizeAuditToken(event.entityType)} />
              <KeyValueRow label="Entity" value={route ? <Link href={route.href(event.entityId)} className="text-primary hover:underline">{route.label}</Link> : event.entityId} />
              <KeyValueRow label="Request ID" value={event.requestId ?? "-"} />
              <KeyValueRow label="Timestamp" value={formatTimestamp(event.createdAt)} />
            </div>
          </div>
          <AuditPayloadSection title="Changes" value={event.changes} empty="No field-level changes recorded for this action." />
          <AuditPayloadSection title="Metadata" value={event.metadata} empty="No additional metadata recorded for this action." />
        </div>
      </>}
    </SheetContent>
  </Sheet>;
}

function AuditPayloadSection({ title, value, empty }: { title: string; value: unknown; empty: string }) {
  const entries = safePayloadEntries(value);
  return <div className="rounded-lg border border-border bg-surface p-3.5">
    <h3 className="text-[12.5px] font-semibold text-text-primary">{title}</h3>
    {entries === null ? <p className="mt-2 text-[12px] text-text-muted">{empty}</p> : <ul className="mt-2 flex flex-col divide-y divide-border">
      {entries.map(([key, entry]) => <li key={key} className="flex items-center justify-between gap-3 py-2 text-[12.5px]"><span className="font-medium text-text-secondary">{humanizeAuditToken(key)}</span><span className="min-w-0 truncate text-right text-text-primary">{entry}</span></li>)}
    </ul>}
  </div>;
}

function safePayloadEntries(value: unknown): Array<[string, string]> | null {
  if (value === null || value === undefined) return null;
  if (typeof value !== "object" || Array.isArray(value)) return null;
  const entries = Object.entries(value as Record<string, unknown>).map(([key, entry]) => [key, safeScalar(entry)] as [string, string]);
  return entries.length ? entries : null;
}

function safeScalar(value: unknown): string {
  if (value === null || value === undefined) return "-";
  if (typeof value === "string") return value.length > 200 ? `${value.slice(0, 200)}…` : value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  return "Structured value";
}
