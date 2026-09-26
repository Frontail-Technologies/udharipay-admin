import type { MoneyPaise } from "../common";
export type CreateRazorpayOrderBodyAllocationsItem = {
    installmentId: string;
    amountPaise: MoneyPaise;
};
export type CreateRazorpayOrderBody = {
    idempotencyKey: string;
    allocations: CreateRazorpayOrderBodyAllocationsItem[];
};
export type CreateRazorpayOrder201DataCurrency = typeof CreateRazorpayOrder201DataCurrency[keyof typeof CreateRazorpayOrder201DataCurrency];
export const CreateRazorpayOrder201DataCurrency = {
    INR: 'INR',
} as const;
export type CreateRazorpayOrder201Data = {
    razorpayKeyId: string;
    razorpayOrderId: string;
    amountPaise: MoneyPaise;
    currency: CreateRazorpayOrder201DataCurrency;
    paymentRequestId: string;
};
export type CreateRazorpayOrder201 = {
    data: CreateRazorpayOrder201Data;
};
export type VerifyRazorpayPaymentBody = {
    paymentRequestId: string;
    razorpayPaymentId: string;
    razorpayOrderId: string;
    razorpaySignature: string;
};
export type VerifyRazorpayPayment200Data = {
    paymentRequestId: string;
    status: string;
    paymentId: string | null;
};
export type VerifyRazorpayPayment200 = {
    data: VerifyRazorpayPayment200Data;
};
export type ReceiveRazorpayWebhookBodyPayloadPaymentEntityStatus = typeof ReceiveRazorpayWebhookBodyPayloadPaymentEntityStatus[keyof typeof ReceiveRazorpayWebhookBodyPayloadPaymentEntityStatus];
export const ReceiveRazorpayWebhookBodyPayloadPaymentEntityStatus = {
    created: 'created',
    authorized: 'authorized',
    captured: 'captured',
    refunded: 'refunded',
    failed: 'failed',
} as const;
export type ReceiveRazorpayWebhookBodyPayloadPaymentEntity = {
    id: string;
    order_id: string;
    amount: number;
    currency: string;
    status: ReceiveRazorpayWebhookBodyPayloadPaymentEntityStatus;
    method?: string | null;
    captured_at?: number | null;
    [key: string]: unknown;
};
export type ReceiveRazorpayWebhookBodyPayloadPayment = {
    entity: ReceiveRazorpayWebhookBodyPayloadPaymentEntity;
};
export type ReceiveRazorpayWebhookBodyPayloadTokenEntity = {
    [key: string]: unknown;
};
export type ReceiveRazorpayWebhookBodyPayloadToken = {
    entity: ReceiveRazorpayWebhookBodyPayloadTokenEntity;
};
export type ReceiveRazorpayWebhookBodyPayloadInvoiceEntity = {
    [key: string]: unknown;
};
export type ReceiveRazorpayWebhookBodyPayloadInvoice = {
    entity: ReceiveRazorpayWebhookBodyPayloadInvoiceEntity;
};
export type ReceiveRazorpayWebhookBodyPayload = {
    payment?: ReceiveRazorpayWebhookBodyPayloadPayment;
    token?: ReceiveRazorpayWebhookBodyPayloadToken;
    invoice?: ReceiveRazorpayWebhookBodyPayloadInvoice;
    [key: string]: unknown;
};
export type ReceiveRazorpayWebhookBody = {
    event: string;
    payload: ReceiveRazorpayWebhookBodyPayload;
    [key: string]: unknown;
};
export type ReceiveRazorpayWebhook200Data = {
    accepted: boolean;
};
export type ReceiveRazorpayWebhook200 = {
    data: ReceiveRazorpayWebhook200Data;
};
