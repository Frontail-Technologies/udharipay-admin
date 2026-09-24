import type { CursorPagination, MandateMethod, MandateStatus, MoneyPaise, PlanFrequency } from "../common";
export type MandateAttemptStatus = typeof MandateAttemptStatus[keyof typeof MandateAttemptStatus];
export const MandateAttemptStatus = {
    pending: 'pending',
    submitted: 'submitted',
    successful: 'successful',
    failed: 'failed',
    cancelled: 'cancelled',
} as const;
export interface Mandate {
    id: string;
    publicId: string;
    merchantId: string;
    customerId: string;
    planId: string | null;
    provider: string | null;
    method: MandateMethod;
    status: MandateStatus;
    providerReference: string | null;
    authorizedAt: string | null;
    activatedAt: string | null;
    expiresAt: string | null;
    maxAmountPaise: MoneyPaise | null;
    createdAt: string;
    updatedAt: string;
}
export type MandateDetailPlanTerms = {
    frequency: PlanFrequency;
    numberOfCollections: number;
    firstDueDate: string;
    installmentAmountPaise: MoneyPaise;
    originalAmountPaise: MoneyPaise;
} | null;
export type MandateDetail = Mandate & {
    planTerms: MandateDetailPlanTerms;
};
export interface MandateAttempt {
    id: string;
    mandateId: string;
    planId: string | null;
    installmentId: string | null;
    amountPaise: MoneyPaise | null;
    status: MandateAttemptStatus;
    provider: string | null;
    providerReference: string | null;
    failureCode: string | null;
    failureReason: string | null;
    retryStatus: string | null;
    nextRetryAt: string | null;
    attemptedAt: string;
    createdAt: string;
    updatedAt: string;
}
export type MandateAuthorizationSessionStatus = typeof MandateAuthorizationSessionStatus[keyof typeof MandateAuthorizationSessionStatus];
export const MandateAuthorizationSessionStatus = {
    created: 'created',
    authorized: 'authorized',
    failed: 'failed',
    expired: 'expired',
} as const;
export interface MandateAuthorizationSession {
    status: MandateAuthorizationSessionStatus;
    mandateStatus: MandateStatus;
    authorizationUrl: string | null;
    expiresAt: string;
    authorizedAt: string | null;
    failureReason: string | null;
}
export type MandateAttemptContextMandate = {
    id: string;
    publicId: string;
    method: MandateMethod;
    status: MandateStatus;
};
export type MandateAttemptContextCustomer = {
    id: string;
    name: string;
    phone: string;
};
export type MandateAttemptContextMerchant = {
    id: string;
    businessName: string;
};
export type MandateAttemptContextInstallment = {
    id: string;
    installmentNumber: number;
    dueDate: string;
} | null;
export interface MandateAttemptContext {
    id: string;
    status: MandateAttemptStatus;
    amountPaise: MoneyPaise | null;
    failureCode: string | null;
    failureReason: string | null;
    providerReference: string | null;
    retryStatus: string | null;
    nextRetryAt: string | null;
    attemptedAt: string;
    mandate: MandateAttemptContextMandate;
    customer: MandateAttemptContextCustomer;
    merchant: MandateAttemptContextMerchant;
    planId: string | null;
    installment: MandateAttemptContextInstallment;
}
export type CreateMandateBody = {
    method: MandateMethod;
    planId?: string | null;
    maxAmountPaise?: string | null;
    expiresAt?: string | null;
    provider?: string | null;
    providerReference?: string | null;
};
export type CreateMandate201 = {
    data: Mandate;
};
export type ListCustomerMandatesParams = {
    limit?: number;
    cursor?: string;
    status?: MandateStatus;
};
export type ListCustomerMandates200Data = {
    items: Mandate[];
    pagination: CursorPagination;
};
export type ListCustomerMandates200 = {
    data: ListCustomerMandates200Data;
};
export type GetMandate200 = {
    data: MandateDetail;
};
export type ListMandateAttemptsParams = {
    limit?: number;
    cursor?: string;
};
export type ListMandateAttempts200Data = {
    items: MandateAttempt[];
    pagination: CursorPagination;
};
export type ListMandateAttempts200 = {
    data: ListMandateAttempts200Data;
};
export type RequestMandateAuthorization201 = {
    data: MandateAuthorizationSession;
};
export type GetMandateAuthorization200 = {
    data: MandateAuthorizationSession;
};
export type GetMandateHistory200DataItemsItem = {
    type: string;
    occurredAt: string;
    amountPaise: MoneyPaise | null;
    note: string | null;
};
export type GetMandateHistory200Data = {
    items: GetMandateHistory200DataItemsItem[];
};
export type GetMandateHistory200 = {
    data: GetMandateHistory200Data;
};
export type ListMandateAttemptContextsParams = {
    limit?: number;
    cursor?: string;
    status?: ListMandateAttemptContextsStatus;
};
export type ListMandateAttemptContextsStatus = typeof ListMandateAttemptContextsStatus[keyof typeof ListMandateAttemptContextsStatus];
export const ListMandateAttemptContextsStatus = {
    pending: 'pending',
    submitted: 'submitted',
    successful: 'successful',
    failed: 'failed',
    cancelled: 'cancelled',
} as const;
export type ListMandateAttemptContexts200Data = {
    items: MandateAttemptContext[];
    pagination: CursorPagination;
};
export type ListMandateAttemptContexts200 = {
    data: ListMandateAttemptContexts200Data;
};
export type GetMandateAttemptContext200 = {
    data: MandateAttemptContext;
};
