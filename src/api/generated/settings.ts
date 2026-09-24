import type { GetPlatformSettings200, GetSystemStatus200, UpdatePlatformSettings200, UpdatePlatformSettingsBody } from "./contracts/settings";
import { apiClient, type ApiRequestOptions } from "../http/client";
export const getPlatformSettings = (options?: ApiRequestOptions) => {
    return apiClient<GetPlatformSettings200>({ url: `/api/v1/admin/settings`, method: 'GET'
    }, options);
};
export const updatePlatformSettings = (updatePlatformSettingsBody?: UpdatePlatformSettingsBody, options?: ApiRequestOptions) => {
    return apiClient<UpdatePlatformSettings200>({ url: `/api/v1/admin/settings`, method: 'PATCH',
        headers: { 'Content-Type': 'application/json', },
        data: updatePlatformSettingsBody
    }, options);
};
export const getSystemStatus = (options?: ApiRequestOptions) => {
    return apiClient<GetSystemStatus200>({ url: `/api/v1/admin/system-status`, method: 'GET'
    }, options);
};
