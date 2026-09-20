import type { CursorPagination, UserStatus } from "../common";
export interface Employee {
    id: string;
    publicId: string;
    name: string;
    email: string | null;
    phone: string | null;
    status: UserStatus;
    branch: string | null;
    createdAt: string;
    updatedAt: string;
}
export type CreateEmployeeBody = {
    name: string;
    email?: string;
    phone?: string;
    initialPassword: string;
    status?: UserStatus;
    branch?: string;
};
export type CreateEmployee201 = {
    data: Employee;
};
export type ListEmployeesParams = {
    limit?: number;
    cursor?: string;
    status?: UserStatus;
    search?: string;
};
export type ListEmployees200Data = {
    items: Employee[];
    pagination: CursorPagination;
};
export type ListEmployees200 = {
    data: ListEmployees200Data;
};
export type GetEmployee200 = {
    data: Employee;
};
export type UpdateEmployeeBody = {
    name?: string;
    email?: string;
    phone?: string;
    status?: UserStatus;
    branch?: string | null;
};
export type UpdateEmployee200 = {
    data: Employee;
};
