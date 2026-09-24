import type { CursorPagination } from "../common";
export type EmployeeRequestType = typeof EmployeeRequestType[keyof typeof EmployeeRequestType];
export const EmployeeRequestType = {
    add_customer: 'add_customer',
    add_udhaar: 'add_udhaar',
    customer_verification: 'customer_verification',
    collection_issue: 'collection_issue',
    mandate_issue: 'mandate_issue',
    payment_issue: 'payment_issue',
    other: 'other',
} as const;
export type EmployeeRequestStatus = typeof EmployeeRequestStatus[keyof typeof EmployeeRequestStatus];
export const EmployeeRequestStatus = {
    pending: 'pending',
    assigned: 'assigned',
    resolved: 'resolved',
    rejected: 'rejected',
} as const;
export interface EmployeeRequest {
    publicId: string;
    merchantId: string;
    customerId: string | null;
    requestType: EmployeeRequestType;
    note: string;
    status: EmployeeRequestStatus;
    assignedEmployeeId: string | null;
    resolutionNote: string | null;
    resolvedAt: string | null;
    createdAt: string;
    updatedAt: string;
}
export type CreateEmployeeRequestBody = {
    merchantId: string;
    requestType: EmployeeRequestType;
    customerId?: string;
    note: string;
};
export type CreateEmployeeRequest201 = {
    data: EmployeeRequest;
};
export type ListEmployeeRequestsParams = {
    limit?: number;
    cursor?: string;
    status?: EmployeeRequestStatus;
    merchantId?: string;
};
export type ListEmployeeRequests200Data = {
    items: EmployeeRequest[];
    pagination: CursorPagination;
};
export type ListEmployeeRequests200 = {
    data: ListEmployeeRequests200Data;
};
export type GetEmployeeRequest200 = {
    data: EmployeeRequest;
};
export type AssignEmployeeRequestBody = {
    employeeId: string;
};
export type AssignEmployeeRequest200 = {
    data: EmployeeRequest;
};
export type ResolveEmployeeRequestBody = {
    note: string;
};
export type ResolveEmployeeRequest200 = {
    data: EmployeeRequest;
};
export type RejectEmployeeRequestBody = {
    note: string;
};
export type RejectEmployeeRequest200 = {
    data: EmployeeRequest;
};
