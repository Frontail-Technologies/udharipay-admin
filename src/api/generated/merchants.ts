import type { AssignMerchant200, AssignMerchantBody, ConfirmMerchantAgreementEvidence200, CreateMerchant201, CreateMerchantAgreementEvidenceUpload201, CreateMerchantAgreementEvidenceUploadBody, CreateMerchantAgreementEvidenceViewUrl200, CreateMerchantBody, DecideMerchantBankAccount200, DecideMerchantBankAccountBody, GetMerchant200, GetMerchantAgreement200, GetMerchantApplication200, GetMerchantBankAccount200, ListMerchants200, ListMerchantsParams, ProvisionMerchantAccount201, ProvisionMerchantAccountBody, RecordMerchantAgreement201, SetMerchantBankAccount200, SetMerchantBankAccountBody, UpdateMerchant200, UpdateMerchantBody } from "./contracts/merchants";
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
export const getMerchantApplication = (merchantId: string, options?: ApiRequestOptions) => {
    return apiClient<GetMerchantApplication200>({ url: `/api/v1/merchants/${merchantId}/application`, method: 'GET'
    }, options);
};
export const getMerchantBankAccount = (merchantId: string, options?: ApiRequestOptions) => {
    return apiClient<GetMerchantBankAccount200>({ url: `/api/v1/merchants/${merchantId}/bank-account`, method: 'GET'
    }, options);
};
export const setMerchantBankAccount = (merchantId: string, setMerchantBankAccountBody?: SetMerchantBankAccountBody, options?: ApiRequestOptions) => {
    return apiClient<SetMerchantBankAccount200>({ url: `/api/v1/merchants/${merchantId}/bank-account`, method: 'PUT',
        headers: { 'Content-Type': 'application/json', },
        data: setMerchantBankAccountBody
    }, options);
};
export const decideMerchantBankAccount = (merchantId: string, decideMerchantBankAccountBody?: DecideMerchantBankAccountBody, options?: ApiRequestOptions) => {
    return apiClient<DecideMerchantBankAccount200>({ url: `/api/v1/merchants/${merchantId}/bank-account/verification`, method: 'POST',
        headers: { 'Content-Type': 'application/json', },
        data: decideMerchantBankAccountBody
    }, options);
};
export const getMerchantAgreement = (merchantId: string, options?: ApiRequestOptions) => {
    return apiClient<GetMerchantAgreement200>({ url: `/api/v1/merchants/${merchantId}/agreement`, method: 'GET'
    }, options);
};
export const recordMerchantAgreement = (merchantId: string, options?: ApiRequestOptions) => {
    return apiClient<RecordMerchantAgreement201>({ url: `/api/v1/merchants/${merchantId}/agreement`, method: 'POST'
    }, options);
};
export const createMerchantAgreementEvidenceUpload = (merchantId: string, createMerchantAgreementEvidenceUploadBody?: CreateMerchantAgreementEvidenceUploadBody, options?: ApiRequestOptions) => {
    return apiClient<CreateMerchantAgreementEvidenceUpload201>({ url: `/api/v1/merchants/${merchantId}/agreement/evidence/upload-url`, method: 'POST',
        headers: { 'Content-Type': 'application/json', },
        data: createMerchantAgreementEvidenceUploadBody
    }, options);
};
export const confirmMerchantAgreementEvidence = (merchantId: string, options?: ApiRequestOptions) => {
    return apiClient<ConfirmMerchantAgreementEvidence200>({ url: `/api/v1/merchants/${merchantId}/agreement/evidence/confirm`, method: 'POST'
    }, options);
};
export const createMerchantAgreementEvidenceViewUrl = (merchantId: string, options?: ApiRequestOptions) => {
    return apiClient<CreateMerchantAgreementEvidenceViewUrl200>({ url: `/api/v1/merchants/${merchantId}/agreement/evidence/view-url`, method: 'POST'
    }, options);
};
