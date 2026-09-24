"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { ChevronDown, ChevronRight, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { applyApiFormErrors } from "@/api/forms/formErrors";
import { normalizeApiError } from "@/api/http/errors";
import { TemplateApprovalStatus, type WhatsAppTemplate, type WhatsAppTemplateVersion } from "@/api/generated/contracts/communications";
import { useActivateTemplateVersion, useCreateTemplateVersion, usePreviewTemplate, useUpdateTemplateVersion, useUpdateWhatsAppTemplate, useWhatsAppTemplates } from "@/features/communications/hooks/useCommunications";
import { approvalLabels, approvalTone, approvalTransitions } from "@/features/communications/utils/metadata";
import { effectiveStatusLabels, effectiveStatusOf, effectiveStatusTone, featuredVersionOf, resolvePreview, templateSchedules } from "@/features/communications/utils/templateSummary";
import { FormField } from "@/components/entity/FormField";
import { KeyValueRow } from "@/components/entity/KeyValueRow";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { formatTimestamp } from "@/shared/utils/date";

export function TemplatesPanel() {
  const query = useWhatsAppTemplates();
  const [editingKey, setEditingKey] = useState<string | null>(null);
  if (query.isPending) return <div className="flex flex-col gap-2"><Skeleton className="h-24 w-full" /><Skeleton className="h-24 w-full" /></div>;
  if (query.isError) return <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-8 text-center text-[13px] text-destructive">{normalizeApiError(query.error).message}</div>;
  const templates = query.data.data.items;
  const editing = templates.find((template) => template.templateKey === editingKey);
  return <div className="flex flex-col gap-2">
    {templates.map((template) => <TemplateRow key={template.templateKey} template={template} onEdit={() => setEditingKey(template.templateKey)} />)}
    {editing && <EditTemplateDialog template={editing} onClose={() => setEditingKey(null)} />}
  </div>;
}

function TemplateRow({ template, onEdit }: { template: WhatsAppTemplate; onEdit: () => void }) {
  const status = effectiveStatusOf(template);
  const featured = featuredVersionOf(template);
  return <div className="flex items-center justify-between gap-4 rounded-[11px] border border-border bg-surface px-4 py-3">
    <div className="min-w-0 flex-1">
      <div className="flex flex-wrap items-center gap-2"><h3 className="text-[14px] font-semibold text-text-primary">{template.displayName}</h3><StatusBadge tone={effectiveStatusTone[status]}>{effectiveStatusLabels[status]}</StatusBadge></div>
      <p className="mt-0.5 text-[12px] text-text-muted">{templateSchedules[template.templateKey] ?? template.description ?? "Customer reminder"}</p>
      {featured && <p className="mt-1.5 line-clamp-1 break-words text-[12.5px] text-text-secondary">&ldquo;{resolvePreview(featured.bodyTemplate)}&rdquo;</p>}
    </div>
    <Button variant="outline" size="sm" className="h-8 shrink-0" onClick={onEdit}>Edit</Button>
  </div>;
}

function EditTemplateDialog({ template, onClose }: { template: WhatsAppTemplate; onClose: () => void }) {
  const [creating, setCreating] = useState(false);
  const enabledMutation = useUpdateWhatsAppTemplate();
  const featured = featuredVersionOf(template);
  const sorted = template.versions.slice().sort((a, b) => b.version - a.version);
  const toggle = async () => {
    try { await enabledMutation.mutateAsync({ templateKey: template.templateKey, input: { isEnabled: !template.isEnabled } }); } catch (error) { toast.error(normalizeApiError(error).message); }
  };
  return <Dialog open onOpenChange={(open) => { if (!open) onClose(); }}>
    <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
      <DialogHeader><DialogTitle>Edit Template</DialogTitle><DialogDescription className="sr-only">Template settings, versions and approval</DialogDescription></DialogHeader>
      <section className="flex flex-col gap-1">
        <h4 className="text-[12px] font-semibold uppercase tracking-wide text-text-muted">Template</h4>
        <KeyValueRow label="Name" value={template.displayName} />
        <KeyValueRow label="Key" value={template.templateKey} />
        <div className="flex items-center justify-between gap-3 pt-1"><span className="text-[13px] text-text-secondary">Enabled</span><Button variant="outline" size="sm" className="h-8" disabled={enabledMutation.isPending} onClick={() => void toggle()}>{template.isEnabled ? "Disable Template" : "Enable Template"}</Button></div>
      </section>
      <section className="flex flex-col gap-2">
        <div className="flex items-center justify-between gap-2"><h4 className="text-[12px] font-semibold uppercase tracking-wide text-text-muted">{featured?.isActive ? "Active Version" : "Latest Version"}</h4><Button size="sm" className="h-8" onClick={() => setCreating(true)}>New Version</Button></div>
        {featured ? <VersionDetail templateKey={template.templateKey} version={featured} /> : <p className="text-[13px] text-text-muted">No versions yet.</p>}
      </section>
      {sorted.length > 1 && <section className="flex flex-col gap-1">
        <h4 className="text-[12px] font-semibold uppercase tracking-wide text-text-muted">Version History</h4>
        <div className="flex flex-col divide-y divide-border rounded-lg border border-border">{sorted.map((version) => <HistoryRow key={version.version} templateKey={template.templateKey} version={version} />)}</div>
      </section>}
      {creating && <NewVersionDialog template={template} onClose={() => setCreating(false)} />}
    </DialogContent>
  </Dialog>;
}

