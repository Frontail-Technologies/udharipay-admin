import type { CreateMerchantSubscription201, CreateMerchantSubscriptionBody, GetMerchantSubscription200, GetSubscriptionInvoice200, ListBillingInvoices200, ListBillingInvoicesParams, ListMerchantInvoices200, ListMerchantInvoicesParams } from "./contracts/billing";
import { apiClient, type ApiRequestOptions } from "../http/client";
export const createMerchantSubscription = (merchantId: string, createMerchantSubscriptionBody?: CreateMerchantSubscriptionBody, options?: ApiRequestOptions) => {
    return apiClient<CreateMerchantSubscription201>({ url: `/api/v1/merchants/${merchantId}/subscription`, method: 'POST',
        headers: { 'Content-Type': 'application/json', },
        data: createMerchantSubscriptionBody
    }, options);
};
export const getMerchantSubscription = (merchantId: string, options?: ApiRequestOptions) => {
    return apiClient<GetMerchantSubscription200>({ url: `/api/v1/merchants/${merchantId}/subscription`, method: 'GET'
    }, options);
};
export const listMerchantInvoices = (merchantId: string, params?: ListMerchantInvoicesParams, options?: ApiRequestOptions) => {
    return apiClient<ListMerchantInvoices200>({ url: `/api/v1/merchants/${merchantId}/subscription/invoices`, method: 'GET',
        params
    }, options);
};
export const getSubscriptionInvoice = (invoiceId: string, options?: ApiRequestOptions) => {
    return apiClient<GetSubscriptionInvoice200>({ url: `/api/v1/subscription-invoices/${invoiceId}`, method: 'GET'
    }, options);
};
export const listBillingInvoices = (params?: ListBillingInvoicesParams, options?: ApiRequestOptions) => {
    return apiClient<ListBillingInvoices200>({ url: `/api/v1/billing/invoices`, method: 'GET',
        params
    }, options);
};
