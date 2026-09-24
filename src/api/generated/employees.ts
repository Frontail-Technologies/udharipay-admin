import type { CreateEmployee201, CreateEmployeeBody, GetEmployee200, GetEmployeeIdentity200, ListEmployees200, ListEmployeesParams, SetEmployeeIdentity200, SetEmployeeIdentityBody, UpdateEmployee200, UpdateEmployeeBody } from "./contracts/employees";
import { apiClient, type ApiRequestOptions } from "../http/client";
export const createEmployee = (createEmployeeBody?: CreateEmployeeBody, options?: ApiRequestOptions) => {
    return apiClient<CreateEmployee201>({ url: `/api/v1/employees`, method: 'POST',
        headers: { 'Content-Type': 'application/json', },
        data: createEmployeeBody
    }, options);
};
export const listEmployees = (params?: ListEmployeesParams, options?: ApiRequestOptions) => {
    return apiClient<ListEmployees200>({ url: `/api/v1/employees`, method: 'GET',
        params
    }, options);
};
export const getEmployee = (employeeId: string, options?: ApiRequestOptions) => {
    return apiClient<GetEmployee200>({ url: `/api/v1/employees/${employeeId}`, method: 'GET'
    }, options);
};
export const updateEmployee = (employeeId: string, updateEmployeeBody?: UpdateEmployeeBody, options?: ApiRequestOptions) => {
    return apiClient<UpdateEmployee200>({ url: `/api/v1/employees/${employeeId}`, method: 'PATCH',
        headers: { 'Content-Type': 'application/json', },
        data: updateEmployeeBody
    }, options);
};
export const getEmployeeIdentity = (employeeId: string, options?: ApiRequestOptions) => {
    return apiClient<GetEmployeeIdentity200>({ url: `/api/v1/employees/${employeeId}/identity`, method: 'GET'
    }, options);
};
export const setEmployeeIdentity = (employeeId: string, setEmployeeIdentityBody?: SetEmployeeIdentityBody, options?: ApiRequestOptions) => {
    return apiClient<SetEmployeeIdentity200>({ url: `/api/v1/employees/${employeeId}/identity`, method: 'PUT',
        headers: { 'Content-Type': 'application/json', },
        data: setEmployeeIdentityBody
    }, options);
};