function VersionBadges({ version }: { version: WhatsAppTemplateVersion }) {
  return <><StatusBadge tone={approvalTone[version.approvalStatus]}>{approvalLabels[version.approvalStatus]}</StatusBadge>{version.isActive && <StatusBadge tone="success">Active</StatusBadge>}</>;
}

function HistoryRow({ templateKey, version }: { templateKey: string; version: WhatsAppTemplateVersion }) {
  const [open, setOpen] = useState(false);
  return <div className="px-3 py-2">
    <button type="button" aria-expanded={open} aria-label={`Version ${version.version}`} className="flex w-full items-center gap-2 text-left text-[13px]" onClick={() => setOpen((current) => !current)}>{open ? <ChevronDown className="size-3.5" /> : <ChevronRight className="size-3.5" />}<span className="font-medium text-text-primary">v{version.version}</span><VersionBadges version={version} /></button>
    {open && <div className="mt-2 pl-5"><VersionDetail templateKey={templateKey} version={version} /></div>}
  </div>;
}

function VersionDetail({ templateKey, version }: { templateKey: string; version: WhatsAppTemplateVersion }) {
  const updateMutation = useUpdateTemplateVersion();
  const activateMutation = useActivateTemplateVersion();
  const busy = updateMutation.isPending || activateMutation.isPending;
  const move = async (approvalStatus: TemplateApprovalStatus) => {
    try { await updateMutation.mutateAsync({ templateKey, version: version.version, input: { approvalStatus } }); } catch (error) { toast.error(normalizeApiError(error).message); }
  };
  const activate = async () => {
    try { await activateMutation.mutateAsync({ templateKey, version: version.version }); } catch (error) { toast.error(normalizeApiError(error).message); }
  };
  return <div className="flex flex-col gap-2">
    <div className="flex flex-wrap items-center gap-2 text-[12.5px]"><span className="font-medium text-text-primary">Version {version.version}</span><VersionBadges version={version} /><span className="text-text-muted">{version.language}</span></div>
    <p className="whitespace-pre-wrap break-words rounded-md bg-surface-muted px-3 py-2 text-[12.5px] text-text-primary">{version.bodyTemplate}</p>
    <KeyValueRow label="Provider template" value={version.providerTemplateName ? `${version.providerTemplateName}${version.providerTemplateId ? ` (${version.providerTemplateId})` : ""}` : "Not mapped"} />
    <KeyValueRow label="Approval" value={approvalLabels[version.approvalStatus]} />
    <p className="text-[11.5px] text-text-muted">Created {formatTimestamp(version.createdAt)}{version.activatedAt ? ` · Activated ${formatTimestamp(version.activatedAt)}` : ""}</p>
    <div className="flex flex-wrap gap-1.5">
      {approvalTransitions[version.approvalStatus].map((status) => <Button key={status} variant="outline" size="sm" className="h-7 text-[12px]" disabled={busy} onClick={() => void move(status)}>{transitionLabel(status)}</Button>)}
      {version.approvalStatus === TemplateApprovalStatus.approved && !version.isActive && <Button size="sm" className="h-7 text-[12px]" disabled={busy} onClick={() => void activate()}>Activate</Button>}
    </div>
  </div>;
}

