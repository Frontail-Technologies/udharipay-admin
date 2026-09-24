import type { ActivateWhatsAppTemplateVersion200, CreateAnnouncement201, CreateAnnouncementBody, CreateWhatsAppTemplateVersion201, CreateWhatsAppTemplateVersionBody, DeleteWhatsAppTemplateVersion200, GetAnnouncement200, GetWhatsAppTemplate200, ListAnnouncements200, ListAnnouncementsParams, ListWhatsAppTemplates200, PreviewAnnouncement200, PreviewAnnouncementBody, PreviewWhatsAppTemplate200, PreviewWhatsAppTemplateBody, SearchAnnouncementRecipients200, SearchAnnouncementRecipientsParams, UpdateWhatsAppTemplate200, UpdateWhatsAppTemplateBody, UpdateWhatsAppTemplateVersion200, UpdateWhatsAppTemplateVersionBody } from "./contracts/communications";
import { apiClient, type ApiRequestOptions } from "../http/client";
export const listWhatsAppTemplates = (options?: ApiRequestOptions) => {
    return apiClient<ListWhatsAppTemplates200>({ url: `/api/v1/admin/communications/templates`, method: 'GET'
    }, options);
};
export const getWhatsAppTemplate = (templateKey: string, options?: ApiRequestOptions) => {
    return apiClient<GetWhatsAppTemplate200>({ url: `/api/v1/admin/communications/templates/${templateKey}`, method: 'GET'
    }, options);
};
export const updateWhatsAppTemplate = (templateKey: string, updateWhatsAppTemplateBody?: UpdateWhatsAppTemplateBody, options?: ApiRequestOptions) => {
    return apiClient<UpdateWhatsAppTemplate200>({ url: `/api/v1/admin/communications/templates/${templateKey}`, method: 'PATCH',
        headers: { 'Content-Type': 'application/json', },
        data: updateWhatsAppTemplateBody
    }, options);
};
export const previewWhatsAppTemplate = (templateKey: string, previewWhatsAppTemplateBody?: PreviewWhatsAppTemplateBody, options?: ApiRequestOptions) => {
    return apiClient<PreviewWhatsAppTemplate200>({ url: `/api/v1/admin/communications/templates/${templateKey}/preview`, method: 'POST',
        headers: { 'Content-Type': 'application/json', },
        data: previewWhatsAppTemplateBody
    }, options);
};
export const createWhatsAppTemplateVersion = (templateKey: string, createWhatsAppTemplateVersionBody?: CreateWhatsAppTemplateVersionBody, options?: ApiRequestOptions) => {
    return apiClient<CreateWhatsAppTemplateVersion201>({ url: `/api/v1/admin/communications/templates/${templateKey}/versions`, method: 'POST',
        headers: { 'Content-Type': 'application/json', },
        data: createWhatsAppTemplateVersionBody
    }, options);
};
export const updateWhatsAppTemplateVersion = (templateKey: string, version: number, updateWhatsAppTemplateVersionBody?: UpdateWhatsAppTemplateVersionBody, options?: ApiRequestOptions) => {
    return apiClient<UpdateWhatsAppTemplateVersion200>({ url: `/api/v1/admin/communications/templates/${templateKey}/versions/${version}`, method: 'PATCH',
        headers: { 'Content-Type': 'application/json', },
        data: updateWhatsAppTemplateVersionBody
    }, options);
};
export const deleteWhatsAppTemplateVersion = (templateKey: string, version: number, options?: ApiRequestOptions) => {
    return apiClient<DeleteWhatsAppTemplateVersion200>({ url: `/api/v1/admin/communications/templates/${templateKey}/versions/${version}`, method: 'DELETE'
    }, options);
};
export const activateWhatsAppTemplateVersion = (templateKey: string, version: number, options?: ApiRequestOptions) => {
    return apiClient<ActivateWhatsAppTemplateVersion200>({ url: `/api/v1/admin/communications/templates/${templateKey}/versions/${version}/activate`, method: 'POST'
    }, options);
};
export const searchAnnouncementRecipients = (params: SearchAnnouncementRecipientsParams, options?: ApiRequestOptions) => {
    return apiClient<SearchAnnouncementRecipients200>({ url: `/api/v1/admin/communications/announcement-recipients`, method: 'GET',
        params
    }, options);
};
export const previewAnnouncement = (previewAnnouncementBody?: PreviewAnnouncementBody, options?: ApiRequestOptions) => {
    return apiClient<PreviewAnnouncement200>({ url: `/api/v1/admin/communications/announcements/preview`, method: 'POST',
        headers: { 'Content-Type': 'application/json', },
        data: previewAnnouncementBody
    }, options);
};
export const createAnnouncement = (createAnnouncementBody?: CreateAnnouncementBody, options?: ApiRequestOptions) => {
    return apiClient<CreateAnnouncement201>({ url: `/api/v1/admin/communications/announcements`, method: 'POST',
        headers: { 'Content-Type': 'application/json', },
        data: createAnnouncementBody
    }, options);
};
export const listAnnouncements = (params?: ListAnnouncementsParams, options?: ApiRequestOptions) => {
    return apiClient<ListAnnouncements200>({ url: `/api/v1/admin/communications/announcements`, method: 'GET',
        params
    }, options);
};
export const getAnnouncement = (announcementId: string, options?: ApiRequestOptions) => {
    return apiClient<GetAnnouncement200>({ url: `/api/v1/admin/communications/announcements/${announcementId}`, method: 'GET'
    }, options);
};
