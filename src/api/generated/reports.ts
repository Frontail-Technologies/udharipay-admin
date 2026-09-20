import type { ExportReportParams, GetReport200, GetReportParams, ReportKind } from "./contracts/reports";
import { apiClient, type ApiRequestOptions } from "../http/client";
export const getReport = (report: ReportKind, params?: GetReportParams, options?: ApiRequestOptions) => {
    return apiClient<GetReport200>({ url: `/api/v1/reports/${report}`, method: 'GET',
        params
    }, options);
};
export const exportReport = (report: ReportKind, params: ExportReportParams, options?: ApiRequestOptions) => {
    return apiClient<Blob>({ url: `/api/v1/reports/${report}/export`, method: 'GET',
        params,
        responseType: 'blob'
    }, options);
};
