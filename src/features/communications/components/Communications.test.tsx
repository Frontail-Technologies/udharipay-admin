import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Announcement, WhatsAppTemplate } from "@/api/generated/contracts/communications";
import { AnnouncementsPanel } from "./AnnouncementsPanel";
import { CustomerRemindersSection } from "./CustomerRemindersSection";
import { TemplatesPanel } from "./TemplatesPanel";

const hooks = vi.hoisted(() => ({
  useWhatsAppTemplates: vi.fn(),
  useUpdateWhatsAppTemplate: vi.fn(),
  useCreateTemplateVersion: vi.fn(),
  useUpdateTemplateVersion: vi.fn(),
  useActivateTemplateVersion: vi.fn(),
  usePreviewTemplate: vi.fn(),
  useAnnouncements: vi.fn(),
  useAnnouncementRecipients: vi.fn(),
  usePreviewAnnouncement: vi.fn(),
  useCreateAnnouncement: vi.fn(),
  useCustomerReminders: vi.fn(),
}));
vi.mock("@/features/communications/hooks/useCommunications", () => hooks);

const idle = () => ({ isPending: false, mutateAsync: vi.fn().mockResolvedValue({}) });

const template: WhatsAppTemplate = {
  templateKey: "payment_due_today",
  displayName: "Payment Due Today",
  description: null,
  isEnabled: true,
  activeVersion: null as unknown as WhatsAppTemplate["activeVersion"],
  allowedVariables: ["customerName"],
  updatedAt: "2026-09-22T08:30:00.000Z",
  versions: [
    { version: 1, language: "en", bodyTemplate: "Hi {{customerName}}", providerTemplateName: null, providerTemplateId: null, approvalStatus: "approved", isActive: false, createdAt: "2026-09-22T08:30:00.000Z", activatedAt: null },
    { version: 2, language: "en", bodyTemplate: "Draft body", providerTemplateName: null, providerTemplateId: null, approvalStatus: "draft", isActive: false, createdAt: "2026-09-22T08:30:00.000Z", activatedAt: null },
  ],
};

const announcement: Announcement = {
  publicId: "ANN-0123456789AB",
  title: "Maintenance tonight",
  body: "Downtime at 11pm",
  audienceType: "both",
  actionTarget: null,
  status: "sent",
  targetedRecipients: 4,
  notificationsCreated: 4,
  devicesTargeted: 3,
  pushAccepted: 2,
  pushFailed: 1,
  pushPending: 0,
  sentAt: "2026-09-22T08:30:00.000Z",
  createdAt: "2026-09-22T08:30:00.000Z",
};

beforeEach(() => {
  vi.clearAllMocks();
  hooks.useUpdateWhatsAppTemplate.mockReturnValue(idle());
  hooks.useCreateTemplateVersion.mockReturnValue(idle());
  hooks.useUpdateTemplateVersion.mockReturnValue(idle());
  hooks.useActivateTemplateVersion.mockReturnValue(idle());
  hooks.usePreviewTemplate.mockReturnValue({ ...idle(), data: undefined });
  hooks.useAnnouncementRecipients.mockReturnValue({ isPending: false, data: { data: { items: [] } } });
});

describe("TemplatesPanel", () => {
  beforeEach(() => hooks.useWhatsAppTemplates.mockReturnValue({ isPending: false, isError: false, data: { data: { items: [template] } } }));

  it("only offers activation for approved inactive versions", () => {
    render(<TemplatesPanel />);
    expect(screen.getAllByRole("button", { name: "Activate" })).toHaveLength(1);
    expect(screen.getByText("No active version — reminders using this template will not be sent.")).toBeTruthy();
  });

  it("activates the approved version through the backend", async () => {
    const activate = idle();
    hooks.useActivateTemplateVersion.mockReturnValue(activate);
    render(<TemplatesPanel />);
    fireEvent.click(screen.getByRole("button", { name: "Activate" }));
    await waitFor(() => expect(activate.mutateAsync).toHaveBeenCalledWith({ templateKey: "payment_due_today", version: 1 }));
  });

  it("submits a draft for approval", async () => {
    const update = idle();
    hooks.useUpdateTemplateVersion.mockReturnValue(update);
    render(<TemplatesPanel />);
    fireEvent.click(screen.getByRole("button", { name: "Submit for approval" }));
    await waitFor(() => expect(update.mutateAsync).toHaveBeenCalledWith({ templateKey: "payment_due_today", version: 2, input: { approvalStatus: "pending_approval" } }));
  });
});

