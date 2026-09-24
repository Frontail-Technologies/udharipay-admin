import type { CreateCustomerActivationRazorpayOrder201, CreateCustomerActivationRazorpayOrderBody, CreateInvoiceRazorpayOrder201, CreateInvoiceRazorpayOrderBody, GetPlatformFeePayment200, VerifyPlatformFeePayment200, VerifyPlatformFeePaymentBody } from "./contracts/platform-fees";
import { apiClient, type ApiRequestOptions } from "../http/client";
export const createInvoiceRazorpayOrder = (invoiceId: string, createInvoiceRazorpayOrderBody?: CreateInvoiceRazorpayOrderBody, options?: ApiRequestOptions) => {
    return apiClient<CreateInvoiceRazorpayOrder201>({ url: `/api/v1/subscription-invoices/${invoiceId}/payments/razorpay/order`, method: 'POST',
        headers: { 'Content-Type': 'application/json', },
        data: createInvoiceRazorpayOrderBody
    }, options);
};
export const createCustomerActivationRazorpayOrder = (customerId: string, createCustomerActivationRazorpayOrderBody?: CreateCustomerActivationRazorpayOrderBody, options?: ApiRequestOptions) => {
    return apiClient<CreateCustomerActivationRazorpayOrder201>({ url: `/api/v1/customers/${customerId}/activation/payments/razorpay/order`, method: 'POST',
        headers: { 'Content-Type': 'application/json', },
        data: createCustomerActivationRazorpayOrderBody
    }, options);
};
export const verifyPlatformFeePayment = (verifyPlatformFeePaymentBody?: VerifyPlatformFeePaymentBody, options?: ApiRequestOptions) => {
    return apiClient<VerifyPlatformFeePayment200>({ url: `/api/v1/platform-fees/razorpay/verify`, method: 'POST',
        headers: { 'Content-Type': 'application/json', },
        data: verifyPlatformFeePaymentBody
    }, options);
};
export const getPlatformFeePayment = (paymentRequestId: string, options?: ApiRequestOptions) => {
    return apiClient<GetPlatformFeePayment200>({ url: `/api/v1/platform-fees/${paymentRequestId}`, method: 'GET'
    }, options);
};
