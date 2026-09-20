import type { GetHealth200 } from "./contracts/health";
import { apiClient, type ApiRequestOptions } from "../http/client";
export const getHealth = (options?: ApiRequestOptions) => {
    return apiClient<GetHealth200>({ url: `/health`, method: 'GET'
    }, options);
};
