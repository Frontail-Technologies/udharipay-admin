"use client";

import { useMemo, useState } from "react";
import { Loader2, Megaphone } from "lucide-react";
import { toast } from "sonner";
import { normalizeApiError } from "@/api/http/errors";
import { AnnouncementAudience, NotificationActionTarget, SearchAnnouncementRecipientsRole, type Announcement, type AnnouncementPreview, type AnnouncementRecipientOption } from "@/api/generated/contracts/communications";
import { useAnnouncementRecipients, useAnnouncements, useCreateAnnouncement, usePreviewAnnouncement } from "@/features/communications/hooks/useCommunications";
import { actionTargetLabels, announcementStatusTone, audienceLabels } from "@/features/communications/utils/metadata";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { FormField } from "@/components/entity/FormField";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { KeyValueRow } from "@/components/entity/KeyValueRow";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { humanizeSnakeCase } from "@/lib/format";
import { formatTimestamp } from "@/shared/utils/date";

const NO_TARGET = "none";

export function AnnouncementsPanel() {
  const [cursors, setCursors] = useState<string[]>([]);
  const [creating, setCreating] = useState(false);
  const [viewing, setViewing] = useState<Announcement | null>(null);
  const cursor = cursors.at(-1);
  const query = useAnnouncements({ limit: 20, ...(cursor ? { cursor } : {}) });
  const nextCursor = query.data?.data.pagination.nextCursor ?? null;
  const items = query.data?.data.items ?? [];
  const pushUnavailable = items.length > 0 && items.every((item) => item.devicesTargeted === 0 && item.pushAccepted === 0 && item.pushFailed === 0 && item.pushPending === 0);

  return <div className="flex flex-col gap-3">
    <div className="flex items-center justify-between gap-3"><h2 className="text-[15px] font-semibold text-text-primary">Announcements</h2><Button size="sm" className="h-9 gap-1.5" onClick={() => setCreating(true)}><Megaphone className="size-3.5" />New Announcement</Button></div>
    {pushUnavailable && <div role="status" className="rounded-lg bg-surface-muted px-3 py-2 text-[12.5px] text-text-secondary">Push delivery is not configured yet. In-app announcements will still be delivered.</div>}
    {query.isPending ? <Skeleton className="h-32 w-full" /> : query.isError ? <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-8 text-center text-[13px] text-destructive">{normalizeApiError(query.error).message}</div> : items.length === 0 ? <div className="rounded-lg border border-border px-4 py-10 text-center text-[13px] text-text-muted">No announcements yet.</div> : <div className="flex flex-col gap-2">
      {items.map((announcement) => <AnnouncementRow key={announcement.publicId} announcement={announcement} onView={() => setViewing(announcement)} />)}
      {(cursors.length > 0 || nextCursor) && <div className="flex justify-end gap-1.5"><Button variant="outline" size="sm" className="h-8" disabled={cursors.length === 0} onClick={() => setCursors((current) => current.slice(0, -1))}>Previous</Button><Button variant="outline" size="sm" className="h-8" disabled={!nextCursor} onClick={() => nextCursor && setCursors((current) => [...current, nextCursor])}>Next</Button></div>}
    </div>}
    {creating && <CreateAnnouncementDialog onClose={() => setCreating(false)} />}
    {viewing && <AnnouncementDetailDialog announcement={viewing} onClose={() => setViewing(null)} />}
  </div>;
}

function AnnouncementRow({ announcement, onView }: { announcement: Announcement; onView: () => void }) {
  return <div className="flex items-start justify-between gap-4 rounded-[11px] border border-border bg-surface px-4 py-3">
    <div className="min-w-0 flex-1">
      <div className="flex flex-wrap items-center gap-2"><h3 className="text-[14px] font-semibold text-text-primary">{announcement.title}</h3><StatusBadge tone={announcementStatusTone[announcement.status]}>{humanizeSnakeCase(announcement.status)}</StatusBadge></div>
      <p className="mt-0.5 line-clamp-1 break-words text-[12.5px] text-text-secondary">{announcement.body}</p>
      <p className="mt-1 text-[12px] text-text-muted">{audienceLabels[announcement.audienceType]} · {formatTimestamp(announcement.sentAt ?? announcement.createdAt)}</p>
      <p className="mt-1.5 flex flex-wrap gap-x-3 text-[12px] text-text-secondary"><span>{announcement.targetedRecipients} recipient{announcement.targetedRecipients === 1 ? "" : "s"}</span><span>{announcement.notificationsCreated} in-app</span>{announcement.pushAccepted > 0 && <span>{announcement.pushAccepted} push</span>}{announcement.pushFailed > 0 && <span className="text-error">{announcement.pushFailed} push failed</span>}</p>
    </div>
    <Button variant="outline" size="sm" className="h-8 shrink-0" onClick={onView}>View</Button>
  </div>;
}

