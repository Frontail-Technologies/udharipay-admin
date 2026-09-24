import type { MoneyPaise } from "../common";
export type CreateInvoiceRazorpayOrderBody = {
    idempotencyKey: string;
};
export type CreateInvoiceRazorpayOrder201DataCurrency = typeof CreateInvoiceRazorpayOrder201DataCurrency[keyof typeof CreateInvoiceRazorpayOrder201DataCurrency];
export const CreateInvoiceRazorpayOrder201DataCurrency = {
    INR: 'INR',
} as const;
export type CreateInvoiceRazorpayOrder201Data = {
    razorpayKeyId: string;
    razorpayOrderId: string;
    amountPaise: MoneyPaise;
    currency: CreateInvoiceRazorpayOrder201DataCurrency;
    paymentRequestId: string;
};
export type CreateInvoiceRazorpayOrder201 = {
    data: CreateInvoiceRazorpayOrder201Data;
};
export type CreateCustomerActivationRazorpayOrderBody = {
    idempotencyKey: string;
};
export type CreateCustomerActivationRazorpayOrder201DataCurrency = typeof CreateCustomerActivationRazorpayOrder201DataCurrency[keyof typeof CreateCustomerActivationRazorpayOrder201DataCurrency];
export const CreateCustomerActivationRazorpayOrder201DataCurrency = {
    INR: 'INR',
} as const;
export type CreateCustomerActivationRazorpayOrder201Data = {
    razorpayKeyId: string;
    razorpayOrderId: string;
    amountPaise: MoneyPaise;
    currency: CreateCustomerActivationRazorpayOrder201DataCurrency;
    paymentRequestId: string;
};
export type CreateCustomerActivationRazorpayOrder201 = {
    data: CreateCustomerActivationRazorpayOrder201Data;
};
export type VerifyPlatformFeePaymentBody = {
    paymentRequestId: string;
    razorpayPaymentId: string;
    razorpayOrderId: string;
    razorpaySignature: string;
};
export type VerifyPlatformFeePayment200Data = {
    paymentRequestId: string;
    status: string;
};
export type VerifyPlatformFeePayment200 = {
    data: VerifyPlatformFeePayment200Data;
};
export type GetPlatformFeePayment200DataKind = typeof GetPlatformFeePayment200DataKind[keyof typeof GetPlatformFeePayment200DataKind];
export const GetPlatformFeePayment200DataKind = {
    merchant_activation: 'merchant_activation',
    customer_activation: 'customer_activation',
} as const;
export type GetPlatformFeePayment200Data = {
    paymentRequestId: string;
    kind: GetPlatformFeePayment200DataKind;
    status: string;
    amountPaise: MoneyPaise;
};
export type GetPlatformFeePayment200 = {
    data: GetPlatformFeePayment200Data;
};
