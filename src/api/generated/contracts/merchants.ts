import type { CursorPagination, KycDocumentStatus, KycDocumentType, KycStatus, MoneyPaise, SubscriptionInvoiceStatus } from "../common";
export type MerchantStatus = typeof MerchantStatus[keyof typeof MerchantStatus];
export const MerchantStatus = {
    draft: 'draft',
    in_review: 'in_review',
    active: 'active',
    payment_due: 'payment_due',
    grace: 'grace',
    restricted: 'restricted',
    suspended: 'suspended',
} as const;
export interface MerchantListItem {
    id: string;
    publicId: string;
    businessName: string;
    ownerName: string;
    businessCategory: string;
    phone: string;
    email: string | null;
    city: string;
    state: string;
    status: MerchantStatus;
    createdAt: string;
}
export type MerchantApplicationState = typeof MerchantApplicationState[keyof typeof MerchantApplicationState];
export const MerchantApplicationState = {
    draft: 'draft',
    under_review: 'under_review',
    resubmission_required: 'resubmission_required',
    activation_fee_pending: 'activation_fee_pending',
    activation_fee_paid: 'activation_fee_paid',
    subscription_setup_pending: 'subscription_setup_pending',
    active: 'active',
    rejected: 'rejected',
} as const;
export type MerchantOnboardingStep = typeof MerchantOnboardingStep[keyof typeof MerchantOnboardingStep];
export const MerchantOnboardingStep = {
    business_documents: 'business_documents',
    bank_details: 'bank_details',
    review_verify: 'review_verify',
    plan_activation_fee: 'plan_activation_fee',
    autopay_setup: 'autopay_setup',
    activated: 'activated',
} as const;
export interface MerchantApplicationSummary {
    state: MerchantApplicationState;
    nextStep: MerchantOnboardingStep;
}
export type MerchantListEntry = MerchantListItem & {
    application: MerchantApplicationSummary;
};
export type MerchantAccountsItem = {
    userId: string;
    email: string | null;
    phone: string | null;
    status: string;
    role: string;
    membershipStatus: string;
};
export type Merchant = MerchantListItem & ({
    address: string;
    pincode: string;
    assignedEmployeeId: string | null;
    updatedAt: string;
    accounts?: MerchantAccountsItem[];
});
export type MerchantBankAccountVerificationStatus = typeof MerchantBankAccountVerificationStatus[keyof typeof MerchantBankAccountVerificationStatus];
export const MerchantBankAccountVerificationStatus = {
    unverified: 'unverified',
    verified: 'verified',
    rejected: 'rejected',
} as const;
export type BankAccountType = typeof BankAccountType[keyof typeof BankAccountType];
export const BankAccountType = {
    savings: 'savings',
    current: 'current',
} as const;
export interface MerchantBankAccount {
    merchantId: string;
    accountHolderName: string;
    accountNumberMasked: string | null;
    ifsc: string;
    bankName: string;
    accountType: BankAccountType;
    verificationStatus: MerchantBankAccountVerificationStatus;
    verifiedAt: string | null;
    updatedAt: string;
}
export type MerchantAgreementEvidence = {
    filename: string;
    mimeType: string | null;
    sizeBytes: number | null;
    confirmedAt: string | null;
} | null;
export interface MerchantAgreement {
    agreementVersion: string;
    channel: string;
    acceptedAt: string;
    capturedByRole: string;
    evidence: MerchantAgreementEvidence;
}
export type MerchantApplicationApplication = MerchantApplicationSummary & {
    createdAt: string;
    updatedAt: string;
};
export type MerchantApplicationKycDocumentsItem = {
    id: string;
    documentType: KycDocumentType;
    status: KycDocumentStatus;
    originalFilename: string;
    confirmedAt: string | null;
};
export type MerchantApplicationKyc = {
    status: KycStatus;
    submittedAt: string | null;
    reviewedAt: string | null;
    decisionReason: string | null;
    documents: MerchantApplicationKycDocumentsItem[];
} | null;
export type MerchantApplicationActivationPayment = {
    status: string;
    amountPaise: MoneyPaise;
    method: string | null;
    reference: string | null;
    attemptedAt: string;
} | null;
export type MerchantApplicationActivation = {
    amountPaise: MoneyPaise;
    status: SubscriptionInvoiceStatus;
    dueDate: string;
    paidAt: string | null;
    payment: MerchantApplicationActivationPayment;
} | null;
export type MerchantApplicationSubscription = {
    planCode: string;
    planName: string;
    monthlyAmountPaise: MoneyPaise;
    status: string;
    autoPayStatus: string;
    nextBillingDate: string | null;
    currentPeriodEnd: string;
} | null;
export interface MerchantApplication {
    merchant: Merchant;
    application: MerchantApplicationApplication;
    kyc: MerchantApplicationKyc;
    bank: MerchantBankAccount | null;
    agreement: MerchantAgreement | null;
    activation: MerchantApplicationActivation;
    subscription: MerchantApplicationSubscription;
}
export type BankVerificationDecision = typeof BankVerificationDecision[keyof typeof BankVerificationDecision];
export const BankVerificationDecision = {
    verified: 'verified',
    rejected: 'rejected',
} as const;
export type CreateMerchantBody = {
    businessName: string;
    ownerName: string;
    businessCategory: string;
    phone: string;
    email?: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
    status?: MerchantStatus;
};
export type CreateMerchant201 = {
    data: Merchant;
};
export type ListMerchantsParams = {
    limit?: number;
    cursor?: string;
    status?: MerchantStatus;
    businessCategory?: string;
    search?: string;
};
export type ListMerchants200Data = {
    items: MerchantListEntry[];
    pagination: CursorPagination;
};
export type ListMerchants200 = {
    data: ListMerchants200Data;
};
export type GetMerchant200 = {
    data: Merchant;
};
export type UpdateMerchantBody = {
    businessName?: string;
    ownerName?: string;
    businessCategory?: string;
    phone?: string;
    email?: string | null;
    address?: string;
    city?: string;
    state?: string;
    pincode?: string;
    status?: MerchantStatus;
};
export type UpdateMerchant200 = {
    data: Merchant;
};
export type AssignMerchantBody = {
    assignedEmployeeId: string | null;
};
export type AssignMerchant200 = {
    data: Merchant;
};
export type ProvisionMerchantAccountBody = {
    email?: string;
    phone?: string;
    initialPassword: string;
};
export type ProvisionMerchantAccount201 = {
    data: Merchant;
};
export type GetMerchantApplication200 = {
    data: MerchantApplication;
};
export type GetMerchantBankAccount200Data = {
    bankAccount: MerchantBankAccount | null;
};
export type GetMerchantBankAccount200 = {
    data: GetMerchantBankAccount200Data;
};
export type SetMerchantBankAccountBody = {
    accountHolderName: string;
    accountNumber: string;
    ifsc: string;
    bankName: string;
    accountType: BankAccountType;
};
export type SetMerchantBankAccount200Data = {
    bankAccount: MerchantBankAccount | null;
};
export type SetMerchantBankAccount200 = {
    data: SetMerchantBankAccount200Data;
};
export type DecideMerchantBankAccountBody = {
    decision: BankVerificationDecision;
};
export type DecideMerchantBankAccount200Data = {
    bankAccount: MerchantBankAccount | null;
};
export type DecideMerchantBankAccount200 = {
    data: DecideMerchantBankAccount200Data;
};
export type GetMerchantAgreement200Data = {
    agreement: MerchantAgreement | null;
};
export type GetMerchantAgreement200 = {
    data: GetMerchantAgreement200Data;
};
export type RecordMerchantAgreement201Data = {
    agreement: MerchantAgreement | null;
};
export type RecordMerchantAgreement201 = {
    data: RecordMerchantAgreement201Data;
};
export type CreateMerchantAgreementEvidenceUploadBodyMimeType = typeof CreateMerchantAgreementEvidenceUploadBodyMimeType[keyof typeof CreateMerchantAgreementEvidenceUploadBodyMimeType];
export const CreateMerchantAgreementEvidenceUploadBodyMimeType = {
    'application/pdf': 'application/pdf',
    'image/jpeg': 'image/jpeg',
    'image/png': 'image/png',
} as const;
export type CreateMerchantAgreementEvidenceUploadBody = {
    filename: string;
    mimeType: CreateMerchantAgreementEvidenceUploadBodyMimeType;
    sizeBytes: number;
};
export type CreateMerchantAgreementEvidenceUpload201DataUploadMethod = typeof CreateMerchantAgreementEvidenceUpload201DataUploadMethod[keyof typeof CreateMerchantAgreementEvidenceUpload201DataUploadMethod];
export const CreateMerchantAgreementEvidenceUpload201DataUploadMethod = {
    PUT: 'PUT',
    POST: 'POST',
} as const;
export type CreateMerchantAgreementEvidenceUpload201DataUploadHeaders = {
    [key: string]: string;
};
export type CreateMerchantAgreementEvidenceUpload201DataUploadFields = {
    [key: string]: string;
};
export type CreateMerchantAgreementEvidenceUpload201DataUpload = {
    url: string;
    method: CreateMerchantAgreementEvidenceUpload201DataUploadMethod;
    headers: CreateMerchantAgreementEvidenceUpload201DataUploadHeaders;
    fields?: CreateMerchantAgreementEvidenceUpload201DataUploadFields;
    expiresInSeconds: number;
};
export type CreateMerchantAgreementEvidenceUpload201Data = {
    upload: CreateMerchantAgreementEvidenceUpload201DataUpload;
};
export type CreateMerchantAgreementEvidenceUpload201 = {
    data: CreateMerchantAgreementEvidenceUpload201Data;
};
export type ConfirmMerchantAgreementEvidence200Data = {
    agreement: MerchantAgreement | null;
};
export type ConfirmMerchantAgreementEvidence200 = {
    data: ConfirmMerchantAgreementEvidence200Data;
};
export type CreateMerchantAgreementEvidenceViewUrl200Data = {
    url: string;
    expiresInSeconds: number;
};
export type CreateMerchantAgreementEvidenceViewUrl200 = {
    data: CreateMerchantAgreementEvidenceViewUrl200Data;
};
