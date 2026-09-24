import type { AssignEmployeeRequest200, AssignEmployeeRequestBody, CreateEmployeeRequest201, CreateEmployeeRequestBody, GetEmployeeRequest200, ListEmployeeRequests200, ListEmployeeRequestsParams, RejectEmployeeRequest200, RejectEmployeeRequestBody, ResolveEmployeeRequest200, ResolveEmployeeRequestBody } from "./contracts/employee-requests";
import { apiClient, type ApiRequestOptions } from "../http/client";
export const createEmployeeRequest = (createEmployeeRequestBody?: CreateEmployeeRequestBody, options?: ApiRequestOptions) => {
    return apiClient<CreateEmployeeRequest201>({ url: `/api/v1/employee-requests`, method: 'POST',
        headers: { 'Content-Type': 'application/json', },
        data: createEmployeeRequestBody
    }, options);
};
export const listEmployeeRequests = (params?: ListEmployeeRequestsParams, options?: ApiRequestOptions) => {
    return apiClient<ListEmployeeRequests200>({ url: `/api/v1/employee-requests`, method: 'GET',
        params
    }, options);
};
export const getEmployeeRequest = (requestId: string, options?: ApiRequestOptions) => {
    return apiClient<GetEmployeeRequest200>({ url: `/api/v1/employee-requests/${requestId}`, method: 'GET'
    }, options);
};
export const assignEmployeeRequest = (requestId: string, assignEmployeeRequestBody?: AssignEmployeeRequestBody, options?: ApiRequestOptions) => {
    return apiClient<AssignEmployeeRequest200>({ url: `/api/v1/employee-requests/${requestId}/assign`, method: 'POST',
        headers: { 'Content-Type': 'application/json', },
        data: assignEmployeeRequestBody
    }, options);
};
export const resolveEmployeeRequest = (requestId: string, resolveEmployeeRequestBody?: ResolveEmployeeRequestBody, options?: ApiRequestOptions) => {
    return apiClient<ResolveEmployeeRequest200>({ url: `/api/v1/employee-requests/${requestId}/resolve`, method: 'POST',
        headers: { 'Content-Type': 'application/json', },
        data: resolveEmployeeRequestBody
    }, options);
};
export const rejectEmployeeRequest = (requestId: string, rejectEmployeeRequestBody?: RejectEmployeeRequestBody, options?: ApiRequestOptions) => {
    return apiClient<RejectEmployeeRequest200>({ url: `/api/v1/employee-requests/${requestId}/reject`, method: 'POST',
        headers: { 'Content-Type': 'application/json', },
        data: rejectEmployeeRequestBody
    }, options);
};
