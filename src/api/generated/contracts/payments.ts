import type { CursorPagination, MoneyPaise } from "../common";
export type PaymentMethod = typeof PaymentMethod[keyof typeof PaymentMethod];
export const PaymentMethod = {
    cash: 'cash',
    upi: 'upi',
    bank_transfer: 'bank_transfer',
    mandate: 'mandate',
    card: 'card',
    other: 'other',
} as const;
export type PaymentSource = typeof PaymentSource[keyof typeof PaymentSource];
export const PaymentSource = {
    provider: 'provider',
    manual: 'manual',
    system_import: 'system_import',
} as const;
export type PaymentStatus = typeof PaymentStatus[keyof typeof PaymentStatus];
export const PaymentStatus = {
    pending: 'pending',
    successful: 'successful',
    failed: 'failed',
    reversed: 'reversed',
} as const;
export interface PaymentListItem {
    id: string;
    publicId: string;
    merchantId: string;
    customerId: string;
    planId: string;
    amountPaise: MoneyPaise;
    method: PaymentMethod;
    source: PaymentSource;
    status: PaymentStatus;
    provider: string | null;
    providerReference: string | null;
    paidAt: string | null;
    createdAt: string;
    updatedAt: string;
}
export type PaymentDetailAllocationsItem = {
    id: string;
    installmentId: string;
    installmentNumber: number;
    dueDate: string;
    amountPaise: MoneyPaise;
    createdAt: string;
};
export type PaymentDetail = PaymentListItem & {
    allocations: PaymentDetailAllocationsItem[];
};
export type ListPlanPaymentsParams = {
    limit?: number;
    cursor?: string;
};
export type ListPlanPayments200Data = {
    items: PaymentListItem[];
    pagination: CursorPagination;
};
export type ListPlanPayments200 = {
    data: ListPlanPayments200Data;
};
export type GetPayment200 = {
    data: PaymentDetail;
};
