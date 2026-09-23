import type { KycDocument, KycReviewDetail, KycReviewSummary } from "@/api/generated/contracts/kyc";

export const kycDocument: KycDocument = { id: "11111111-1111-4111-8111-111111111111", reviewId: "22222222-2222-4222-8222-222222222222", documentType: "pan", maskedReference: null, originalFilename: "pan.pdf", mimeType: "application/pdf", sizeBytes: 2048, uploadedByUserId: null, status: "uploaded", confirmedAt: "2026-09-23T08:30:00.000Z", createdAt: "2026-09-23T08:00:00.000Z", updatedAt: "2026-09-23T08:30:00.000Z" };

export const kycReview: KycReviewDetail = { id: kycDocument.reviewId, subject: { type: "merchant", id: "33333333-3333-4333-8333-333333333333", publicId: "MER-1001", name: "Amit Traders" }, status: "pending", submittedByUserId: null, assignedReviewerUserId: null, reviewedByUserId: null, submittedAt: null, reviewStartedAt: null, reviewedAt: null, decisionReason: null, createdAt: "2026-09-23T08:00:00.000Z", updatedAt: "2026-09-23T08:00:00.000Z", documents: [], history: [] };

export const kycSummary: KycReviewSummary = { ...kycReview };
