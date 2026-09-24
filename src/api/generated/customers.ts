import type { CreateCustomer201, CreateCustomerBody, GetCustomer200, GetCustomerActivation200, ListCustomers200, ListCustomersParams, UpdateCustomer200, UpdateCustomerBody } from "./contracts/customers";
import { apiClient, type ApiRequestOptions } from "../http/client";
export const createCustomer = (merchantId: string, createCustomerBody?: CreateCustomerBody, options?: ApiRequestOptions) => {
    return apiClient<CreateCustomer201>({ url: `/api/v1/merchants/${merchantId}/customers`, method: 'POST',
        headers: { 'Content-Type': 'application/json', },
        data: createCustomerBody
    }, options);
};
export const listCustomers = (merchantId: string, params?: ListCustomersParams, options?: ApiRequestOptions) => {
    return apiClient<ListCustomers200>({ url: `/api/v1/merchants/${merchantId}/customers`, method: 'GET',
        params
    }, options);
};
export const getCustomer = (customerId: string, options?: ApiRequestOptions) => {
    return apiClient<GetCustomer200>({ url: `/api/v1/customers/${customerId}`, method: 'GET'
    }, options);
};
export const updateCustomer = (customerId: string, updateCustomerBody?: UpdateCustomerBody, options?: ApiRequestOptions) => {
    return apiClient<UpdateCustomer200>({ url: `/api/v1/customers/${customerId}`, method: 'PATCH',
        headers: { 'Content-Type': 'application/json', },
        data: updateCustomerBody
    }, options);
};
export const getCustomerActivation = (customerId: string, options?: ApiRequestOptions) => {
    return apiClient<GetCustomerActivation200>({ url: `/api/v1/customers/${customerId}/activation`, method: 'GET'
    }, options);
};
