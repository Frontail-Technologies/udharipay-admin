import type { CursorPagination, MoneyPaise } from "../common";
export type CustomerStatus = typeof CustomerStatus[keyof typeof CustomerStatus];
export const CustomerStatus = {
    active: 'active',
    inactive: 'inactive',
    blocked: 'blocked',
} as const;
export interface Customer {
    id: string;
    publicId: string;
    merchantId: string;
    name: string;
    phone: string;
    alternatePhone: string | null;
    address: string;
    city: string;
    state: string;
    pincode: string;
    status: CustomerStatus;
    createdAt: string;
    updatedAt: string;
}
export type CustomerActivationStatus = typeof CustomerActivationStatus[keyof typeof CustomerActivationStatus];
export const CustomerActivationStatus = {
    pending: 'pending',
    paid: 'paid',
    void: 'void',
} as const;
export interface CustomerActivation {
    id: string;
    publicId: string;
    customerId: string;
    amountPaise: MoneyPaise;
    status: CustomerActivationStatus;
    dueDate: string;
    paidAt: string | null;
    createdAt: string;
    updatedAt: string;
}
export type CreateCustomerBody = {
    name: string;
    phone: string;
    alternatePhone?: string | null;
    address: string;
    city: string;
    state: string;
    pincode: string;
    status?: CustomerStatus;
};
export type CreateCustomer201 = {
    data: Customer;
};
export type ListCustomersParams = {
    limit?: number;
    cursor?: string;
    status?: CustomerStatus;
    search?: string;
};
export type ListCustomers200Data = {
    items: Customer[];
    pagination: CursorPagination;
};
export type ListCustomers200 = {
    data: ListCustomers200Data;
};
export type GetCustomer200 = {
    data: Customer;
};
export type UpdateCustomerBody = {
    name?: string;
    phone?: string;
    alternatePhone?: string | null;
    address?: string;
    city?: string;
    state?: string;
    pincode?: string;
    status?: CustomerStatus;
};
export type UpdateCustomer200 = {
    data: Customer;
};
export type GetCustomerActivation200 = {
    data: CustomerActivation;
};
