import type { CursorPagination } from "../common";
export type MerchantStatus = typeof MerchantStatus[keyof typeof MerchantStatus];
export const MerchantStatus = {
    draft: 'draft',
    in_review: 'in_review',
    active: 'active',
    payment_due: 'payment_due',
    grace: 'grace',
    restricted: 'restricted',
    suspended: 'suspended',
} as const;
export interface MerchantListItem {
    id: string;
    publicId: string;
    businessName: string;
    ownerName: string;
    businessCategory: string;
    phone: string;
    email: string | null;
    city: string;
    state: string;
    status: MerchantStatus;
    createdAt: string;
}
export type MerchantAccountsItem = {
    userId: string;
    email: string | null;
    phone: string | null;
    status: string;
    role: string;
    membershipStatus: string;
};
export type Merchant = MerchantListItem & ({
    address: string;
    pincode: string;
    assignedEmployeeId: string | null;
    updatedAt: string;
    accounts?: MerchantAccountsItem[];
});
export type CreateMerchantBody = {
    businessName: string;
    ownerName: string;
    businessCategory: string;
    phone: string;
    email?: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
    status?: MerchantStatus;
};
export type CreateMerchant201 = {
    data: Merchant;
};
export type ListMerchantsParams = {
    limit?: number;
    cursor?: string;
    status?: MerchantStatus;
    businessCategory?: string;
    search?: string;
};
export type ListMerchants200Data = {
    items: MerchantListItem[];
    pagination: CursorPagination;
};
export type ListMerchants200 = {
    data: ListMerchants200Data;
};
export type GetMerchant200 = {
    data: Merchant;
};
export type UpdateMerchantBody = {
    businessName?: string;
    ownerName?: string;
    businessCategory?: string;
    phone?: string;
    email?: string | null;
    address?: string;
    city?: string;
    state?: string;
    pincode?: string;
    status?: MerchantStatus;
};
export type UpdateMerchant200 = {
    data: Merchant;
};
export type AssignMerchantBody = {
    assignedEmployeeId: string | null;
};
export type AssignMerchant200 = {
    data: Merchant;
};
export type ProvisionMerchantAccountBody = {
    email?: string;
    phone?: string;
    initialPassword: string;
};
export type ProvisionMerchantAccount201 = {
    data: Merchant;
};
