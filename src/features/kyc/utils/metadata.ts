import { KycDocumentType, type KycDocumentStatus, type KycStatus } from "@/api/generated/contracts/kyc";
import type { KycSubjectType } from "@/api/generated/common";
import type { StatusBadgeTone } from "@/components/admin/StatusBadge";

export const kycStatusLabels: Record<KycStatus, string> = {
  pending: "Pending",
  in_review: "In Review",
  approved: "Approved",
  resubmission_required: "Resubmission Required",
  rejected: "Rejected",
};

export const kycStatusTones: Record<KycStatus, StatusBadgeTone> = {
  pending: "neutral",
  in_review: "warning",
  approved: "success",
  resubmission_required: "warning",
  rejected: "error",
};

export const kycDocumentStatusTones: Record<KycDocumentStatus, StatusBadgeTone> = {
  pending: "neutral",
  uploaded: "info",
  verified: "success",
  rejected: "error",
};

export const kycSubjectLabels: Record<KycSubjectType, string> = { merchant: "Merchant", customer: "Customer", employee: "Employee" };

export const kycDocumentLabels = {
  pan: "PAN Card",
  business_registration: "Business Registration",
  shop_photo: "Shop Photo",
  other_business_proof: "Other Business Proof",
  cancelled_cheque: "Cancelled Cheque",
  identity_proof: "Identity Proof",
  address_proof: "Address Proof",
} satisfies Record<keyof typeof KycDocumentType, string>;

export const kycDocumentPolicy: Record<KycSubjectType, { type: keyof typeof KycDocumentType; required: boolean }[]> = {
  merchant: [{ type: "pan", required: true }, { type: "business_registration", required: true }, { type: "shop_photo", required: true }, { type: "cancelled_cheque", required: true }, { type: "other_business_proof", required: false }],
  customer: [{ type: "identity_proof", required: true }, { type: "address_proof", required: false }],
  employee: [{ type: "identity_proof", required: true }, { type: "address_proof", required: false }],
};
