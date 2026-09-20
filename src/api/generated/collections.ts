import type { CreateFollowUp201, CreateFollowUpBody, ListCollectionQueue200, ListCollectionQueueParams, ListFollowUps200, ListFollowUpsParams } from "./contracts/collections";
import { apiClient, type ApiRequestOptions } from "../http/client";
export const listCollectionQueue = (params?: ListCollectionQueueParams, options?: ApiRequestOptions) => {
    return apiClient<ListCollectionQueue200>({ url: `/api/v1/collections`, method: 'GET',
        params
    }, options);
};
export const createFollowUp = (installmentId: string, createFollowUpBody?: CreateFollowUpBody, options?: ApiRequestOptions) => {
    return apiClient<CreateFollowUp201>({ url: `/api/v1/installments/${installmentId}/follow-ups`, method: 'POST',
        headers: { 'Content-Type': 'application/json', },
        data: createFollowUpBody
    }, options);
};
export const listFollowUps = (installmentId: string, params?: ListFollowUpsParams, options?: ApiRequestOptions) => {
    return apiClient<ListFollowUps200>({ url: `/api/v1/installments/${installmentId}/follow-ups`, method: 'GET',
        params
    }, options);
};
