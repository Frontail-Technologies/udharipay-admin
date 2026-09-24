import type { GetUnreadNotificationCount200, ListNotifications200, ListNotificationsParams, ReadAllNotifications200, ReadNotification200, RegisterPushDevice201, RegisterPushDeviceBody, UnregisterPushDevice200 } from "./contracts/notifications";
import { apiClient, type ApiRequestOptions } from "../http/client";
export const listNotifications = (params?: ListNotificationsParams, options?: ApiRequestOptions) => {
    return apiClient<ListNotifications200>({ url: `/api/v1/notifications`, method: 'GET',
        params
    }, options);
};
export const getUnreadNotificationCount = (options?: ApiRequestOptions) => {
    return apiClient<GetUnreadNotificationCount200>({ url: `/api/v1/notifications/unread-count`, method: 'GET'
    }, options);
};
export const readAllNotifications = (options?: ApiRequestOptions) => {
    return apiClient<ReadAllNotifications200>({ url: `/api/v1/notifications/read-all`, method: 'POST'
    }, options);
};
export const readNotification = (notificationId: string, options?: ApiRequestOptions) => {
    return apiClient<ReadNotification200>({ url: `/api/v1/notifications/${notificationId}/read`, method: 'PATCH'
    }, options);
};
export const registerPushDevice = (registerPushDeviceBody?: RegisterPushDeviceBody, options?: ApiRequestOptions) => {
    return apiClient<RegisterPushDevice201>({ url: `/api/v1/notifications/devices`, method: 'POST',
        headers: { 'Content-Type': 'application/json', },
        data: registerPushDeviceBody
    }, options);
};
export const unregisterPushDevice = (deviceId: string, options?: ApiRequestOptions) => {
    return apiClient<UnregisterPushDevice200>({ url: `/api/v1/notifications/devices/${deviceId}`, method: 'DELETE'
    }, options);
};