function AnnouncementDetailDialog({ announcement, onClose }: { announcement: Announcement; onClose: () => void }) {
  return <Dialog open onOpenChange={(open) => { if (!open) onClose(); }}>
    <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg"><DialogHeader><DialogTitle>{announcement.title}</DialogTitle><DialogDescription className="sr-only">Announcement delivery details</DialogDescription></DialogHeader>
      <p className="whitespace-pre-wrap break-words text-[13px] text-text-secondary">{announcement.body}</p>
      <div className="flex flex-col">
        <KeyValueRow label="Audience" value={audienceLabels[announcement.audienceType]} />
        <KeyValueRow label="Recipients" value={String(announcement.targetedRecipients)} />
        <KeyValueRow label="In-app created" value={String(announcement.notificationsCreated)} />
        <KeyValueRow label="Devices targeted" value={String(announcement.devicesTargeted)} />
        <KeyValueRow label="Push sent" value={String(announcement.pushAccepted)} />
        <KeyValueRow label="Push failed" value={String(announcement.pushFailed)} />
        <KeyValueRow label="Push pending" value={String(announcement.pushPending)} />
        {announcement.actionTarget && <KeyValueRow label="Opens" value={actionTargetLabels[announcement.actionTarget] ?? announcement.actionTarget} />}
        <KeyValueRow label="Sent at" value={formatTimestamp(announcement.sentAt ?? announcement.createdAt)} />
      </div>
    </DialogContent>
  </Dialog>;
}

function notifyLabel(audience: AnnouncementAudience, preview: AnnouncementPreview) {
  const plural = (count: number, noun: string) => `${count} ${noun}${count === 1 ? "" : "s"}`;
  if (audience === AnnouncementAudience.merchants) return `Will notify ${plural(preview.merchantRecipients, "merchant")}`;
  if (audience === AnnouncementAudience.employees) return `Will notify ${plural(preview.employeeRecipients, "employee")}`;
  if (audience === AnnouncementAudience.selected_users) return `Will notify ${plural(preview.recipientCount, "selected user")}`;
  return `Will notify ${plural(preview.merchantRecipients, "merchant")} and ${plural(preview.employeeRecipients, "employee")}`;
}

