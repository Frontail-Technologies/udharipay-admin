"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import type { KycReviewDetail } from "@/api/generated/contracts/kyc";
import { useApproveKyc, useRejectKyc, useRequestKycResubmission } from "@/features/kyc/hooks/useKyc";
import { KycDecisionDialog } from "@/features/kyc/components/KycDecisionDialog";
import { Button } from "@/components/ui/button";
import { useConfirm } from "@/shared/hooks/useConfirm";
import { normalizeApiError } from "@/api/http/errors";
import { toast } from "sonner";

export function KycReviewActions({ review }: { review: KycReviewDetail }) {
  const confirm = useConfirm();
  const approve = useApproveKyc();
  const reject = useRejectKyc();
  const resubmission = useRequestKycResubmission();
  const [dialog, setDialog] = useState<"reject" | "resubmission" | null>(null);
  if (review.status !== "in_review") return null;
  const approveReview = async () => { const accepted = await confirm({ title: "Approve KYC review?", description: `${review.subject.name} will be marked approved.`, confirmLabel: "Approve" }); if (!accepted) return; try { await approve.mutateAsync({ reviewId: review.id, input: undefined }); } catch (error) { toast.error(normalizeApiError(error).message); } };
  return <div className="flex flex-wrap gap-2"><Button type="button" size="sm" className="h-8 text-[12.5px]" disabled={approve.isPending} onClick={() => void approveReview()}>{approve.isPending && <Loader2 className="size-3.5 animate-spin" />}Approve</Button><Button type="button" variant="outline" size="sm" className="h-8 border-warning/40 text-[12.5px] text-warning" onClick={() => setDialog("resubmission")}>Request Resubmission</Button><Button type="button" variant="destructive" size="sm" className="h-8 text-[12.5px]" onClick={() => setDialog("reject")}>Reject</Button><KycDecisionDialog open={dialog === "reject"} onOpenChange={(open) => { if (!open) setDialog(null); }} title="Reject KYC Review" description="Provide the canonical rejection reason." confirmLabel="Reject Review" destructive isPending={reject.isPending} onConfirm={(reason) => reject.mutateAsync({ reviewId: review.id, input: { reason } }).then(() => undefined)} /><KycDecisionDialog open={dialog === "resubmission"} onOpenChange={(open) => { if (!open) setDialog(null); }} title="Request Resubmission" description="Explain which evidence must be resubmitted." confirmLabel="Request Resubmission" isPending={resubmission.isPending} onConfirm={(reason) => resubmission.mutateAsync({ reviewId: review.id, input: { reason } }).then(() => undefined)} /></div>;
}
