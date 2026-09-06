"use client";

import Link from "next/link";
import { FileCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { ComingSoonPanel } from "@/components/entity/EntityTabs";
import { useAdminKycReviewForEntity } from "@/hooks/useAdminEntities";
import { kycReviewStatusTone, kycDocumentCheckTone } from "@/data/admin/statusTones";
import { KYC_REVIEW_STATUS_LABEL, type KycEntityType } from "@/data/admin";
import { formatDate, humanizeSnakeCase } from "@/lib/format";

/**
 * Shared "KYC & Documents" tab content for Merchant/Customer/Employee
 * detail pages — reads the same centralized KYC queue every review-list
 * screen reads, so an entity's tab and the queue can never disagree.
 */
export function EntityKycTab({ entityType, entityId }: { entityType: KycEntityType; entityId: string }) {
  const review = useAdminKycReviewForEntity(entityType, entityId);

  if (!review) return <ComingSoonPanel label="No KYC review on file" />;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-surface p-4">
        <div className="min-w-0">
          <p className="text-[13.5px] font-semibold text-text-primary">{review.id}</p>
          <p className="text-[11.5px] text-text-muted">
            {review.verificationType} · Submitted {formatDate(review.submittedAt)}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <StatusBadge tone={kycReviewStatusTone[review.status]}>
            {KYC_REVIEW_STATUS_LABEL[review.status]}
          </StatusBadge>
          <Button asChild size="sm" variant="outline" className="h-8 text-[12.5px]">
            <Link href={`/kyc/${review.id}`}>Open Review</Link>
          </Button>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-surface p-4">
        <h3 className="text-[13px] font-semibold text-text-primary">Documents</h3>
        <ul className="mt-2.5 flex flex-col divide-y divide-border">
          {review.documents.map((document) => (
            <li key={document.id} className="flex items-center justify-between gap-3 py-2 text-[12.5px]">
              <div className="flex min-w-0 items-center gap-2.5">
                <FileCheck className="size-4 shrink-0 text-text-muted" />
                <div className="min-w-0">
                  <p className="truncate text-text-primary">{document.type}</p>
                  <p className="truncate text-[11px] text-text-muted">{document.referenceMasked}</p>
                </div>
              </div>
              <StatusBadge tone={kycDocumentCheckTone[document.checkStatus]}>
                {humanizeSnakeCase(document.checkStatus)}
              </StatusBadge>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
