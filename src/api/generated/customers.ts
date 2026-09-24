import type { CancelCustomerReminder200, CreateCustomer201, CreateCustomerBody, GetCustomer200, GetCustomerActivation200, GetCustomerFinancialSummary200, ListCustomerReminders200, ListCustomerRemindersParams, ListCustomers200, ListCustomersParams, UpdateCustomer200, UpdateCustomerBody } from "./contracts/customers";
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
export const getCustomerFinancialSummary = (customerId: string, options?: ApiRequestOptions) => {
    return apiClient<GetCustomerFinancialSummary200>({ url: `/api/v1/customers/${customerId}/summary`, method: 'GET'
    }, options);
};
export const getCustomerActivation = (customerId: string, options?: ApiRequestOptions) => {
    return apiClient<GetCustomerActivation200>({ url: `/api/v1/customers/${customerId}/activation`, method: 'GET'
    }, options);
};
export const listCustomerReminders = (customerId: string, params?: ListCustomerRemindersParams, options?: ApiRequestOptions) => {
    return apiClient<ListCustomerReminders200>({ url: `/api/v1/customers/${customerId}/reminders`, method: 'GET',
        params
    }, options);
};
export const cancelCustomerReminder = (customerId: string, reminderId: string, options?: ApiRequestOptions) => {
    return apiClient<CancelCustomerReminder200>({ url: `/api/v1/customers/${customerId}/reminders/${reminderId}/cancel`, method: 'POST'
    }, options);
};
