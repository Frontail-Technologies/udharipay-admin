"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { ChevronLeft, CircleCheck, CircleX, Clock, FileEdit, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { DocumentPreviewDialog } from "@/components/kyc/DocumentPreviewDialog";
import { KycDecisionDialog } from "@/components/kyc/KycDecisionDialog";
import {
  useAdminKycReview,
  useAdminMerchant,
  useAdminCustomer,
  useAdminEmployee,
} from "@/hooks/useAdminEntities";
import {
  startKycReview,
  approveKycReview,
  requestKycResubmission,
  rejectKycReview,
  addKycReviewNote,
} from "@/store/adminKycStore";
import { recordAuditEvent } from "@/store/adminAuditStore";
import { KYC_REVIEW_STATUS_LABEL } from "@/data/admin";
import { kycReviewStatusTone, kycDocumentCheckTone } from "@/data/admin/statusTones";
import { formatDate, humanizeSnakeCase } from "@/lib/format";

const CHECKLIST_ITEMS = [
  "Identity matches",
  "Business/profile details match",
  "Documents are readable",
  "Bank details match (where applicable)",
  "Required documents present",
];

const ENTITY_TYPE_LABEL = { merchant: "Merchant", customer: "Customer", employee: "Employee" } as const;

const HISTORY_ICON = {
  submitted: FileEdit,
  review_started: Clock,
  note_added: FileEdit,
  approved: CircleCheck,
  rejected: CircleX,
  resubmission_requested: ShieldCheck,
} as const;

