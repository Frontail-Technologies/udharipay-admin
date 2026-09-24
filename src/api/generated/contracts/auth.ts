import type { IdentityDocumentType, UserStatus } from "../common";
export type UserRole = typeof UserRole[keyof typeof UserRole];
export const UserRole = {
    admin: 'admin',
    employee: 'employee',
    merchant: 'merchant',
} as const;
export interface SafeUser {
    id: string;
    role: UserRole;
    status: UserStatus;
}
export type SessionContextEmployeeIdentity = {
    panMasked: string | null;
    idType: IdentityDocumentType | null;
    idReferenceMasked: string | null;
    updatedAt: string | null;
};
export type SessionContextEmployee = {
    publicId: string;
    name: string;
    email: string | null;
    phone: string | null;
    branch: string | null;
    address: string | null;
    identity: SessionContextEmployeeIdentity;
    joinedAt: string;
    assignedMerchantCount: number;
} | null;
export type SessionContextMerchantMembershipsItem = {
    merchantId: string;
    status: string;
};
export interface SessionContext {
    user: SafeUser;
    employeeId?: string | null;
    employee?: SessionContextEmployee;
    merchantMemberships?: SessionContextMerchantMembershipsItem[];
}
export type AdminLoginBody = {
    identifier: string;
    password: string;
    deviceName?: string;
};
export type AdminLogin200Data = {
    user: SafeUser;
    accessExpiresAt: string;
    expiresAt: string;
    absoluteExpiresAt: string;
};
export type AdminLogin200 = {
    data: AdminLogin200Data;
};
export type RefreshAdminSession200Data = {
    accessExpiresAt: string;
    expiresAt: string;
    absoluteExpiresAt: string;
};
export type RefreshAdminSession200 = {
    data: RefreshAdminSession200Data;
};
export type GetCurrentSession200 = {
    data: SessionContext;
};
export type Logout200Data = {
    revoked: boolean;
};
export type Logout200 = {
    data: Logout200Data;
};
export type MobileLoginBody = {
    identifier: string;
    password: string;
    deviceName?: string;
};
export type MobileLogin200Data = {
    user: SafeUser;
    accessExpiresAt: string;
    expiresAt: string;
    absoluteExpiresAt: string;
    accessToken: string;
    refreshToken: string;
};
export type MobileLogin200 = {
    data: MobileLogin200Data;
};
export type RequestMobileOtpBody = {
    phone: string;
};
export type RequestMobileOtp200Data = {
    message: string;
};
export type RequestMobileOtp200 = {
    data: RequestMobileOtp200Data;
};
export type VerifyMobileOtpBody = {
    phone: string;
    otp: string;
    deviceName?: string;
};
export type VerifyMobileOtp200Data = {
    user: SafeUser;
    accessExpiresAt: string;
    expiresAt: string;
    absoluteExpiresAt: string;
    accessToken: string;
    refreshToken: string;
};
export type VerifyMobileOtp200 = {
    data: VerifyMobileOtp200Data;
};
export type RefreshMobileSessionBody = {
    refreshToken: string;
};
export type RefreshMobileSession200Data = {
    accessToken: string;
    refreshToken: string;
};
export type RefreshMobileSession200 = {
    data: RefreshMobileSession200Data;
};
