"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { Loader2, Plus } from "lucide-react";
import { toast } from "sonner";
import { applyApiFormErrors } from "@/api/forms/formErrors";
import { normalizeApiError } from "@/api/http/errors";
import { TemplateApprovalStatus, type WhatsAppTemplate, type WhatsAppTemplateVersion } from "@/api/generated/contracts/communications";
import { useActivateTemplateVersion, useCreateTemplateVersion, usePreviewTemplate, useUpdateWhatsAppTemplate, useUpdateTemplateVersion, useWhatsAppTemplates } from "@/features/communications/hooks/useCommunications";
import { activeVersionOf, approvalLabels, approvalTone, approvalTransitions } from "@/features/communications/utils/metadata";
import { DetailSection } from "@/components/entity/DetailSection";
import { FormField } from "@/components/entity/FormField";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { formatTimestamp } from "@/shared/utils/date";

export function TemplatesPanel() {
  const query = useWhatsAppTemplates();
  if (query.isPending) return <div className="flex flex-col gap-3"><Skeleton className="h-40 w-full" /><Skeleton className="h-40 w-full" /></div>;
  if (query.isError) return <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-8 text-center text-[13px] text-destructive">{normalizeApiError(query.error).message}</div>;
  return <div className="flex flex-col gap-4">
    <p className="max-w-3xl text-[12.5px] leading-relaxed text-text-secondary">Customer reminders are sent on WhatsApp only, using the active approved version of each template. A reminder is cancelled if its template has no active approved version. Provider approval must be completed with your WhatsApp provider before a version is marked approved here.</p>
    {query.data.data.items.map((template) => <TemplateCard key={template.templateKey} template={template} />)}
  </div>;
}

function TemplateCard({ template }: { template: WhatsAppTemplate }) {
  const [creating, setCreating] = useState(false);
  const enabledMutation = useUpdateWhatsAppTemplate();
  const active = activeVersionOf(template);
  const toggle = async () => {
    try { await enabledMutation.mutateAsync({ templateKey: template.templateKey, input: { isEnabled: !template.isEnabled } }); } catch (error) { toast.error(normalizeApiError(error).message); }
  };
  return <DetailSection title={template.displayName} description={`${template.templateKey}${template.description ? ` · ${template.description}` : ""}`} action={<div className="flex items-center gap-2"><StatusBadge tone={template.isEnabled ? "success" : "neutral"}>{template.isEnabled ? "Enabled" : "Disabled"}</StatusBadge><Button variant="outline" size="sm" className="h-8" disabled={enabledMutation.isPending} onClick={() => void toggle()}>{template.isEnabled ? "Disable" : "Enable"}</Button><Button size="sm" className="h-8 gap-1.5" onClick={() => setCreating(true)}><Plus className="size-3.5" />New Version</Button></div>}>
    <p className="mb-3 text-[12px] text-text-muted">{active ? `Active: version ${active.version}` : "No active version — reminders using this template will not be sent."}</p>
    <div className="flex flex-col gap-2">
      {template.versions.slice().sort((a, b) => b.version - a.version).map((version) => <VersionRow key={version.version} templateKey={template.templateKey} version={version} />)}
    </div>
    {creating && <NewVersionDialog template={template} onClose={() => setCreating(false)} />}
  </DetailSection>;
}

function VersionRow({ templateKey, version }: { templateKey: string; version: WhatsAppTemplateVersion }) {
  const updateMutation = useUpdateTemplateVersion();
  const activateMutation = useActivateTemplateVersion();
  const busy = updateMutation.isPending || activateMutation.isPending;
  const move = async (approvalStatus: TemplateApprovalStatus) => {
    try { await updateMutation.mutateAsync({ templateKey, version: version.version, input: { approvalStatus } }); } catch (error) { toast.error(normalizeApiError(error).message); }
  };
  const activate = async () => {
    try { await activateMutation.mutateAsync({ templateKey, version: version.version }); } catch (error) { toast.error(normalizeApiError(error).message); }
  };
  return <div className="rounded-lg border border-border p-3">
    <div className="flex flex-wrap items-center justify-between gap-2">
      <div className="flex items-center gap-2"><span className="text-[13px] font-medium text-text-primary">Version {version.version}</span><StatusBadge tone={approvalTone[version.approvalStatus]}>{approvalLabels[version.approvalStatus]}</StatusBadge>{version.isActive && <StatusBadge tone="primary">Active</StatusBadge>}<span className="text-[11.5px] text-text-muted">{version.language}</span></div>
      <div className="flex flex-wrap gap-1.5">
        {approvalTransitions[version.approvalStatus].map((status) => <Button key={status} variant="outline" size="sm" className="h-7 text-[12px]" disabled={busy} onClick={() => void move(status)}>{status === "pending_approval" ? "Submit for approval" : `Mark ${approvalLabels[status].toLowerCase()}`}</Button>)}
        {version.approvalStatus === TemplateApprovalStatus.approved && !version.isActive && <Button size="sm" className="h-7 text-[12px]" disabled={busy} onClick={() => void activate()}>Activate</Button>}
      </div>
    </div>
    <p className="mt-2 whitespace-pre-wrap text-[12.5px] leading-relaxed text-text-secondary">{version.bodyTemplate}</p>
    <p className="mt-2 text-[11.5px] text-text-muted">Provider template: {version.providerTemplateName ?? "Not mapped"}{version.providerTemplateId ? ` (${version.providerTemplateId})` : ""} · Created {formatTimestamp(version.createdAt)}{version.activatedAt ? ` · Activated ${formatTimestamp(version.activatedAt)}` : ""}</p>
  </div>;
}