export function KycReviewWorkspace({ reviewId }: { reviewId: string }) {
  const review = useAdminKycReview(reviewId);
  const merchant = useAdminMerchant(review?.entityType === "merchant" ? review.entityId : undefined);
  const customer = useAdminCustomer(review?.entityType === "customer" ? review.entityId : undefined);
  const employee = useAdminEmployee(review?.entityType === "employee" ? review.entityId : undefined);

  const [checked, setChecked] = useState<Record<number, boolean>>({});
  const [noteText, setNoteText] = useState("");
  const [approveOpen, setApproveOpen] = useState(false);
  const [resubmissionOpen, setResubmissionOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);

  if (!review) return null;

  const entityName = merchant?.businessName ?? customer?.name ?? employee?.name ?? review.entityId;
  const entityHref =
    review.entityType === "merchant"
      ? `/merchants/${review.entityId}`
      : review.entityType === "customer"
        ? `/customers/${review.entityId}`
        : `/employees/${review.entityId}`;

  const canStartReview = review.status === "pending";
  const canDecide = review.status === "pending" || review.status === "in_review";

  return (
    <div className="mx-auto flex max-w-7xl min-w-0 flex-col gap-5">
      <div className="flex flex-col gap-3">
        <Link
          href="/kyc"
          className="inline-flex w-fit items-center gap-1 text-[12.5px] font-medium text-text-secondary hover:text-text-primary"
        >
          <ChevronLeft className="size-3.5" />
          Back to KYC &amp; Verification
        </Link>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <Link href={entityHref} className="text-[19px] font-semibold tracking-tight text-text-primary hover:underline">
              {entityName}
            </Link>
            <p className="mt-0.5 text-[12.5px] text-text-muted">
              {ENTITY_TYPE_LABEL[review.entityType]} · {review.entityId} · Review {review.id}
            </p>
            <p className="text-[12.5px] text-text-muted">Submitted {formatDate(review.submittedAt)}</p>
          </div>
          <StatusBadge tone={kycReviewStatusTone[review.status]} className="text-[12px]">
            {KYC_REVIEW_STATUS_LABEL[review.status]}
          </StatusBadge>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)] lg:items-start">
        <div className="flex min-w-0 flex-col gap-4">
          <div className="rounded-lg border border-border bg-surface p-4">
            <h3 className="text-[13.5px] font-semibold text-text-primary">Submitted Documents</h3>
            <ul className="mt-3 flex flex-col divide-y divide-border">
              {review.documents.map((document) => (
                <li key={document.id} className="flex items-center justify-between gap-3 py-2.5">
                  <div className="min-w-0">
                    <p className="truncate text-[13px] font-medium text-text-primary">{document.type}</p>
                    <p className="truncate text-[11.5px] text-text-muted">
                      {document.referenceMasked} · Uploaded {formatDate(document.uploadedAt)}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <StatusBadge tone={kycDocumentCheckTone[document.checkStatus]}>
                      {humanizeSnakeCase(document.checkStatus)}
                    </StatusBadge>
                    <DocumentPreviewDialog document={document} />
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-lg border border-border bg-surface p-4">
            <h3 className="text-[13.5px] font-semibold text-text-primary">Review History</h3>
            <p className="mt-0.5 text-[11px] text-text-muted">Demo workflow history — not a backend audit log.</p>
            <ul className="mt-3 flex flex-col gap-3">
              {review.history.map((event) => {
                const Icon = HISTORY_ICON[event.type];
                return (
                  <li key={event.id} className="flex gap-2.5 text-[12.5px]">
                    <Icon className="mt-0.5 size-3.5 shrink-0 text-text-muted" />
                    <div className="min-w-0">
                      <p className="text-text-primary">{humanizeSnakeCase(event.type)}</p>
                      {event.note && <p className="text-text-secondary">{event.note}</p>}
                      <p className="text-[11px] text-text-muted">{formatDate(event.at.slice(0, 10))}</p>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        <div className="flex min-w-0 flex-col gap-4 lg:sticky lg:top-6">
          <div className="rounded-lg border border-border bg-surface p-4">
            <h3 className="text-[13.5px] font-semibold text-text-primary">Review Checklist</h3>
            <p className="mt-0.5 text-[11px] text-text-muted">Local review aid only — not saved to the record.</p>
            <ul className="mt-3 flex flex-col gap-2">
              {CHECKLIST_ITEMS.map((item, index) => (
                <li key={item}>
                  <label className="flex cursor-pointer items-center gap-2.5 text-[12.5px] text-text-secondary">
                    <input
                      type="checkbox"
                      checked={Boolean(checked[index])}
                      onChange={(event) => setChecked((prev) => ({ ...prev, [index]: event.target.checked }))}
                      className="size-3.5 rounded border-border-strong accent-primary"
                    />
                    {item}
                  </label>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-lg border border-border bg-surface p-4">
            <h3 className="text-[13.5px] font-semibold text-text-primary">Internal Review Notes</h3>
            <p className="mt-0.5 text-[11px] text-text-muted">Internal only — never shown to the merchant/customer.</p>
            {review.notes.length > 0 && (
              <ul className="mt-3 flex flex-col gap-2">
                {review.notes.map((note) => (
                  <li key={note.id} className="rounded-md bg-surface-muted px-2.5 py-2 text-[12px] text-text-secondary">
                    <p>{note.text}</p>
                    <p className="mt-0.5 text-[10.5px] text-text-muted">{formatDate(note.at.slice(0, 10))}</p>
                  </li>
                ))}
              </ul>
            )}
            <div className="mt-3 flex flex-col gap-2">
              <Textarea
                value={noteText}
                onChange={(event) => setNoteText(event.target.value)}
                placeholder="Add an internal note…"
                className="min-h-16 text-[13px]"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-8 w-fit text-[12.5px]"
                disabled={noteText.trim().length === 0}
                onClick={() => {
                  addKycReviewNote(review.id, noteText.trim());
                  setNoteText("");
                  toast.success("Note added");
                }}
              >
                Add Note
              </Button>
            </div>
          </div>

          <div className="rounded-lg border border-border bg-surface p-4">
            <h3 className="text-[13.5px] font-semibold text-text-primary">Decision</h3>
            <div className="mt-3 flex flex-col gap-2">
              {canStartReview && (
                <Button
                  type="button"
                  size="sm"
                  className="h-9 text-[13px]"
                  onClick={() => {
                    startKycReview(review.id);
                    recordAuditEvent({
                      action: "Started KYC Review",
                      entityType: review.entityType,
                      entityId: review.entityId,
                      entityLabel: entityName,
                      changes: [{ field: "Review Status", from: humanizeSnakeCase(review.status), to: "In Review" }],
                    });
                    toast.success("Review started");
                  }}
                >
                  Start Review
                </Button>
              )}
              <Button
                type="button"
                size="sm"
                disabled={!canDecide}
                className="h-9 text-[13px]"
                onClick={() => setApproveOpen(true)}
              >
                Approve
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={!canDecide}
                className="h-9 border-warning/40 text-[13px] text-warning hover:bg-warning/10 hover:text-warning"
                onClick={() => setResubmissionOpen(true)}
              >
                Request Resubmission
              </Button>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                disabled={!canDecide}
                className="h-9 text-[13px]"
                onClick={() => setRejectOpen(true)}
              >
                Reject
              </Button>
            </div>
          </div>
        </div>
      </div>

      <KycDecisionDialog
        open={approveOpen}
        onOpenChange={setApproveOpen}
        title="Confirm Approval"
        description={`${entityName} will be marked Verified once approved.`}
        reasonRequired={false}
        confirmLabel="Confirm Approval"
        confirmVariant="default"
        onConfirm={(note) => {
          approveKycReview(review.id, note || undefined);
          recordAuditEvent({
            action: "Approved KYC Review",
            entityType: review.entityType,
            entityId: review.entityId,
            entityLabel: entityName,
            changes: [{ field: "Review Status", from: humanizeSnakeCase(review.status), to: "Approved" }],
            metadata: note || undefined,
          });
          toast.success("KYC review approved");
        }}
      />
      <KycDecisionDialog
        open={resubmissionOpen}
        onOpenChange={setResubmissionOpen}
        title="Request Resubmission"
        description={`${entityName} will be asked to resubmit documents. Explain what needs to change.`}
        reasonRequired
        reasonLabel="Reason for resubmission"
        confirmLabel="Request Resubmission"
        confirmVariant="default"
        onConfirm={(reason) => {
          requestKycResubmission(review.id, reason);
          recordAuditEvent({
            action: "Requested KYC Resubmission",
            entityType: review.entityType,
            entityId: review.entityId,
            entityLabel: entityName,
            changes: [{ field: "Review Status", from: humanizeSnakeCase(review.status), to: "Resubmission Required" }],
            metadata: reason,
          });
          toast.success("Resubmission requested");
        }}
      />
      <KycDecisionDialog
        open={rejectOpen}
        onOpenChange={setRejectOpen}
        title="Reject Review"
        description={`${entityName} will be marked Rejected. This should be used when the submission cannot be approved.`}
        reasonRequired
        reasonLabel="Reason for rejection"
        confirmLabel="Confirm Rejection"
        confirmVariant="destructive"
        onConfirm={(reason) => {
          rejectKycReview(review.id, reason);
          recordAuditEvent({
            action: "Rejected KYC Review",
            entityType: review.entityType,
            entityId: review.entityId,
            entityLabel: entityName,
            changes: [{ field: "Review Status", from: humanizeSnakeCase(review.status), to: "Rejected" }],
            metadata: reason,
          });
          toast.success("KYC review rejected");
        }}
      />
    </div>
  );
}
