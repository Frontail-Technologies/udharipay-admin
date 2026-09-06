import { addDays, toIsoDate, DEMO_TODAY } from "./seededRandom";
import { merchants } from "./merchants";
import { customers } from "./customers";
import { employees } from "./employees";
import type { KycStatus } from "./types";
import type {
  KycDocumentCheckStatus,
  KycEntityType,
  KycHistoryEvent,
  KycReview,
  KycReviewStatus,
} from "./types";

/**
 * The review's initial status is derived from the entity's own seeded KYC
 * field so the two start in agreement — from here on, the review is the
 * source of truth (see kycStatusMapping.ts) and the entity's displayed KYC
 * status is read back FROM the review via the canonical selectors, not the
 * other way around.
 */
function initialReviewStatus(kycStatus: KycStatus): KycReviewStatus {
  switch (kycStatus) {
    case "verified":
      return "approved";
    case "pending":
      return "pending";
    case "action_required":
      return "resubmission_required";
    case "rejected":
      return "rejected";
  }
}

function buildHistory(status: KycReviewStatus, submittedAt: string, indexSeed: number): KycHistoryEvent[] {
  const history: KycHistoryEvent[] = [
    { id: `hist-${indexSeed}-1`, type: "submitted", at: submittedAt },
  ];
  if (status === "pending") return history;

  const reviewStartedAt = toIsoDate(addDays(new Date(`${submittedAt}T00:00:00`), 1));
  history.push({ id: `hist-${indexSeed}-2`, type: "review_started", at: reviewStartedAt });

  const decisionAt = toIsoDate(addDays(new Date(`${submittedAt}T00:00:00`), 2));
  if (status === "approved") {
    history.push({ id: `hist-${indexSeed}-3`, type: "approved", at: decisionAt });
  } else if (status === "rejected") {
    history.push({
      id: `hist-${indexSeed}-3`,
      type: "rejected",
      at: decisionAt,
      note: "Submitted documents did not match records on file.",
    });
  } else if (status === "resubmission_required") {
    history.push({
      id: `hist-${indexSeed}-3`,
      type: "resubmission_requested",
      at: decisionAt,
      note: "Document image was unreadable — please resubmit a clearer copy.",
    });
  }
  return history;
}

function documentCheckStatusFor(status: KycReviewStatus, isFirstDoc: boolean): KycDocumentCheckStatus {
  if (status === "pending") return "not_reviewed";
  if (status === "approved") return "accepted";
  if ((status === "rejected" || status === "resubmission_required") && isFirstDoc) return "issue_found";
  return status === "in_review" ? "not_reviewed" : "accepted";
}

let reviewCounter = 0;

function buildReview(params: {
  entityType: KycEntityType;
  entityId: string;
  verificationType: string;
  assignedEmployeeName: string | null;
  kycStatus: KycStatus;
  documents: { type: string; referenceMasked: string }[];
  submittedOffsetDays: number;
}): KycReview {
  reviewCounter += 1;
  const status = initialReviewStatus(params.kycStatus);
  const submittedAt = toIsoDate(addDays(DEMO_TODAY, -params.submittedOffsetDays));

  return {
    id: `KYC-${2041 + reviewCounter * 3}`,
    entityType: params.entityType,
    entityId: params.entityId,
    verificationType: params.verificationType,
    submittedAt,
    assignedEmployeeName: params.assignedEmployeeName,
    status,
    reviewerName: status === "pending" ? null : "Admin User",
    documents: params.documents.map((doc, docIndex) => ({
      id: `${params.entityId}-doc-${docIndex}`,
      type: doc.type,
      referenceMasked: doc.referenceMasked,
      uploadedAt: submittedAt,
      checkStatus: documentCheckStatusFor(status, docIndex === 0),
    })),
    notes: [],
    history: buildHistory(status, submittedAt, reviewCounter),
  };
}

const merchantReviews: KycReview[] = merchants.map((merchant, index) =>
  buildReview({
    entityType: "merchant",
    entityId: merchant.id,
    verificationType: "KYB — Business Verification",
    assignedEmployeeName: merchant.assignedEmployeeName,
    kycStatus: merchant.kycStatus,
    submittedOffsetDays: 6 + index * 9,
    documents: [
      { type: "Business PAN", referenceMasked: merchant.businessPanMasked },
      { type: "GST Certificate", referenceMasked: merchant.gstMasked },
      { type: "Bank Proof", referenceMasked: merchant.bank.accountMasked },
      { type: "Owner Identity", referenceMasked: merchant.businessPanMasked },
    ],
  }),
);

const customerReviews: KycReview[] = customers.map((customer, index) => {
  const merchant = merchants.find((m) => m.id === customer.merchantId);
  return buildReview({
    entityType: "customer",
    entityId: customer.id,
    verificationType: "Identity Verification",
    assignedEmployeeName: merchant?.assignedEmployeeName ?? null,
    kycStatus: customer.verificationStatus,
    submittedOffsetDays: 4 + (index % 20),
    documents: [
      { type: "PAN", referenceMasked: customer.panMasked },
      { type: customer.idType, referenceMasked: customer.idReferenceMasked },
    ],
  });
});

const employeeReviews: KycReview[] = employees.map((employee, index) =>
  buildReview({
    entityType: "employee",
    entityId: employee.id,
    verificationType: "Employee KYC",
    assignedEmployeeName: null,
    kycStatus: employee.kycStatus,
    submittedOffsetDays: 10 + index * 7,
    documents: [
      { type: "PAN", referenceMasked: employee.panMasked },
      { type: "Identity Proof", referenceMasked: employee.idProofMasked },
      { type: "Address Proof", referenceMasked: employee.idProofMasked },
    ],
  }),
);

export const kycReviews: KycReview[] = [...merchantReviews, ...customerReviews, ...employeeReviews];

export function getKycReviewById(reviewId: string): KycReview | undefined {
  return kycReviews.find((review) => review.id === reviewId);
}

export function getKycReviewForEntity(entityType: KycEntityType, entityId: string): KycReview | undefined {
  return kycReviews.find((review) => review.entityType === entityType && review.entityId === entityId);
}