type VersionValues = { bodyTemplate: string; language: string; providerTemplateName: string; providerTemplateId: string };

function NewVersionDialog({ template, onClose }: { template: WhatsAppTemplate; onClose: () => void }) {
  const mutation = useCreateTemplateVersion();
  const preview = usePreviewTemplate();
  const latest = template.versions.slice().sort((a, b) => b.version - a.version)[0];
  const { register, handleSubmit, getValues, setError, formState: { errors } } = useForm<VersionValues>({ defaultValues: { bodyTemplate: latest?.bodyTemplate ?? "", language: latest?.language ?? "en", providerTemplateName: "", providerTemplateId: "" } });
  const submit = async (values: VersionValues) => {
    try {
      await mutation.mutateAsync({ templateKey: template.templateKey, input: { bodyTemplate: values.bodyTemplate, language: values.language, ...(values.providerTemplateName ? { providerTemplateName: values.providerTemplateName } : {}), ...(values.providerTemplateId ? { providerTemplateId: values.providerTemplateId } : {}) } });
      onClose();
    } catch (error) { const result = applyApiFormErrors(error, setError); if (!result.applied) toast.error(result.error.message); }
  };
  const runPreview = async () => {
    try { await preview.mutateAsync({ templateKey: template.templateKey, bodyTemplate: getValues("bodyTemplate") }); } catch (error) { toast.error(normalizeApiError(error).message); }
  };
  return <Dialog open onOpenChange={(open) => { if (!open && !mutation.isPending) onClose(); }}>
    <DialogContent className="sm:max-w-xl"><DialogHeader><DialogTitle>New Version — {template.displayName}</DialogTitle><DialogDescription>Allowed variables: {template.allowedVariables.map((name) => `{{${name}}}`).join(", ")}. The new version starts as a draft.</DialogDescription></DialogHeader>
      <form id="template-version-form" className="grid gap-3" onSubmit={handleSubmit(submit)}>
        <FormField label="Message Body" htmlFor="template-body" error={errors.bodyTemplate?.message}><Textarea id="template-body" rows={5} {...register("bodyTemplate", { required: "Message body is required" })} /></FormField>
        <div className="grid gap-3 sm:grid-cols-3">
          <FormField label="Language" htmlFor="template-language" error={errors.language?.message}><Input id="template-language" {...register("language", { required: "Language is required" })} /></FormField>
          <FormField label="Provider Template Name" htmlFor="template-provider-name" error={errors.providerTemplateName?.message}><Input id="template-provider-name" {...register("providerTemplateName")} /></FormField>
          <FormField label="Provider Template ID" htmlFor="template-provider-id" error={errors.providerTemplateId?.message}><Input id="template-provider-id" {...register("providerTemplateId")} /></FormField>
        </div>
        {preview.data && <div className="rounded-lg bg-surface-muted p-3"><p className="text-[11.5px] font-medium text-text-muted">Preview with sample values</p><p className="mt-1 whitespace-pre-wrap text-[13px] text-text-primary">{preview.data.data.preview}</p></div>}
      </form>
      <DialogFooter><Button type="button" variant="outline" disabled={preview.isPending} onClick={() => void runPreview()}>Preview</Button><Button type="button" variant="outline" disabled={mutation.isPending} onClick={onClose}>Cancel</Button><Button type="submit" form="template-version-form" disabled={mutation.isPending}>{mutation.isPending && <Loader2 className="size-4 animate-spin" />}Create Version</Button></DialogFooter>
    </DialogContent>
  </Dialog>;
}
