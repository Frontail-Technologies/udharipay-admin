"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  activateWhatsAppTemplateVersion,
  createAnnouncement,
  createWhatsAppTemplateVersion,
  listAnnouncements,
  listWhatsAppTemplates,
  previewAnnouncement,
  previewWhatsAppTemplate,
  searchAnnouncementRecipients,
  updateWhatsAppTemplate,
  updateWhatsAppTemplateVersion,
} from "@/api/generated/communications";
import { listCustomerReminders } from "@/api/generated/customers";
import type {
  CreateAnnouncementBody,
  CreateWhatsAppTemplateVersionBody,
  ListAnnouncementsParams,
  PreviewAnnouncementBody,
  SearchAnnouncementRecipientsParams,
  UpdateWhatsAppTemplateBody,
  UpdateWhatsAppTemplateVersionBody,
} from "@/api/generated/contracts/communications";
import type { ListCustomerRemindersParams } from "@/api/generated/contracts/customers";

export const communicationKeys = {
  all: ["communications"] as const,
  templates: () => [...communicationKeys.all, "templates"] as const,
  announcements: () => [...communicationKeys.all, "announcements"] as const,
  announcementList: (params: ListAnnouncementsParams) => [...communicationKeys.announcements(), params] as const,
  recipients: (params: SearchAnnouncementRecipientsParams) => [...communicationKeys.all, "recipients", params] as const,
  customerReminders: (customerId: string, params: ListCustomerRemindersParams) => [...communicationKeys.all, "customer-reminders", customerId, params] as const,
};

export function useWhatsAppTemplates() {
  return useQuery({ queryKey: communicationKeys.templates(), queryFn: ({ signal }) => listWhatsAppTemplates({ signal }) });
}

export function useUpdateWhatsAppTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ templateKey, input }: { templateKey: string; input: UpdateWhatsAppTemplateBody }) => updateWhatsAppTemplate(templateKey, input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: communicationKeys.templates() });
      toast.success("Template updated");
    },
  });
}

export function useCreateTemplateVersion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ templateKey, input }: { templateKey: string; input: CreateWhatsAppTemplateVersionBody }) => createWhatsAppTemplateVersion(templateKey, input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: communicationKeys.templates() });
      toast.success("Template version created");
    },
  });
}

export function useUpdateTemplateVersion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ templateKey, version, input }: { templateKey: string; version: number; input: UpdateWhatsAppTemplateVersionBody }) => updateWhatsAppTemplateVersion(templateKey, version, input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: communicationKeys.templates() });
      toast.success("Template version updated");
    },
  });
}

export function useActivateTemplateVersion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ templateKey, version }: { templateKey: string; version: number }) => activateWhatsAppTemplateVersion(templateKey, version),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: communicationKeys.templates() });
      toast.success("Template version activated");
    },
  });
}

export function usePreviewTemplate() {
  return useMutation({ mutationFn: ({ templateKey, bodyTemplate }: { templateKey: string; bodyTemplate: string }) => previewWhatsAppTemplate(templateKey, { bodyTemplate }) });
}

export function useAnnouncements(params: ListAnnouncementsParams) {
  return useQuery({ queryKey: communicationKeys.announcementList(params), queryFn: ({ signal }) => listAnnouncements(params, { signal }) });
}

export function useAnnouncementRecipients(params: SearchAnnouncementRecipientsParams, enabled: boolean) {
  return useQuery({ queryKey: communicationKeys.recipients(params), queryFn: ({ signal }) => searchAnnouncementRecipients(params, { signal }), enabled });
}

export function usePreviewAnnouncement() {
  return useMutation({ mutationFn: (input: PreviewAnnouncementBody) => previewAnnouncement(input) });
}

export function useCreateAnnouncement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateAnnouncementBody) => createAnnouncement(input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: communicationKeys.announcements() });
      toast.success("Announcement sent");
    },
  });
}

export function useCustomerReminders(customerId: string, params: ListCustomerRemindersParams) {
  return useQuery({ queryKey: communicationKeys.customerReminders(customerId, params), queryFn: ({ signal }) => listCustomerReminders(customerId, params, { signal }) });
}
