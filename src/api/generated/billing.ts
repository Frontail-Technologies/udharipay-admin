import type { CreateMerchantSubscription201, CreateMerchantSubscriptionBody, GetBillingSettings200, GetMerchantSubscription200, GetSubscriptionAutopay200, GetSubscriptionInvoice200, GetSubscriptionSummary200, ListBillingInvoices200, ListBillingInvoicesParams, ListBillingPlans200, ListMerchantInvoices200, ListMerchantInvoicesParams, ListSubscriptionDirectory200, ListSubscriptionDirectoryParams, RequestSubscriptionAutopay201, RequestSubscriptionAutopayBody, UpdateBillingPlan200, UpdateBillingPlanBody, UpdateBillingSettings200, UpdateBillingSettingsBody } from "./contracts/billing";
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
export const requestSubscriptionAutopay = (merchantId: string, requestSubscriptionAutopayBody?: RequestSubscriptionAutopayBody, options?: ApiRequestOptions) => {
    return apiClient<RequestSubscriptionAutopay201>({ url: `/api/v1/merchants/${merchantId}/subscription/autopay`, method: 'POST',
        headers: { 'Content-Type': 'application/json', },
        data: requestSubscriptionAutopayBody
    }, options);
};
export const getSubscriptionAutopay = (merchantId: string, options?: ApiRequestOptions) => {
    return apiClient<GetSubscriptionAutopay200>({ url: `/api/v1/merchants/${merchantId}/subscription/autopay`, method: 'GET'
    }, options);
};
export const getBillingSettings = (options?: ApiRequestOptions) => {
    return apiClient<GetBillingSettings200>({ url: `/api/v1/billing/settings`, method: 'GET'
    }, options);
};
export const updateBillingSettings = (updateBillingSettingsBody?: UpdateBillingSettingsBody, options?: ApiRequestOptions) => {
    return apiClient<UpdateBillingSettings200>({ url: `/api/v1/billing/settings`, method: 'PATCH',
        headers: { 'Content-Type': 'application/json', },
        data: updateBillingSettingsBody
    }, options);
};
export const listBillingPlans = (options?: ApiRequestOptions) => {
    return apiClient<ListBillingPlans200>({ url: `/api/v1/billing/plans`, method: 'GET'
    }, options);
};
export const updateBillingPlan = (planCode: string, updateBillingPlanBody?: UpdateBillingPlanBody, options?: ApiRequestOptions) => {
    return apiClient<UpdateBillingPlan200>({ url: `/api/v1/billing/plans/${planCode}`, method: 'PATCH',
        headers: { 'Content-Type': 'application/json', },
        data: updateBillingPlanBody
    }, options);
};
export const listSubscriptionDirectory = (params?: ListSubscriptionDirectoryParams, options?: ApiRequestOptions) => {
    return apiClient<ListSubscriptionDirectory200>({ url: `/api/v1/billing/subscriptions`, method: 'GET',
        params
    }, options);
};
export const getSubscriptionSummary = (options?: ApiRequestOptions) => {
    return apiClient<GetSubscriptionSummary200>({ url: `/api/v1/billing/summary`, method: 'GET'
    }, options);
};
