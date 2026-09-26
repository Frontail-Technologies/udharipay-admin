export type MoneyPaise = string;
export interface CursorPagination {
    nextCursor: string | null;
}
export type UserStatus = typeof UserStatus[keyof typeof UserStatus];
export const UserStatus = {
    active: 'active',
    inactive: 'inactive',
    suspended: 'suspended',
} as const;
export type PlanFrequency = typeof PlanFrequency[keyof typeof PlanFrequency];
export const PlanFrequency = {
    daily: 'daily',
    weekly: 'weekly',
    monthly: 'monthly',
} as const;
export type MandateMethod = typeof MandateMethod[keyof typeof MandateMethod];
export const MandateMethod = {
    upi_autopay: 'upi_autopay',
    enach: 'enach',
} as const;
export type MandateStatus = typeof MandateStatus[keyof typeof MandateStatus];
export const MandateStatus = {
    pending: 'pending',
    authorization_pending: 'authorization_pending',
    active: 'active',
    paused: 'paused',
    failed: 'failed',
    cancelled: 'cancelled',
    expired: 'expired',
} as const;
export type KycSubjectType = typeof KycSubjectType[keyof typeof KycSubjectType];
export const KycSubjectType = {
    merchant: 'merchant',
    customer: 'customer',
    employee: 'employee',
} as const;
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
    customer_photo: 'customer_photo',
    employee_photo: 'employee_photo',
} as const;
export type KycDocumentStatus = typeof KycDocumentStatus[keyof typeof KycDocumentStatus];
export const KycDocumentStatus = {
    pending: 'pending',
    uploaded: 'uploaded',
    verified: 'verified',
    rejected: 'rejected',
} as const;
export type SubscriptionInvoiceStatus = typeof SubscriptionInvoiceStatus[keyof typeof SubscriptionInvoiceStatus];
export const SubscriptionInvoiceStatus = {
    pending: 'pending',
    paid: 'paid',
    failed: 'failed',
    void: 'void',
} as const;
export type ApiErrorError = {
    code: string;
    message: string;
    details?: unknown;
};
export interface ApiError {
    error: ApiErrorError;
}
export type IdentityDocumentType = typeof IdentityDocumentType[keyof typeof IdentityDocumentType];
export const IdentityDocumentType = {
    aadhaar: 'aadhaar',
    pan: 'pan',
    voter_id: 'voter_id',
    driving_licence: 'driving_licence',
    passport: 'passport',
    other: 'other',
} as const;
export interface IdentityProfile {
    panMasked: string | null;
    idType: IdentityDocumentType | null;
    idReferenceMasked: string | null;
    updatedAt: string | null;
}
