import type { CreateMandate201, CreateMandateBody, GetMandate200, GetMandateAttemptContext200, GetMandateAuthorization200, GetMandateHistory200, ListCustomerMandates200, ListCustomerMandatesParams, ListMandateAttemptContexts200, ListMandateAttemptContextsParams, ListMandateAttempts200, ListMandateAttemptsParams, RequestMandateAuthorization201 } from "./contracts/mandates";
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
export const requestMandateAuthorization = (mandateId: string, options?: ApiRequestOptions) => {
    return apiClient<RequestMandateAuthorization201>({ url: `/api/v1/mandates/${mandateId}/authorization`, method: 'POST'
    }, options);
};
export const getMandateAuthorization = (mandateId: string, options?: ApiRequestOptions) => {
    return apiClient<GetMandateAuthorization200>({ url: `/api/v1/mandates/${mandateId}/authorization`, method: 'GET'
    }, options);
};
export const getMandateHistory = (mandateId: string, options?: ApiRequestOptions) => {
    return apiClient<GetMandateHistory200>({ url: `/api/v1/mandates/${mandateId}/history`, method: 'GET'
    }, options);
};
export const listMandateAttemptContexts = (params?: ListMandateAttemptContextsParams, options?: ApiRequestOptions) => {
    return apiClient<ListMandateAttemptContexts200>({ url: `/api/v1/mandate-attempts`, method: 'GET',
        params
    }, options);
};
export const getMandateAttemptContext = (attemptId: string, options?: ApiRequestOptions) => {
    return apiClient<GetMandateAttemptContext200>({ url: `/api/v1/mandate-attempts/${attemptId}`, method: 'GET'
    }, options);
};
