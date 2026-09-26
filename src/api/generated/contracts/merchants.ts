import type { CursorPagination } from "../common";
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
    items: MerchantListItem[];
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