function CreateAnnouncementDialog({ onClose }: { onClose: () => void }) {
  const [audience, setAudience] = useState<AnnouncementAudience>(AnnouncementAudience.both);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [actionTarget, setActionTarget] = useState<string>(NO_TARGET);
  const [selected, setSelected] = useState<AnnouncementRecipientOption[]>([]);
  const [recipientRole, setRecipientRole] = useState<SearchAnnouncementRecipientsRole>(SearchAnnouncementRecipientsRole.merchant);
  const [search, setSearch] = useState("");
  const [preview, setPreview] = useState<AnnouncementPreview | null>(null);
  const idempotencyKey = useMemo(() => crypto.randomUUID(), []);
  const previewMutation = usePreviewAnnouncement();
  const createMutation = useCreateAnnouncement();
  const recipients = useAnnouncementRecipients({ role: recipientRole, ...(search.trim() ? { search: search.trim() } : {}), limit: 10 }, audience === AnnouncementAudience.selected_users);
  const userIds = audience === AnnouncementAudience.selected_users ? selected.map((option) => option.userId) : undefined;
  const audienceReady = audience !== AnnouncementAudience.selected_users || selected.length > 0;
  const formReady = title.trim().length > 0 && body.trim().length > 0 && audienceReady;
  const busy = previewMutation.isPending || createMutation.isPending;

  const invalidatePreview = () => setPreview(null);
  const toggleRecipient = (option: AnnouncementRecipientOption) => {
    invalidatePreview();
    setSelected((current) => current.some((item) => item.userId === option.userId) ? current.filter((item) => item.userId !== option.userId) : [...current, option]);
  };
  const runPreview = async () => {
    try { setPreview((await previewMutation.mutateAsync({ audienceType: audience, ...(userIds ? { userIds } : {}) })).data); } catch (error) { toast.error(normalizeApiError(error).message); }
  };
  const send = async () => {
    if (!preview) return;
    try {
      await createMutation.mutateAsync({ audienceType: audience, ...(userIds ? { userIds } : {}), title: title.trim(), body: body.trim(), ...(actionTarget !== NO_TARGET ? { actionTarget: actionTarget as NotificationActionTarget } : {}), confirmRecipientCount: preview.recipientCount, idempotencyKey });
      onClose();
    } catch (error) {
      const normalized = normalizeApiError(error);
      toast.error(normalized.message);
      if (normalized.status === 409) setPreview(null);
    }
  };

  return <Dialog open onOpenChange={(open) => { if (!open && !busy) onClose(); }}>
    <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl"><DialogHeader><DialogTitle>New Announcement</DialogTitle><DialogDescription className="sr-only">Compose and send an announcement</DialogDescription></DialogHeader>
      <div className="grid gap-3">
        <FormField label="Audience" htmlFor="announcement-audience"><Select value={audience} onValueChange={(value) => { setAudience(value as AnnouncementAudience); invalidatePreview(); }}><SelectTrigger id="announcement-audience" className="w-full"><SelectValue /></SelectTrigger><SelectContent>{Object.values(AnnouncementAudience).map((value) => <SelectItem key={value} value={value}>{audienceLabels[value]}</SelectItem>)}</SelectContent></Select></FormField>
        {audience === AnnouncementAudience.selected_users && <div className="grid gap-2 rounded-lg border border-border p-3">
          <div className="flex gap-2"><Select value={recipientRole} onValueChange={(value) => setRecipientRole(value as SearchAnnouncementRecipientsRole)}><SelectTrigger className="w-36" aria-label="Recipient type"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="merchant">Merchants</SelectItem><SelectItem value="employee">Employees</SelectItem></SelectContent></Select><Input aria-label="Search recipients" placeholder="Search by name, email or phone" value={search} onChange={(event) => setSearch(event.target.value)} /></div>
          <div className="flex max-h-36 flex-col gap-1 overflow-y-auto">{recipients.isPending ? <Skeleton className="h-16 w-full" /> : (recipients.data?.data.items ?? []).map((option) => <label key={option.userId} className="flex cursor-pointer items-center gap-2 text-[12.5px]"><input type="checkbox" checked={selected.some((item) => item.userId === option.userId)} onChange={() => toggleRecipient(option)} /><span className="text-text-primary">{option.label}</span><span className="text-text-muted">{option.detail}</span></label>)}</div>
          <p className="text-[11.5px] text-text-muted">{selected.length} selected{selected.length > 0 ? `: ${selected.map((option) => option.label).join(", ")}` : ""}</p>
        </div>}
        <FormField label="Title" htmlFor="announcement-title"><Input id="announcement-title" maxLength={160} value={title} onChange={(event) => { setTitle(event.target.value); invalidatePreview(); }} /></FormField>
        <FormField label="Message" htmlFor="announcement-body"><Textarea id="announcement-body" rows={4} maxLength={1000} value={body} onChange={(event) => { setBody(event.target.value); invalidatePreview(); }} /></FormField>
        <FormField label="Opens (optional)" htmlFor="announcement-target"><Select value={actionTarget} onValueChange={(value) => { setActionTarget(value); invalidatePreview(); }}><SelectTrigger id="announcement-target" className="w-full"><SelectValue /></SelectTrigger><SelectContent><SelectItem value={NO_TARGET}>Notification inbox only</SelectItem>{Object.values(NotificationActionTarget).map((value) => <SelectItem key={value} value={value}>{actionTargetLabels[value]}</SelectItem>)}</SelectContent></Select></FormField>
        {preview && <div className="rounded-lg bg-surface-muted p-3 text-[12.5px] text-text-primary" role="status"><p className="font-medium">{notifyLabel(audience, preview)}</p>{!preview.withinLimit && <p className="mt-1 text-error">This audience exceeds the maximum size. Narrow it before sending.</p>}{preview.recipientCount === 0 && <p className="mt-1 text-error">There are no active recipients for this audience.</p>}</div>}
      </div>
      <DialogFooter><Button type="button" variant="outline" disabled={busy} onClick={onClose}>Cancel</Button>{preview ? <Button type="button" disabled={busy || !preview.withinLimit || preview.recipientCount === 0} onClick={() => void send()}>{createMutation.isPending && <Loader2 className="size-4 animate-spin" />}Send to {preview.recipientCount}</Button> : <Button type="button" disabled={busy || !formReady} onClick={() => void runPreview()}>{previewMutation.isPending && <Loader2 className="size-4 animate-spin" />}Review Recipients</Button>}</DialogFooter>
    </DialogContent>
  </Dialog>;
}
