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
export type GlobalPaymentType = typeof GlobalPaymentType[keyof typeof GlobalPaymentType];
export const GlobalPaymentType = {
    customer_collection: 'customer_collection',
    merchant_activation_fee: 'merchant_activation_fee',
    merchant_subscription: 'merchant_subscription',
} as const;
export interface GlobalPaymentListItem {
    id: string;
    type: GlobalPaymentType;
    amountPaise: MoneyPaise;
    status: string;
    merchantId: string;
    customerId: string | null;
    planId: string | null;
    subscriptionId: string | null;
    method: string | null;
    source: string;
    provider: string | null;
    providerReference: string | null;
    paidAt: string | null;
    createdAt: string;
}
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
export type ListAllPaymentsParams = {
    limit?: number;
    cursor?: string;
    type?: ListAllPaymentsType;
    status?: string;
    merchantId?: string;
    customerId?: string;
    from?: string;
    to?: string;
};
export type ListAllPaymentsType = typeof ListAllPaymentsType[keyof typeof ListAllPaymentsType];
export const ListAllPaymentsType = {
    customer_collection: 'customer_collection',
    merchant_activation_fee: 'merchant_activation_fee',
    merchant_subscription: 'merchant_subscription',
} as const;
export type ListAllPayments200Data = {
    items: GlobalPaymentListItem[];
    pagination: CursorPagination;
};
export type ListAllPayments200 = {
    data: ListAllPayments200Data;
};
