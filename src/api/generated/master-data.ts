import type { CreateCity200, CreateCityBody, CreateState200, CreateStateBody, ListBankAccountTypes200, ListBusinessCategories200, ListCities200, ListCountries200, ListCustomerIdTypes200, ListMandateMethods200, ListStates200, UpdateBankAccountType200, UpdateBankAccountTypeBody, UpdateBusinessCategory200, UpdateBusinessCategoryBody, UpdateCity200, UpdateCityBody, UpdateCountry200, UpdateCountryBody, UpdateCustomerIdType200, UpdateCustomerIdTypeBody, UpdateMandateMethod200, UpdateMandateMethodBody, UpdateState200, UpdateStateBody } from "./contracts/master-data";
import { apiClient, type ApiRequestOptions } from "../http/client";
export const listCountries = (options?: ApiRequestOptions) => {
    return apiClient<ListCountries200>({ url: `/api/v1/master-data/countries`, method: 'GET'
    }, options);
};
export const listStates = (countryId: string, options?: ApiRequestOptions) => {
    return apiClient<ListStates200>({ url: `/api/v1/master-data/countries/${countryId}/states`, method: 'GET'
    }, options);
};
export const listCities = (stateId: string, options?: ApiRequestOptions) => {
    return apiClient<ListCities200>({ url: `/api/v1/master-data/states/${stateId}/cities`, method: 'GET'
    }, options);
};
export const createState = (createStateBody?: CreateStateBody, options?: ApiRequestOptions) => {
    return apiClient<CreateState200>({ url: `/api/v1/master-data/states`, method: 'POST',
        headers: { 'Content-Type': 'application/json', },
        data: createStateBody
    }, options);
};
export const createCity = (createCityBody?: CreateCityBody, options?: ApiRequestOptions) => {
    return apiClient<CreateCity200>({ url: `/api/v1/master-data/cities`, method: 'POST',
        headers: { 'Content-Type': 'application/json', },
        data: createCityBody
    }, options);
};
export const listBusinessCategories = (options?: ApiRequestOptions) => {
    return apiClient<ListBusinessCategories200>({ url: `/api/v1/master-data/business-categories`, method: 'GET'
    }, options);
};
export const listBankAccountTypes = (options?: ApiRequestOptions) => {
    return apiClient<ListBankAccountTypes200>({ url: `/api/v1/master-data/bank-account-types`, method: 'GET'
    }, options);
};
export const listCustomerIdTypes = (options?: ApiRequestOptions) => {
    return apiClient<ListCustomerIdTypes200>({ url: `/api/v1/master-data/customer-id-types`, method: 'GET'
    }, options);
};
export const listMandateMethods = (options?: ApiRequestOptions) => {
    return apiClient<ListMandateMethods200>({ url: `/api/v1/master-data/mandate-methods`, method: 'GET'
    }, options);
};
export const updateCountry = (id: string, updateCountryBody?: UpdateCountryBody, options?: ApiRequestOptions) => {
    return apiClient<UpdateCountry200>({ url: `/api/v1/master-data/countries/${id}`, method: 'PATCH',
        headers: { 'Content-Type': 'application/json', },
        data: updateCountryBody
    }, options);
};
export const updateState = (id: string, updateStateBody?: UpdateStateBody, options?: ApiRequestOptions) => {
    return apiClient<UpdateState200>({ url: `/api/v1/master-data/states/${id}`, method: 'PATCH',
        headers: { 'Content-Type': 'application/json', },
        data: updateStateBody
    }, options);
};
export const updateCity = (id: string, updateCityBody?: UpdateCityBody, options?: ApiRequestOptions) => {
    return apiClient<UpdateCity200>({ url: `/api/v1/master-data/cities/${id}`, method: 'PATCH',
        headers: { 'Content-Type': 'application/json', },
        data: updateCityBody
    }, options);
};
export const updateBusinessCategory = (id: string, updateBusinessCategoryBody?: UpdateBusinessCategoryBody, options?: ApiRequestOptions) => {
    return apiClient<UpdateBusinessCategory200>({ url: `/api/v1/master-data/business-categories/${id}`, method: 'PATCH',
        headers: { 'Content-Type': 'application/json', },
        data: updateBusinessCategoryBody
    }, options);
};
export const updateBankAccountType = (id: string, updateBankAccountTypeBody?: UpdateBankAccountTypeBody, options?: ApiRequestOptions) => {
    return apiClient<UpdateBankAccountType200>({ url: `/api/v1/master-data/bank-account-types/${id}`, method: 'PATCH',
        headers: { 'Content-Type': 'application/json', },
        data: updateBankAccountTypeBody
    }, options);
};
export const updateCustomerIdType = (id: string, updateCustomerIdTypeBody?: UpdateCustomerIdTypeBody, options?: ApiRequestOptions) => {
    return apiClient<UpdateCustomerIdType200>({ url: `/api/v1/master-data/customer-id-types/${id}`, method: 'PATCH',
        headers: { 'Content-Type': 'application/json', },
        data: updateCustomerIdTypeBody
    }, options);
};
export const updateMandateMethod = (id: string, updateMandateMethodBody?: UpdateMandateMethodBody, options?: ApiRequestOptions) => {
    return apiClient<UpdateMandateMethod200>({ url: `/api/v1/master-data/mandate-methods/${id}`, method: 'PATCH',
        headers: { 'Content-Type': 'application/json', },
        data: updateMandateMethodBody
    }, options);
};
