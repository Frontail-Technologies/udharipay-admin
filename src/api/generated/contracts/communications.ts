import type { CursorPagination } from "../common";
export type TemplateApprovalStatus = typeof TemplateApprovalStatus[keyof typeof TemplateApprovalStatus];
export const TemplateApprovalStatus = {
    draft: 'draft',
    pending_approval: 'pending_approval',
    approved: 'approved',
    rejected: 'rejected',
    disabled: 'disabled',
} as const;
export interface WhatsAppTemplateVersion {
    version: number;
    language: string;
    bodyTemplate: string;
    providerTemplateName: string | null;
    providerTemplateId: string | null;
    approvalStatus: TemplateApprovalStatus;
    isActive: boolean;
    createdAt: string;
    activatedAt: string | null;
}
export interface WhatsAppTemplate {
    templateKey: string;
    displayName: string;
    description: string | null;
    isEnabled: boolean;
    activeVersion: WhatsAppTemplateVersion | null;
    versions: WhatsAppTemplateVersion[];
    allowedVariables: string[];
    updatedAt: string;
}
export type AnnouncementAudienceType = typeof AnnouncementAudienceType[keyof typeof AnnouncementAudienceType];
export const AnnouncementAudienceType = {
    merchants: 'merchants',
    employees: 'employees',
    both: 'both',
    selected_users: 'selected_users',
} as const;
export type AnnouncementStatus = typeof AnnouncementStatus[keyof typeof AnnouncementStatus];
export const AnnouncementStatus = {
    sending: 'sending',
    sent: 'sent',
    failed: 'failed',
} as const;
export interface Announcement {
    publicId: string;
    title: string;
    body: string;
    audienceType: AnnouncementAudienceType;
    actionTarget: string | null;
    status: AnnouncementStatus;
    targetedRecipients: number;
    notificationsCreated: number;
    devicesTargeted: number;
    pushAccepted: number;
    pushFailed: number;
    pushPending: number;
    sentAt: string | null;
    createdAt: string;
}
export interface AnnouncementPreview {
    recipientCount: number;
    merchantRecipients: number;
    employeeRecipients: number;
    activeDevices: number;
    withinLimit: boolean;
}
export interface AnnouncementRecipientOption {
    userId: string;
    label: string;
    detail: string | null;
}
export type AnnouncementAudience = typeof AnnouncementAudience[keyof typeof AnnouncementAudience];
export const AnnouncementAudience = {
    merchants: 'merchants',
    employees: 'employees',
    both: 'both',
    selected_users: 'selected_users',
} as const;
export type NotificationActionTarget = typeof NotificationActionTarget[keyof typeof NotificationActionTarget];
export const NotificationActionTarget = {
    dashboard: 'dashboard',
    collections: 'collections',
    kyc: 'kyc',
    billing: 'billing',
    notifications: 'notifications',
    payments: 'payments',
    mandates: 'mandates',
    customer: 'customer',
    plan: 'plan',
} as const;
export type ListWhatsAppTemplates200Data = {
    items: WhatsAppTemplate[];
};
export type ListWhatsAppTemplates200 = {
    data: ListWhatsAppTemplates200Data;
};
export type GetWhatsAppTemplate200 = {
    data: WhatsAppTemplate;
};
export type UpdateWhatsAppTemplateBody = {
    displayName?: string;
    description?: string | null;
    isEnabled?: boolean;
};
export type UpdateWhatsAppTemplate200 = {
    data: WhatsAppTemplate;
};
export type PreviewWhatsAppTemplateBody = {
    bodyTemplate: string;
};
export type PreviewWhatsAppTemplate200DataSampleValues = {
    [key: string]: string;
};
export type PreviewWhatsAppTemplate200Data = {
    preview: string;
    sampleValues: PreviewWhatsAppTemplate200DataSampleValues;
};
export type PreviewWhatsAppTemplate200 = {
    data: PreviewWhatsAppTemplate200Data;
};
export type CreateWhatsAppTemplateVersionBody = {
    language?: string;
    bodyTemplate: string;
    providerTemplateName?: string;
    providerTemplateId?: string;
};
export type CreateWhatsAppTemplateVersion201 = {
    data: WhatsAppTemplateVersion;
};
export type UpdateWhatsAppTemplateVersionBody = {
    bodyTemplate?: string;
    approvalStatus?: TemplateApprovalStatus;
    providerTemplateName?: string | null;
    providerTemplateId?: string | null;
};
export type UpdateWhatsAppTemplateVersion200 = {
    data: WhatsAppTemplateVersion;
};
export type DeleteWhatsAppTemplateVersion200Data = {
    deleted: boolean;
};
export type DeleteWhatsAppTemplateVersion200 = {
    data: DeleteWhatsAppTemplateVersion200Data;
};
export type ActivateWhatsAppTemplateVersion200 = {
    data: WhatsAppTemplate;
};
export type SearchAnnouncementRecipientsParams = {
    role: SearchAnnouncementRecipientsRole;
    search?: string;
    limit?: number;
};
export type SearchAnnouncementRecipientsRole = typeof SearchAnnouncementRecipientsRole[keyof typeof SearchAnnouncementRecipientsRole];
export const SearchAnnouncementRecipientsRole = {
    merchant: 'merchant',
    employee: 'employee',
} as const;
export type SearchAnnouncementRecipients200Data = {
    items: AnnouncementRecipientOption[];
};
export type SearchAnnouncementRecipients200 = {
    data: SearchAnnouncementRecipients200Data;
};
export type PreviewAnnouncementBody = {
    audienceType: AnnouncementAudience;
    userIds?: string[];
};
export type PreviewAnnouncement200 = {
    data: AnnouncementPreview;
};
export type CreateAnnouncementBody = {
    audienceType: AnnouncementAudience;
    userIds?: string[];
    title: string;
    body: string;
    actionTarget?: NotificationActionTarget;
    confirmRecipientCount: number;
    idempotencyKey: string;
};
export type CreateAnnouncement201 = {
    data: Announcement;
};
export type ListAnnouncementsParams = {
    limit?: number;
    cursor?: string;
};
export type ListAnnouncements200Data = {
    items: Announcement[];
    pagination: CursorPagination;
};
export type ListAnnouncements200 = {
    data: ListAnnouncements200Data;
};
export type GetAnnouncement200 = {
    data: Announcement;
};