function transitionLabel(status: TemplateApprovalStatus) {
  if (status === "pending_approval") return "Submit for Approval";
  if (status === "approved") return "Mark Approved";
  if (status === "rejected") return "Mark Rejected";
  if (status === "draft") return "Back to Draft";
  return "Disable";
}

type VersionValues = { bodyTemplate: string; language: string; providerTemplateName: string; providerTemplateId: string };

function NewVersionDialog({ template, onClose }: { template: WhatsAppTemplate; onClose: () => void }) {
  const mutation = useCreateTemplateVersion();
  const preview = usePreviewTemplate();
  const latest = template.versions.slice().sort((a, b) => b.version - a.version)[0];
  const { register, handleSubmit, getValues, setValue, setError, formState: { errors } } = useForm<VersionValues>({ defaultValues: { bodyTemplate: latest?.bodyTemplate ?? "", language: latest?.language ?? "en", providerTemplateName: "", providerTemplateId: "" } });
  const submit = async (values: VersionValues) => {
    try {
      await mutation.mutateAsync({ templateKey: template.templateKey, input: { bodyTemplate: values.bodyTemplate, language: values.language, ...(values.providerTemplateName ? { providerTemplateName: values.providerTemplateName } : {}), ...(values.providerTemplateId ? { providerTemplateId: values.providerTemplateId } : {}) } });
      onClose();
    } catch (error) { const result = applyApiFormErrors(error, setError); if (!result.applied) toast.error(result.error.message); }
  };
  const runPreview = async () => {
    try { await preview.mutateAsync({ templateKey: template.templateKey, bodyTemplate: getValues("bodyTemplate") }); } catch (error) { toast.error(normalizeApiError(error).message); }
  };
  const insertVariable = (name: string) => setValue("bodyTemplate", `${getValues("bodyTemplate")}{{${name}}}`, { shouldDirty: true });
  return <Dialog open onOpenChange={(open) => { if (!open && !mutation.isPending) onClose(); }}>
    <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl"><DialogHeader><DialogTitle>New Version</DialogTitle><DialogDescription className="sr-only">Create a draft version of {template.displayName}</DialogDescription></DialogHeader>
      <form id="template-version-form" className="grid gap-3" onSubmit={handleSubmit(submit)}>
        <FormField label="Message Body" htmlFor="template-body" error={errors.bodyTemplate?.message}><Textarea id="template-body" rows={5} {...register("bodyTemplate", { required: "Message body is required" })} /></FormField>
        <div className="flex flex-wrap gap-1.5">{template.allowedVariables.map((name) => <button key={name} type="button" className="rounded-full border border-border bg-surface-muted px-2.5 py-0.5 text-[11.5px] text-text-secondary hover:text-text-primary" onClick={() => insertVariable(name)}>{name}</button>)}</div>
        <div className="grid gap-3 sm:grid-cols-3">
          <FormField label="Language" htmlFor="template-language" error={errors.language?.message}><Input id="template-language" {...register("language", { required: "Language is required" })} /></FormField>
          <FormField label="Provider Template Name" htmlFor="template-provider-name" error={errors.providerTemplateName?.message}><Input id="template-provider-name" {...register("providerTemplateName")} /></FormField>
          <FormField label="Provider Template ID" htmlFor="template-provider-id" error={errors.providerTemplateId?.message}><Input id="template-provider-id" {...register("providerTemplateId")} /></FormField>
        </div>
        {preview.data && <p className="whitespace-pre-wrap break-words rounded-lg bg-surface-muted p-3 text-[13px] text-text-primary">{preview.data.data.preview}</p>}
      </form>
      <DialogFooter><Button type="button" variant="outline" disabled={preview.isPending} onClick={() => void runPreview()}>Preview</Button><Button type="button" variant="outline" disabled={mutation.isPending} onClick={onClose}>Cancel</Button><Button type="submit" form="template-version-form" disabled={mutation.isPending}>{mutation.isPending && <Loader2 className="size-4 animate-spin" />}Create Version</Button></DialogFooter>
    </DialogContent>
  </Dialog>;
}
