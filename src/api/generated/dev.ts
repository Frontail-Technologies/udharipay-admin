import type { ResolveMockEnach200, ResolveMockEnachBody } from "./contracts/dev";
import { apiClient, type ApiRequestOptions } from "../http/client";
export const resolveMockEnach = (providerReference: string, resolveMockEnachBody?: ResolveMockEnachBody, options?: ApiRequestOptions) => {
    return apiClient<ResolveMockEnach200>({ url: `/api/v1/dev/mock-enach/${providerReference}/resolve`, method: 'POST',
        headers: { 'Content-Type': 'application/json', },
        data: resolveMockEnachBody
    }, options);
};
