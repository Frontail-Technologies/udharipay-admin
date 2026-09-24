"use client";

import { useState } from "react";
import { normalizeApiError } from "@/api/http/errors";
import { useCustomerReminders } from "@/features/communications/hooks/useCommunications";
import { reminderStatusTone, reminderTypeLabel } from "@/features/communications/utils/metadata";
import { DetailSection } from "@/components/entity/DetailSection";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate, humanizeSnakeCase } from "@/lib/format";
import { formatTimestamp } from "@/shared/utils/date";

export function CustomerRemindersSection({ customerId }: { customerId: string }) {
  const [cursors, setCursors] = useState<string[]>([]);
  const cursor = cursors.at(-1);
  const query = useCustomerReminders(customerId, { limit: 10, ...(cursor ? { cursor } : {}) });
  const nextCursor = query.data?.data.pagination.nextCursor ?? null;

  if (query.isPending) return <Skeleton className="h-24 w-full" />;
  if (query.isError) return <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-6 text-center text-[13px] text-destructive">{normalizeApiError(query.error).message}</div>;

  const reminders = query.data.data.items;
  return <DetailSection title="WhatsApp Reminders" description="Payment reminders sent to this customer on WhatsApp">
    {reminders.length === 0 ? <p className="text-[13px] text-text-muted">No reminders have been scheduled for this customer.</p> : <div className="flex flex-col divide-y divide-border">
      {reminders.map((reminder) => <div key={reminder.publicId} className="flex flex-col gap-1 py-2.5 first:pt-0 last:pb-0">
        <div className="flex flex-wrap items-center justify-between gap-2"><div className="flex items-center gap-2"><span className="text-[13px] font-medium text-text-primary">{reminderTypeLabel(reminder.type)}</span><StatusBadge tone={reminderStatusTone[reminder.status] ?? "neutral"}>{humanizeSnakeCase(reminder.status)}</StatusBadge></div><span className="text-[11.5px] text-text-muted">{reminder.publicId}</span></div>
        <p className="text-[12px] text-text-muted">Installment {reminder.installmentNumber ?? "—"}{reminder.dueDate ? ` due ${formatDate(reminder.dueDate)}` : ""} · Template {reminder.templateKey}{reminder.templateVersion ? ` v${reminder.templateVersion}` : ""} · Attempts {reminder.attemptCount}</p>
        <p className="text-[12px] text-text-muted">Scheduled {formatTimestamp(reminder.scheduledFor)}{reminder.sentAt ? ` · Sent ${formatTimestamp(reminder.sentAt)}` : ""}{reminder.deliveredAt ? ` · Delivered ${formatTimestamp(reminder.deliveredAt)}` : ""}{reminder.cancelledAt ? ` · Cancelled ${formatTimestamp(reminder.cancelledAt)}` : ""}{reminder.failedAt ? ` · Failed ${formatTimestamp(reminder.failedAt)}` : ""}</p>
        {(reminder.failureReason || reminder.failureCode) && <p className="text-[12px] text-error">{reminder.failureReason ?? humanizeSnakeCase(reminder.failureCode ?? "")}</p>}
      </div>)}
    </div>}
    {(cursors.length > 0 || nextCursor) && <div className="mt-3 flex justify-end gap-1.5"><Button variant="outline" size="sm" className="h-8" disabled={cursors.length === 0} onClick={() => setCursors((current) => current.slice(0, -1))}>Previous</Button><Button variant="outline" size="sm" className="h-8" disabled={!nextCursor} onClick={() => nextCursor && setCursors((current) => [...current, nextCursor])}>Next</Button></div>}
  </DetailSection>;
}
