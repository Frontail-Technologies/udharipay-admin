import type { AssignMerchant200, AssignMerchantBody, CreateMerchant201, CreateMerchantBody, GetMerchant200, ListMerchants200, ListMerchantsParams, ProvisionMerchantAccount201, ProvisionMerchantAccountBody, UpdateMerchant200, UpdateMerchantBody } from "./contracts/merchants";
import { apiClient, type ApiRequestOptions } from "../http/client";
export const createMerchant = (createMerchantBody?: CreateMerchantBody, options?: ApiRequestOptions) => {
    return apiClient<CreateMerchant201>({ url: `/api/v1/merchants`, method: 'POST',
        headers: { 'Content-Type': 'application/json', },
        data: createMerchantBody
    }, options);
};
export const listMerchants = (params?: ListMerchantsParams, options?: ApiRequestOptions) => {
    return apiClient<ListMerchants200>({ url: `/api/v1/merchants`, method: 'GET',
        params
    }, options);
};
export const getMerchant = (merchantId: string, options?: ApiRequestOptions) => {
    return apiClient<GetMerchant200>({ url: `/api/v1/merchants/${merchantId}`, method: 'GET'
    }, options);
};
export const updateMerchant = (merchantId: string, updateMerchantBody?: UpdateMerchantBody, options?: ApiRequestOptions) => {
    return apiClient<UpdateMerchant200>({ url: `/api/v1/merchants/${merchantId}`, method: 'PATCH',
        headers: { 'Content-Type': 'application/json', },
        data: updateMerchantBody
    }, options);
};
export const assignMerchant = (merchantId: string, assignMerchantBody?: AssignMerchantBody, options?: ApiRequestOptions) => {
    return apiClient<AssignMerchant200>({ url: `/api/v1/merchants/${merchantId}/assignment`, method: 'PATCH',
        headers: { 'Content-Type': 'application/json', },
        data: assignMerchantBody
    }, options);
};
export const provisionMerchantAccount = (merchantId: string, provisionMerchantAccountBody?: ProvisionMerchantAccountBody, options?: ApiRequestOptions) => {
    return apiClient<ProvisionMerchantAccount201>({ url: `/api/v1/merchants/${merchantId}/account`, method: 'POST',
        headers: { 'Content-Type': 'application/json', },
        data: provisionMerchantAccountBody
    }, options);
};
