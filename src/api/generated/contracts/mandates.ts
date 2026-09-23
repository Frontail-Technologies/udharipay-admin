import type { CursorPagination, MoneyPaise } from "../common";
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
    attemptedAt: string;
    createdAt: string;
    updatedAt: string;
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
    data: Mandate;
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
