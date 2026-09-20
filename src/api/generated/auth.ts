import type { AdminLogin200, AdminLoginBody, GetCurrentSession200, Logout200, MobileLogin200, MobileLoginBody, RefreshAdminSession200, RefreshMobileSession200, RefreshMobileSessionBody, RequestMobileOtp200, RequestMobileOtpBody, VerifyMobileOtp200, VerifyMobileOtpBody } from "./contracts/auth";
import { apiClient, type ApiRequestOptions } from "../http/client";
export const adminLogin = (adminLoginBody?: AdminLoginBody, options?: ApiRequestOptions) => {
    return apiClient<AdminLogin200>({ url: `/api/v1/auth/admin/login`, method: 'POST',
        headers: { 'Content-Type': 'application/json', },
        data: adminLoginBody
    }, options);
};
export const refreshAdminSession = (options?: ApiRequestOptions) => {
    return apiClient<RefreshAdminSession200>({ url: `/api/v1/auth/admin/refresh`, method: 'POST'
    }, options);
};
export const getCurrentSession = (options?: ApiRequestOptions) => {
    return apiClient<GetCurrentSession200>({ url: `/api/v1/auth/me`, method: 'GET'
    }, options);
};
export const logout = (options?: ApiRequestOptions) => {
    return apiClient<Logout200>({ url: `/api/v1/auth/logout`, method: 'POST'
    }, options);
};
export const mobileLogin = (mobileLoginBody?: MobileLoginBody, options?: ApiRequestOptions) => {
    return apiClient<MobileLogin200>({ url: `/api/v1/auth/mobile/login`, method: 'POST',
        headers: { 'Content-Type': 'application/json', },
        data: mobileLoginBody
    }, options);
};
export const requestMobileOtp = (requestMobileOtpBody?: RequestMobileOtpBody, options?: ApiRequestOptions) => {
    return apiClient<RequestMobileOtp200>({ url: `/api/v1/auth/mobile/request-otp`, method: 'POST',
        headers: { 'Content-Type': 'application/json', },
        data: requestMobileOtpBody
    }, options);
};
export const verifyMobileOtp = (verifyMobileOtpBody?: VerifyMobileOtpBody, options?: ApiRequestOptions) => {
    return apiClient<VerifyMobileOtp200>({ url: `/api/v1/auth/mobile/verify-otp`, method: 'POST',
        headers: { 'Content-Type': 'application/json', },
        data: verifyMobileOtpBody
    }, options);
};
export const refreshMobileSession = (refreshMobileSessionBody?: RefreshMobileSessionBody, options?: ApiRequestOptions) => {
    return apiClient<RefreshMobileSession200>({ url: `/api/v1/auth/mobile/refresh`, method: 'POST',
        headers: { 'Content-Type': 'application/json', },
        data: refreshMobileSessionBody
    }, options);
};