describe("AnnouncementsPanel", () => {
  beforeEach(() => hooks.useAnnouncements.mockReturnValue({ isPending: false, isError: false, data: { data: { items: [announcement], pagination: { nextCursor: null } } } }));

  it("shows the delivery summary from the backend", () => {
    render(<AnnouncementsPanel />);
    expect(screen.getByText("Maintenance tonight")).toBeTruthy();
    expect(screen.getByText("Push accepted: 2")).toBeTruthy();
    expect(screen.getByText("Devices targeted: 3")).toBeTruthy();
  });

  it("requires a recipient-count confirmation before sending", async () => {
    const preview = { isPending: false, mutateAsync: vi.fn().mockResolvedValue({ data: { recipientCount: 4, merchantRecipients: 3, employeeRecipients: 1, activeDevices: 3, withinLimit: true } }) };
    const create = idle();
    hooks.usePreviewAnnouncement.mockReturnValue(preview);
    hooks.useCreateAnnouncement.mockReturnValue(create);
    render(<AnnouncementsPanel />);
    fireEvent.click(screen.getByRole("button", { name: /New Announcement/ }));
    fireEvent.change(screen.getByLabelText("Title"), { target: { value: "Hello" } });
    fireEvent.change(screen.getByLabelText("Message"), { target: { value: "World" } });
    expect(screen.queryByRole("button", { name: /Send to/ })).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Review Recipients" }));
    const send = await screen.findByRole("button", { name: "Send to 4" });
    fireEvent.click(send);
    await waitFor(() => expect(create.mutateAsync).toHaveBeenCalledWith(expect.objectContaining({ audienceType: "both", title: "Hello", body: "World", confirmRecipientCount: 4, idempotencyKey: expect.any(String) })));
  });

  it("keeps Review Recipients disabled until the message is complete", () => {
    render(<AnnouncementsPanel />);
    fireEvent.click(screen.getByRole("button", { name: /New Announcement/ }));
    expect((screen.getByRole("button", { name: "Review Recipients" }) as HTMLButtonElement).disabled).toBe(true);
  });
});

describe("CustomerRemindersSection", () => {
  it("shows reminder status, template version and cancellation", () => {
    hooks.useCustomerReminders.mockReturnValue({
      isPending: false,
      isError: false,
      data: { data: { items: [{ publicId: "REM-0123456789AB", channel: "whatsapp", type: "payment.overdue", status: "cancelled", templateKey: "payment_overdue", templateVersion: 2, scheduledFor: "2026-09-22T08:30:00.000Z", sentAt: null, deliveredAt: null, failedAt: null, cancelledAt: "2026-09-22T09:30:00.000Z", failureCode: null, failureReason: null, attemptCount: 0, installmentId: null, installmentNumber: 3, dueDate: "2026-09-20", createdAt: "2026-09-22T08:30:00.000Z" }], pagination: { nextCursor: null } } },
    });
    render(<CustomerRemindersSection customerId="customer-id" />);
    expect(screen.getByText("Overdue")).toBeTruthy();
    expect(screen.getByText("Cancelled")).toBeTruthy();
    expect(screen.getByText(/payment_overdue v2/)).toBeTruthy();
  });

  it("renders an empty state", () => {
    hooks.useCustomerReminders.mockReturnValue({ isPending: false, isError: false, data: { data: { items: [], pagination: { nextCursor: null } } } });
    render(<CustomerRemindersSection customerId="customer-id" />);
    expect(screen.getByText("No reminders have been scheduled for this customer.")).toBeTruthy();
  });
});
