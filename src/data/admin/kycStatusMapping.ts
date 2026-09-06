import type { KycReviewStatus, KycStatus } from "./types";

/**
 * The ONE place review status maps to an entity's displayed KYC status.
 * Once a KYC review exists for an entity, this mapping — not the entity's
 * own seeded `kycStatus`/`verificationStatus` field — is what the canonical
 * `useAdminMerchant`/`useAdminCustomer`/`useAdminEmployee` selectors show.
 *
 *   Approved                 -> Verified
 *   Pending / In Review      -> Pending
 *   Resubmission Required    -> Action Required
 *   Rejected                 -> Rejected
 */
export function reviewStatusToEntityKyc(reviewStatus: KycReviewStatus): KycStatus {
  switch (reviewStatus) {
    case "approved":
      return "verified";
    case "resubmission_required":
      return "action_required";
    case "rejected":
      return "rejected";
    case "pending":
    case "in_review":
      return "pending";
  }
}

export const KYC_REVIEW_STATUS_LABEL: Record<KycReviewStatus, string> = {
  pending: "Pending",
  in_review: "In Review",
  approved: "Approved",
  rejected: "Rejected",
  resubmission_required: "Resubmission Required",
};
