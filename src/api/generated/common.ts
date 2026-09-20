export type MoneyPaise = string;
export interface CursorPagination {
    nextCursor: string | null;
}
export type UserStatus = typeof UserStatus[keyof typeof UserStatus];
export const UserStatus = {
    active: 'active',
    inactive: 'inactive',
    suspended: 'suspended',
} as const;
export type KycSubjectType = typeof KycSubjectType[keyof typeof KycSubjectType];
export const KycSubjectType = {
    merchant: 'merchant',
    customer: 'customer',
    employee: 'employee',
} as const;
export type ApiErrorError = {
    code: string;
    message: string;
    details?: unknown;
};
export interface ApiError {
    error: ApiErrorError;
}
