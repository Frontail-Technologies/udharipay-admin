import type { CreatePlan201, CreatePlanBody, GetPlan200, ListPlans200, ListPlansParams, PreviewPlanSchedule200, PreviewPlanScheduleBody, RecordPlanConsent201 } from "./contracts/plans";
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
export const getPlan = (planId: string, options?: ApiRequestOptions) => {
    return apiClient<GetPlan200>({ url: `/api/v1/plans/${planId}`, method: 'GET'
    }, options);
};
export const recordPlanConsent = (planId: string, options?: ApiRequestOptions) => {
    return apiClient<RecordPlanConsent201>({ url: `/api/v1/plans/${planId}/consent`, method: 'POST'
    }, options);
};
