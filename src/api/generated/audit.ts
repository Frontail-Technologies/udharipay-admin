import type { GetAuditEvent200, ListAuditEvents200, ListAuditEventsParams } from "./contracts/audit";
import { apiClient, type ApiRequestOptions } from "../http/client";
export const listAuditEvents = (params?: ListAuditEventsParams, options?: ApiRequestOptions) => {
    return apiClient<ListAuditEvents200>({ url: `/api/v1/audit-events`, method: 'GET',
        params
    }, options);
};
export const getAuditEvent = (auditEventId: string, options?: ApiRequestOptions) => {
    return apiClient<GetAuditEvent200>({ url: `/api/v1/audit-events/${auditEventId}`, method: 'GET'
    }, options);
};
