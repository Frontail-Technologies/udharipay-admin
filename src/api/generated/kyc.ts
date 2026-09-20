import type { ApproveKycReview200, ConfirmKycDocument200, CreateCustomerKyc201, CreateEmployeeKyc201, CreateKycUploadUrl201, CreateKycUploadUrlBody, CreateKycViewUrl200, CreateMerchantKyc201, GetCustomerKyc200, GetEmployeeKyc200, GetKycReview200, GetMerchantKyc200, ListKycReviews200, ListKycReviewsParams, RejectKycReview200, RejectKycReviewBody, RequestResubmissionKycReview200, RequestResubmissionKycReviewBody, SubmitKycReview200 } from "./contracts/kyc";
import { apiClient, type ApiRequestOptions } from "../http/client";
export const createMerchantKyc = (merchantId: string, options?: ApiRequestOptions) => {
    return apiClient<CreateMerchantKyc201>({ url: `/api/v1/merchants/${merchantId}/kyc`, method: 'POST'
    }, options);
};
export const getMerchantKyc = (merchantId: string, options?: ApiRequestOptions) => {
    return apiClient<GetMerchantKyc200>({ url: `/api/v1/merchants/${merchantId}/kyc`, method: 'GET'
    }, options);
};
export const createCustomerKyc = (customerId: string, options?: ApiRequestOptions) => {
    return apiClient<CreateCustomerKyc201>({ url: `/api/v1/customers/${customerId}/kyc`, method: 'POST'
    }, options);
};
export const getCustomerKyc = (customerId: string, options?: ApiRequestOptions) => {
    return apiClient<GetCustomerKyc200>({ url: `/api/v1/customers/${customerId}/kyc`, method: 'GET'
    }, options);
};
export const createEmployeeKyc = (employeeId: string, options?: ApiRequestOptions) => {
    return apiClient<CreateEmployeeKyc201>({ url: `/api/v1/employees/${employeeId}/kyc`, method: 'POST'
    }, options);
};
export const getEmployeeKyc = (employeeId: string, options?: ApiRequestOptions) => {
    return apiClient<GetEmployeeKyc200>({ url: `/api/v1/employees/${employeeId}/kyc`, method: 'GET'
    }, options);
};
export const listKycReviews = (params?: ListKycReviewsParams, options?: ApiRequestOptions) => {
    return apiClient<ListKycReviews200>({ url: `/api/v1/kyc/reviews`, method: 'GET',
        params
    }, options);
};
export const getKycReview = (reviewId: string, options?: ApiRequestOptions) => {
    return apiClient<GetKycReview200>({ url: `/api/v1/kyc/reviews/${reviewId}`, method: 'GET'
    }, options);
};
export const createKycUploadUrl = (reviewId: string, createKycUploadUrlBody?: CreateKycUploadUrlBody, options?: ApiRequestOptions) => {
    return apiClient<CreateKycUploadUrl201>({ url: `/api/v1/kyc/reviews/${reviewId}/documents/upload-url`, method: 'POST',
        headers: { 'Content-Type': 'application/json', },
        data: createKycUploadUrlBody
    }, options);
};
export const confirmKycDocument = (documentId: string, options?: ApiRequestOptions) => {
    return apiClient<ConfirmKycDocument200>({ url: `/api/v1/kyc/documents/${documentId}/confirm`, method: 'POST'
    }, options);
};
export const createKycViewUrl = (documentId: string, options?: ApiRequestOptions) => {
    return apiClient<CreateKycViewUrl200>({ url: `/api/v1/kyc/documents/${documentId}/view-url`, method: 'POST'
    }, options);
};
export const submitKycReview = (reviewId: string, options?: ApiRequestOptions) => {
    return apiClient<SubmitKycReview200>({ url: `/api/v1/kyc/reviews/${reviewId}/submit`, method: 'POST'
    }, options);
};
export const approveKycReview = (reviewId: string, options?: ApiRequestOptions) => {
    return apiClient<ApproveKycReview200>({ url: `/api/v1/kyc/reviews/${reviewId}/approve`, method: 'POST'
    }, options);
};
export const rejectKycReview = (reviewId: string, rejectKycReviewBody?: RejectKycReviewBody, options?: ApiRequestOptions) => {
    return apiClient<RejectKycReview200>({ url: `/api/v1/kyc/reviews/${reviewId}/reject`, method: 'POST',
        headers: { 'Content-Type': 'application/json', },
        data: rejectKycReviewBody
    }, options);
};
export const requestResubmissionKycReview = (reviewId: string, requestResubmissionKycReviewBody?: RequestResubmissionKycReviewBody, options?: ApiRequestOptions) => {
    return apiClient<RequestResubmissionKycReview200>({ url: `/api/v1/kyc/reviews/${reviewId}/request-resubmission`, method: 'POST',
        headers: { 'Content-Type': 'application/json', },
        data: requestResubmissionKycReviewBody
    }, options);
};
