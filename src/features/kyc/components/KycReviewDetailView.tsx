"use client";

import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { normalizeApiError } from "@/api/http/errors";
import { useKycReview } from "@/features/kyc/hooks/useKyc";
import { kycStatusLabels, kycStatusTones, kycSubjectLabels } from "@/features/kyc/utils/metadata";
import { KycDocumentList } from "@/features/kyc/components/KycDocumentList";
import { KycReviewActions } from "@/features/kyc/components/KycReviewActions";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { DetailSection } from "@/components/entity/DetailSection";
import { KeyValueRow } from "@/components/entity/KeyValueRow";
import { Skeleton } from "@/components/ui/skeleton";
import { formatTimestamp } from "@/shared/utils/date";
import { humanizeSnakeCase } from "@/lib/format";

export function KycReviewDetailView({ reviewId }: { reviewId: string }) {
  const query = useKycReview(reviewId);
  if (query.isPending) return <div className="mx-auto flex max-w-7xl flex-col gap-4"><Skeleton className="h-24" /><Skeleton className="h-64" /></div>;
  if (query.isError) return <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-8 text-center text-[13px] text-destructive">{normalizeApiError(query.error).message}</div>;
  const review = query.data.data;
  return <div className="mx-auto flex max-w-7xl min-w-0 flex-col gap-5"><Link href="/kyc" className="inline-flex w-fit items-center gap-1 text-[12.5px] font-medium text-text-secondary hover:text-text-primary"><ChevronLeft className="size-3.5" />Back to KYC &amp; Verification</Link><div className="flex flex-wrap items-start justify-between gap-3"><div><Link href={`/${review.subject.type}s/${review.subject.id}`} className="text-[19px] font-semibold text-text-primary hover:underline">{review.subject.name}</Link><p className="mt-0.5 text-[12.5px] text-text-muted">{kycSubjectLabels[review.subject.type]} · {review.subject.publicId} · Review {review.id}</p></div><div className="flex items-center gap-2"><StatusBadge tone={kycStatusTones[review.status]}>{kycStatusLabels[review.status]}</StatusBadge><KycReviewActions review={review} /></div></div><div className="grid gap-4 lg:grid-cols-2"><DetailSection title="Review Metadata"><KeyValueRow label="Created" value={formatTimestamp(review.createdAt)} /><KeyValueRow label="Submitted" value={formatTimestamp(review.submittedAt)} /><KeyValueRow label="Review Started" value={formatTimestamp(review.reviewStartedAt)} /><KeyValueRow label="Reviewed" value={formatTimestamp(review.reviewedAt)} /><KeyValueRow label="Decision Reason" value={review.decisionReason ?? "Not provided"} /></DetailSection><DetailSection title="Review Ownership"><KeyValueRow label="Submitter User ID" value={review.submittedByUserId ?? "Not recorded"} /><KeyValueRow label="Assigned Reviewer User ID" value={review.assignedReviewerUserId ?? "Not assigned"} /><KeyValueRow label="Final Reviewer User ID" value={review.reviewedByUserId ?? "Not recorded"} /></DetailSection></div><DetailSection title="Private Documents"><KycDocumentList documents={review.documents} /></DetailSection><DetailSection title="Review History">{review.history.length ? <ul className="flex flex-col divide-y divide-border">{review.history.map((event) => <li key={event.id} className="flex items-start justify-between gap-3 py-2.5 text-[12.5px]"><div><p className="font-medium text-text-primary">{humanizeSnakeCase(event.action.replace("kyc.", ""))}</p><p className="text-[11.5px] text-text-muted">Actor: {event.actorUserId ?? "System"}</p></div><span className="text-[11px] text-text-muted">{formatTimestamp(event.createdAt)}</span></li>)}</ul> : <p className="text-[12px] text-text-muted">No review history recorded.</p>}</DetailSection></div>;
}
