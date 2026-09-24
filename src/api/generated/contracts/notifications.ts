import type { CursorPagination } from "../common";
export type NotificationCategory = typeof NotificationCategory[keyof typeof NotificationCategory];
export const NotificationCategory = {
    collections: 'collections',
    payments: 'payments',
    mandates: 'mandates',
    kyc: 'kyc',
    billing: 'billing',
    system: 'system',
} as const;
export interface Notification {
    publicId: string;
    type: string;
    category: NotificationCategory;
    title: string;
    body: string;
    entityType: string | null;
    entityId: string | null;
    actionTarget: string | null;
    readAt: string | null;
    createdAt: string;
}
export interface PushDevice {
    deviceId: string;
    platform: string;
    provider: string;
    isActive: boolean;
    lastSeenAt: string;
}
export type ListNotificationsParams = {
    limit?: number;
    cursor?: string;
    unreadOnly?: ListNotificationsUnreadOnly;
};
export type ListNotificationsUnreadOnly = typeof ListNotificationsUnreadOnly[keyof typeof ListNotificationsUnreadOnly];
export const ListNotificationsUnreadOnly = {
    true: 'true',
    false: 'false',
} as const;
export type ListNotifications200Data = {
    items: Notification[];
    pagination: CursorPagination;
};
export type ListNotifications200 = {
    data: ListNotifications200Data;
};
export type GetUnreadNotificationCount200Data = {
    unreadCount: number;
};
export type GetUnreadNotificationCount200 = {
    data: GetUnreadNotificationCount200Data;
};
export type ReadAllNotifications200Data = {
    updated: number;
};
export type ReadAllNotifications200 = {
    data: ReadAllNotifications200Data;
};
export type ReadNotification200 = {
    data: Notification;
};
export type RegisterPushDeviceBodyPlatform = typeof RegisterPushDeviceBodyPlatform[keyof typeof RegisterPushDeviceBodyPlatform];
export const RegisterPushDeviceBodyPlatform = {
    ios: 'ios',
    android: 'android',
} as const;
export type RegisterPushDeviceBodyProvider = typeof RegisterPushDeviceBodyProvider[keyof typeof RegisterPushDeviceBodyProvider];
export const RegisterPushDeviceBodyProvider = {
    fcm: 'fcm',
    apns: 'apns',
    expo: 'expo',
} as const;
export type RegisterPushDeviceBody = {
    platform: RegisterPushDeviceBodyPlatform;
    provider: RegisterPushDeviceBodyProvider;
    token: string;
    deviceId: string;
};
export type RegisterPushDevice201 = {
    data: PushDevice;
};
export type UnregisterPushDevice200Data = {
    deactivated: number;
};
export type UnregisterPushDevice200 = {
    data: UnregisterPushDevice200Data;
};
