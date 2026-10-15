export interface MasterDataItem {
    id: string;
    code: string;
    name: string;
    isActive: boolean;
    sortOrder: number;
    createdAt: string;
    updatedAt: string;
}
export type StateItem = MasterDataItem & {
    countryId: string;
};
export type CityItem = MasterDataItem & {
    stateId: string;
};
export type ListCountries200Data = {
    items: MasterDataItem[];
};
export type ListCountries200 = {
    data: ListCountries200Data;
};
export type ListStates200Data = {
    items: StateItem[];
};
export type ListStates200 = {
    data: ListStates200Data;
};
export type ListCities200Data = {
    items: CityItem[];
};
export type ListCities200 = {
    data: ListCities200Data;
};
export type CreateStateBody = {
    countryId: string;
    code: string;
    name: string;
    sortOrder?: number;
};
export type CreateState200 = {
    data: StateItem;
};
export type CreateCityBody = {
    stateId: string;
    code: string;
    name: string;
    sortOrder?: number;
};
export type CreateCity200 = {
    data: CityItem;
};
export type ListBusinessCategories200Data = {
    items: MasterDataItem[];
};
export type ListBusinessCategories200 = {
    data: ListBusinessCategories200Data;
};
export type ListBankAccountTypes200Data = {
    items: MasterDataItem[];
};
export type ListBankAccountTypes200 = {
    data: ListBankAccountTypes200Data;
};
export type ListCustomerIdTypes200Data = {
    items: MasterDataItem[];
};
export type ListCustomerIdTypes200 = {
    data: ListCustomerIdTypes200Data;
};
export type ListMandateMethods200Data = {
    items: MasterDataItem[];
};
export type ListMandateMethods200 = {
    data: ListMandateMethods200Data;
};
export type UpdateCountryBody = {
    name?: string;
    isActive?: boolean;
    sortOrder?: number;
};
export type UpdateCountry200 = {
    data: MasterDataItem;
};
export type UpdateStateBody = {
    name?: string;
    isActive?: boolean;
    sortOrder?: number;
};
export type UpdateState200 = {
    data: StateItem;
};
export type UpdateCityBody = {
    name?: string;
    isActive?: boolean;
    sortOrder?: number;
};
export type UpdateCity200 = {
    data: CityItem;
};
export type UpdateBusinessCategoryBody = {
    name?: string;
    isActive?: boolean;
    sortOrder?: number;
};
export type UpdateBusinessCategory200 = {
    data: MasterDataItem;
};
export type UpdateBankAccountTypeBody = {
    name?: string;
    isActive?: boolean;
    sortOrder?: number;
};
export type UpdateBankAccountType200 = {
    data: MasterDataItem;
};
export type UpdateCustomerIdTypeBody = {
    name?: string;
    isActive?: boolean;
    sortOrder?: number;
};
export type UpdateCustomerIdType200 = {
    data: MasterDataItem;
};
export type UpdateMandateMethodBody = {
    name?: string;
    isActive?: boolean;
    sortOrder?: number;
};
export type UpdateMandateMethod200 = {
    data: MasterDataItem;
};
