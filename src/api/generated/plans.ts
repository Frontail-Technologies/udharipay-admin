import type { ConfirmPlanDocument200, CreatePlan201, CreatePlanBody, CreatePlanDocumentUploadUrl201, CreatePlanDocumentUploadUrlBody, CreatePlanDocumentViewUrl200, GetPlan200, ListPlans200, ListPlansParams, PreviewPlanSchedule200, PreviewPlanScheduleBody, RecordPlanConsent201, RemovePlanDocument200, SuggestPlans200, SuggestPlansParams } from "./contracts/plans";
import { apiClient, type ApiRequestOptions } from "../http/client";
export const createPlan = (customerId: string, createPlanBody?: CreatePlanBody, options?: ApiRequestOptions) => {
    return apiClient<CreatePlan201>({ url: `/api/v1/customers/${customerId}/plans`, method: 'POST',
        headers: { 'Content-Type': 'application/json', },
        data: createPlanBody
    }, options);
};
export const listPlans = (customerId: string, params?: ListPlansParams, options?: ApiRequestOptions) => {
    return apiClient<ListPlans200>({ url: `/api/v1/customers/${customerId}/plans`, method: 'GET',
        params
    }, options);
};
export const previewPlanSchedule = (previewPlanScheduleBody?: PreviewPlanScheduleBody, options?: ApiRequestOptions) => {
    return apiClient<PreviewPlanSchedule200>({ url: `/api/v1/plans/preview`, method: 'POST',
        headers: { 'Content-Type': 'application/json', },
        data: previewPlanScheduleBody
    }, options);
};
export const suggestPlans = (params: SuggestPlansParams, options?: ApiRequestOptions) => {
    return apiClient<SuggestPlans200>({ url: `/api/v1/plans/suggestions`, method: 'GET',
        params
    }, options);
};
export const createPlanDocumentUploadUrl = (planId: string, createPlanDocumentUploadUrlBody?: CreatePlanDocumentUploadUrlBody, options?: ApiRequestOptions) => {
    return apiClient<CreatePlanDocumentUploadUrl201>({ url: `/api/v1/plans/${planId}/documents/upload-url`, method: 'POST',
        headers: { 'Content-Type': 'application/json', },
        data: createPlanDocumentUploadUrlBody
    }, options);
};
export const confirmPlanDocument = (documentId: string, options?: ApiRequestOptions) => {
    return apiClient<ConfirmPlanDocument200>({ url: `/api/v1/plan-documents/${documentId}/confirm`, method: 'POST'
    }, options);
};
export const removePlanDocument = (documentId: string, options?: ApiRequestOptions) => {
    return apiClient<RemovePlanDocument200>({ url: `/api/v1/plan-documents/${documentId}/remove`, method: 'POST'
    }, options);
};
export const createPlanDocumentViewUrl = (documentId: string, options?: ApiRequestOptions) => {
    return apiClient<CreatePlanDocumentViewUrl200>({ url: `/api/v1/plan-documents/${documentId}/view-url`, method: 'POST'
    }, options);
};
export const getPlan = (planId: string, options?: ApiRequestOptions) => {
    return apiClient<GetPlan200>({ url: `/api/v1/plans/${planId}`, method: 'GET'
    }, options);
};
export const recordPlanConsent = (planId: string, options?: ApiRequestOptions) => {
    return apiClient<RecordPlanConsent201>({ url: `/api/v1/plans/${planId}/consent`, method: 'POST'
    }, options);
};
