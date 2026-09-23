"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { FileText, Loader2, Trash2 } from "lucide-react";
import type { KycSubjectType } from "@/api/generated/common";
import type { KycDocumentType } from "@/api/generated/contracts/kyc";
import { normalizeApiError } from "@/api/http/errors";
import { KycUploadBatchError, useSaveAndSubmitKyc, useSubjectKyc } from "@/features/kyc/hooks/useKyc";
import { kycDocumentPolicy, kycDocumentLabels, kycStatusLabels, kycStatusTones } from "@/features/kyc/utils/metadata";
import { validateKycFile, type LocalKycFile } from "@/features/kyc/utils/files";
import { KycDocumentList } from "@/features/kyc/components/KycDocumentList";
import { DetailSection } from "@/components/entity/DetailSection";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { Button } from "@/components/ui/button";

export function SubjectKycSection({ subjectType, subjectId }: { subjectType: KycSubjectType; subjectId: string }) {
  const query = useSubjectKyc(subjectType, subjectId);
  const save = useSaveAndSubmitKyc(subjectType, subjectId);
  const [files, setFiles] = useState<LocalKycFile[]>([]);
  const [progress, setProgress] = useState("");
  const [formError, setFormError] = useState("");
  const previews = useRef(new Set<string>());
  useEffect(() => () => { previews.current.forEach((url) => URL.revokeObjectURL(url)); }, []);
  const notFound = query.isError && normalizeApiError(query.error).status === 404;
  if (query.isPending) return <DetailSection title="KYC & Documents"><div className="flex items-center gap-2 text-[12px] text-text-muted"><Loader2 className="size-4 animate-spin" />Loading KYC review</div></DetailSection>;
  if (query.isError && !notFound) return <DetailSection title="KYC & Documents"><p className="text-[12px] text-destructive">{normalizeApiError(query.error).message}</p></DetailSection>;
  const review = query.data?.data ?? null;
  const editable = !review || review.status === "pending" || review.status === "resubmission_required";
  const existingTypes = new Set((review?.documents ?? []).filter((document) => document.status === "uploaded" || document.status === "verified").map((document) => document.documentType));
  const updateFile = (id: string, patch: Partial<LocalKycFile>) => setFiles((current) => current.map((item) => item.id === id ? { ...item, ...patch } : item));
  const chooseFile = (documentType: KycDocumentType, file: File) => {
    const error = validateKycFile(file);
    const current = files.find((item) => item.documentType === documentType && !item.confirmedDocument);
    if (current?.previewUrl) { URL.revokeObjectURL(current.previewUrl); previews.current.delete(current.previewUrl); }
    const previewUrl = !error && file.type.startsWith("image/") ? URL.createObjectURL(file) : null;
    if (previewUrl) previews.current.add(previewUrl);
    const next: LocalKycFile = { id: crypto.randomUUID(), documentType, file, previewUrl, status: error ? "error" : "selected", error, confirmedDocument: null };
    setFiles((items) => [...items.filter((item) => item.documentType !== documentType || item.confirmedDocument), next]);
    setFormError("");
  };
  const removeFile = (id: string) => setFiles((current) => { const target = current.find((item) => item.id === id); if (target?.previewUrl) { URL.revokeObjectURL(target.previewUrl); previews.current.delete(target.previewUrl); } return current.filter((item) => item.id !== id); });
  const submit = async () => {
    const validFiles = files.filter((item) => !item.error);
    const available = new Set([...existingTypes, ...validFiles.map((item) => item.documentType)]);
    const missing = kycDocumentPolicy[subjectType].filter((item) => item.required && !available.has(item.type)).map((item) => kycDocumentLabels[item.type]);
    if (missing.length) { setFormError(`Required documents missing: ${missing.join(", ")}`); return; }
    if (files.some((item) => item.error && !item.confirmedDocument)) { setFormError("Remove or replace invalid files before submitting"); return; }
    setFormError("");
    try {
      await save.mutateAsync({ review, files: validFiles, onFileChange: updateFile, onProgress: setProgress });
      files.forEach((item) => { if (item.previewUrl) URL.revokeObjectURL(item.previewUrl); });
      previews.current.clear();
      setFiles([]);
      setProgress("");
    } catch (error) {
      setProgress("");
      setFormError(error instanceof KycUploadBatchError ? `${error.failedIds.length} document${error.failedIds.length === 1 ? "" : "s"} failed. Retry to continue without re-uploading confirmed files.` : normalizeApiError(error).message);
    }
  };
  return <DetailSection title="KYC & Documents" description="Private evidence is uploaded only when Save & Submit is pressed." action={review && <div className="flex items-center gap-2"><StatusBadge tone={kycStatusTones[review.status]}>{kycStatusLabels[review.status]}</StatusBadge><Button asChild variant="outline" size="sm" className="h-7 text-[11.5px]"><Link href={`/kyc/${review.id}`}>Open Review</Link></Button></div>}>
    {review?.documents.length ? <div className="mb-4"><KycDocumentList documents={review.documents} /></div> : null}
    {editable ? <div className="flex flex-col gap-2.5">{kycDocumentPolicy[subjectType].map((policy) => { const selected = files.find((item) => item.documentType === policy.type); return <div key={policy.type} className="flex min-h-16 items-center justify-between gap-3 rounded-lg border border-border px-3 py-2.5"><div className="flex min-w-0 items-center gap-2.5">{selected?.previewUrl ? <Image src={selected.previewUrl} alt="Selected document preview" width={40} height={40} unoptimized className="size-10 rounded object-cover" /> : <FileText className="size-5 shrink-0 text-text-muted" />}<div className="min-w-0"><p className="text-[12.5px] font-medium text-text-primary">{kycDocumentLabels[policy.type]} {policy.required && <span className="text-error">Required</span>}</p><p className="truncate text-[11px] text-text-muted">{selected?.file.name ?? (existingTypes.has(policy.type) ? "Confirmed document on file" : "PDF, JPEG or PNG · 10 MiB max")}</p>{selected?.error && <p className="text-[11px] text-error">{selected.error}</p>}{selected?.status === "confirmed" && <p className="text-[11px] text-success">Confirmed</p>}</div></div><div className="flex shrink-0 items-center gap-1.5">{selected && !selected.confirmedDocument && <Button type="button" variant="ghost" size="icon-sm" disabled={save.isPending} aria-label={`Remove ${kycDocumentLabels[policy.type]}`} onClick={() => removeFile(selected.id)}><Trash2 className="size-3.5" /></Button>}{!selected?.confirmedDocument && <label className="inline-flex h-8 cursor-pointer items-center rounded-md border border-border px-3 text-[11.5px] font-medium text-text-secondary hover:bg-surface-hover">{selected ? "Replace" : "Select"}<input type="file" aria-label={`Select ${kycDocumentLabels[policy.type]}`} accept="application/pdf,image/jpeg,image/png" className="sr-only" disabled={save.isPending} onChange={(event) => { const file = event.target.files?.[0]; if (file) chooseFile(policy.type, file); event.target.value = ""; }} /></label>}</div></div>; })}{formError && <p className="text-[12px] text-destructive">{formError}</p>}<div className="flex items-center justify-between gap-3 pt-1"><p className="text-[11.5px] text-text-muted">{progress}</p><Button type="button" size="sm" disabled={save.isPending} onClick={() => void submit()}>{save.isPending && <Loader2 className="size-4 animate-spin" />}{files.some((item) => item.status === "error") ? "Retry & Submit" : "Save & Submit"}</Button></div></div> : !review?.documents.length ? <p className="text-[12px] text-text-muted">No documents available.</p> : null}
  </DetailSection>;
}
