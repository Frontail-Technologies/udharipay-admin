import type { GetPayment200, ListAllPayments200, ListAllPaymentsParams, ListPlanPayments200, ListPlanPaymentsParams } from "./contracts/payments";
import { apiClient, type ApiRequestOptions } from "../http/client";
export const listPlanPayments = (planId: string, params?: ListPlanPaymentsParams, options?: ApiRequestOptions) => {
    return apiClient<ListPlanPayments200>({ url: `/api/v1/plans/${planId}/payments`, method: 'GET',
        params
    }, options);
};
export const getPayment = (paymentId: string, options?: ApiRequestOptions) => {
    return apiClient<GetPayment200>({ url: `/api/v1/payments/${paymentId}`, method: 'GET'
    }, options);
};
export const listAllPayments = (params?: ListAllPaymentsParams, options?: ApiRequestOptions) => {
    return apiClient<ListAllPayments200>({ url: `/api/v1/payments`, method: 'GET',
        params
    }, options);
};
