import type { CreateRazorpayOrder201, CreateRazorpayOrderBody, ReceiveRazorpayWebhook200, ReceiveRazorpayWebhookBody, VerifyRazorpayPayment200, VerifyRazorpayPaymentBody } from "./contracts/razorpay";
import { apiClient, type ApiRequestOptions } from "../http/client";
export const createRazorpayOrder = (planId: string, createRazorpayOrderBody?: CreateRazorpayOrderBody, options?: ApiRequestOptions) => {
    return apiClient<CreateRazorpayOrder201>({ url: `/api/v1/plans/${planId}/payments/razorpay/order`, method: 'POST',
        headers: { 'Content-Type': 'application/json', },
        data: createRazorpayOrderBody
    }, options);
};
export const verifyRazorpayPayment = (verifyRazorpayPaymentBody?: VerifyRazorpayPaymentBody, options?: ApiRequestOptions) => {
    return apiClient<VerifyRazorpayPayment200>({ url: `/api/v1/payments/razorpay/verify`, method: 'POST',
        headers: { 'Content-Type': 'application/json', },
        data: verifyRazorpayPaymentBody
    }, options);
};
export const receiveRazorpayWebhook = (receiveRazorpayWebhookBody: ReceiveRazorpayWebhookBody, options?: ApiRequestOptions) => {
    return apiClient<ReceiveRazorpayWebhook200>({ url: `/api/v1/webhooks/razorpay`, method: 'POST',
        headers: { 'Content-Type': 'application/json', },
        data: receiveRazorpayWebhookBody
    }, options);
};
