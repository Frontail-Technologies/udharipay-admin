import type { PlanFrequency } from "../common";
export interface PlatformSettings {
    atRiskAfterDays: number;
    defaultFrequency: PlanFrequency;
    allowedFrequencies: PlanFrequency[];
    updatedAt: string;
}
export type GetPlatformSettings200 = {
    data: PlatformSettings;
};
export type UpdatePlatformSettingsBodyDefaultFrequency = typeof UpdatePlatformSettingsBodyDefaultFrequency[keyof typeof UpdatePlatformSettingsBodyDefaultFrequency];
export const UpdatePlatformSettingsBodyDefaultFrequency = {
    daily: 'daily',
    weekly: 'weekly',
    monthly: 'monthly',
} as const;
export type UpdatePlatformSettingsBodyAllowedFrequenciesItem = typeof UpdatePlatformSettingsBodyAllowedFrequenciesItem[keyof typeof UpdatePlatformSettingsBodyAllowedFrequenciesItem];
export const UpdatePlatformSettingsBodyAllowedFrequenciesItem = {
    daily: 'daily',
    weekly: 'weekly',
    monthly: 'monthly',
} as const;
export type UpdatePlatformSettingsBody = {
    atRiskAfterDays?: number;
    defaultFrequency?: UpdatePlatformSettingsBodyDefaultFrequency;
    allowedFrequencies?: UpdatePlatformSettingsBodyAllowedFrequenciesItem[];
};
export type UpdatePlatformSettings200 = {
    data: PlatformSettings;
};
export type GetSystemStatus200DataPayments = {
    provider: string;
    enabled: boolean;
};
export type GetSystemStatus200DataDocumentStorage = {
    provider: string;
    configured: boolean;
};
export type GetSystemStatus200DataPush = {
    provider: string;
};
export type GetSystemStatus200DataWhatsapp = {
    provider: string;
};
export type GetSystemStatus200DataMandates = {
    provider: string;
};
export type GetSystemStatus200DataMobileOtp = {
    mode: string;
};
export type GetSystemStatus200DataCommunicationsWorker = {
    enabled: boolean;
};
export type GetSystemStatus200Data = {
    environment: string;
    payments: GetSystemStatus200DataPayments;
    documentStorage: GetSystemStatus200DataDocumentStorage;
    push: GetSystemStatus200DataPush;
    whatsapp: GetSystemStatus200DataWhatsapp;
    mandates: GetSystemStatus200DataMandates;
    mobileOtp: GetSystemStatus200DataMobileOtp;
    communicationsWorker: GetSystemStatus200DataCommunicationsWorker;
};
export type GetSystemStatus200 = {
    data: GetSystemStatus200Data;
};
