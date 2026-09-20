import type { CursorPagination, KycSubjectType } from "../common";
export type KycStatus = typeof KycStatus[keyof typeof KycStatus];
export const KycStatus = {
    pending: 'pending',
    in_review: 'in_review',
    approved: 'approved',
    resubmission_required: 'resubmission_required',
    rejected: 'rejected',
} as const;
export type KycDocumentType = typeof KycDocumentType[keyof typeof KycDocumentType];
export const KycDocumentType = {
    pan: 'pan',
    business_registration: 'business_registration',
    shop_photo: 'shop_photo',
    other_business_proof: 'other_business_proof',
    cancelled_cheque: 'cancelled_cheque',
    identity_proof: 'identity_proof',
    address_proof: 'address_proof',
} as const;
export type KycDocumentStatus = typeof KycDocumentStatus[keyof typeof KycDocumentStatus];
export const KycDocumentStatus = {
    pending: 'pending',
    uploaded: 'uploaded',
    verified: 'verified',
    rejected: 'rejected',
} as const;
export interface KycDocument {
    id: string;
    reviewId: string;
    documentType: KycDocumentType;
    maskedReference: string | null;
    originalFilename: string;
    mimeType: string;
    sizeBytes: number;
    uploadedByUserId: string | null;
    status: KycDocumentStatus;
    confirmedAt: string | null;
    createdAt: string;
    updatedAt: string;
}
export type KycReviewSummarySubject = {
    type: KycSubjectType;
    id: string;
    publicId: string;
    name: string;
};
export interface KycReviewSummary {
    id: string;
    subject: KycReviewSummarySubject;
    status: KycStatus;
    submittedByUserId: string | null;
    assignedReviewerUserId: string | null;
    reviewedByUserId: string | null;
    submittedAt: string | null;
    reviewStartedAt: string | null;
    reviewedAt: string | null;
    decisionReason: string | null;
    createdAt: string;
    updatedAt: string;
}
export type KycReviewDetailHistoryItem = {
    id: string;
    action: string;
    actorUserId: string | null;
    changes?: unknown;
    createdAt: string;
};
export type KycReviewDetail = KycReviewSummary & {
    documents: KycDocument[];
    history: KycReviewDetailHistoryItem[];
};
export type CreateMerchantKyc201 = {
    data: KycReviewDetail;
};
export type GetMerchantKyc200 = {
    data: KycReviewDetail;
};
export type CreateCustomerKyc201 = {
    data: KycReviewDetail;
};
export type GetCustomerKyc200 = {
    data: KycReviewDetail;
};
export type CreateEmployeeKyc201 = {
    data: KycReviewDetail;
};
export type GetEmployeeKyc200 = {
    data: KycReviewDetail;
};
export type ListKycReviewsParams = {
    limit?: number;
    cursor?: string;
    status?: KycStatus;
    subjectType?: KycSubjectType;
    search?: string;
    submittedFrom?: string | null;
    submittedTo?: string | null;
};
export type ListKycReviews200Data = {
    items: KycReviewSummary[];
    pagination: CursorPagination;
};
export type ListKycReviews200 = {
    data: ListKycReviews200Data;
};
export type GetKycReview200 = {
    data: KycReviewDetail;
};
export type CreateKycUploadUrlBodyMimeType = typeof CreateKycUploadUrlBodyMimeType[keyof typeof CreateKycUploadUrlBodyMimeType];
export const CreateKycUploadUrlBodyMimeType = {
    'application/pdf': 'application/pdf',
    'image/jpeg': 'image/jpeg',
    'image/png': 'image/png',
} as const;
export type CreateKycUploadUrlBody = {
    documentType: KycDocumentType;
    filename: string;
    mimeType: CreateKycUploadUrlBodyMimeType;
    sizeBytes: number;
};
export type CreateKycUploadUrl201DataUploadMethod = typeof CreateKycUploadUrl201DataUploadMethod[keyof typeof CreateKycUploadUrl201DataUploadMethod];
export const CreateKycUploadUrl201DataUploadMethod = {
    PUT: 'PUT',
} as const;
export type CreateKycUploadUrl201DataUploadHeaders = {
    [key: string]: string;
};
export type CreateKycUploadUrl201DataUpload = {
    url: string;
    method: CreateKycUploadUrl201DataUploadMethod;
    headers: CreateKycUploadUrl201DataUploadHeaders;
    expiresInSeconds: number;
};
export type CreateKycUploadUrl201Data = {
    document: KycDocument;
    upload: CreateKycUploadUrl201DataUpload;
};
export type CreateKycUploadUrl201 = {
    data: CreateKycUploadUrl201Data;
};
export type ConfirmKycDocument200 = {
    data: KycDocument;
};
export type CreateKycViewUrl200Data = {
    url: string;
    expiresInSeconds: number;
};
export type CreateKycViewUrl200 = {
    data: CreateKycViewUrl200Data;
};
export type SubmitKycReview200 = {
    data: KycReviewDetail;
};
export type ApproveKycReview200 = {
    data: KycReviewDetail;
};
export type RejectKycReviewBody = {
    reason: string;
};
export type RejectKycReview200 = {
    data: KycReviewDetail;
};
export type RequestResubmissionKycReviewBody = {
    reason: string;
};
export type RequestResubmissionKycReview200 = {
    data: KycReviewDetail;
};
