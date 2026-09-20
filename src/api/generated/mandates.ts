import type { CreateMandate201, CreateMandateBody, GetMandate200, ListCustomerMandates200, ListCustomerMandatesParams, ListMandateAttempts200, ListMandateAttemptsParams } from "./contracts/mandates";
import { apiClient, type ApiRequestOptions } from "../http/client";
export const createMandate = (customerId: string, createMandateBody?: CreateMandateBody, options?: ApiRequestOptions) => {
    return apiClient<CreateMandate201>({ url: `/api/v1/customers/${customerId}/mandates`, method: 'POST',
        headers: { 'Content-Type': 'application/json', },
        data: createMandateBody
    }, options);
};
export const listCustomerMandates = (customerId: string, params?: ListCustomerMandatesParams, options?: ApiRequestOptions) => {
    return apiClient<ListCustomerMandates200>({ url: `/api/v1/customers/${customerId}/mandates`, method: 'GET',
        params
    }, options);
};
export const getMandate = (mandateId: string, options?: ApiRequestOptions) => {
    return apiClient<GetMandate200>({ url: `/api/v1/mandates/${mandateId}`, method: 'GET'
    }, options);
};
export const listMandateAttempts = (mandateId: string, params?: ListMandateAttemptsParams, options?: ApiRequestOptions) => {
    return apiClient<ListMandateAttempts200>({ url: `/api/v1/mandates/${mandateId}/attempts`, method: 'GET',
        params
    }, options);
};
