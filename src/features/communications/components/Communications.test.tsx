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
    { version: 1, language: "en", bodyTemplate: "Hi {{customerName}}", providerTemplateName: "due_today_v1", providerTemplateId: "tpl-1", approvalStatus: "draft", isActive: false, createdAt: "2026-09-22T08:30:00.000Z", activatedAt: null },
    { version: 2, language: "en", bodyTemplate: "Newer body", providerTemplateName: null, providerTemplateId: null, approvalStatus: "approved", isActive: false, createdAt: "2026-09-22T08:30:00.000Z", activatedAt: null },
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

  it("renders a compact summary with one status and a resolved preview", () => {
    render(<TemplatesPanel />);
    expect(screen.getByText("Payment Due Today")).toBeTruthy();
    expect(screen.getByText("Needs Setup")).toBeTruthy();
    expect(screen.getByText("Sent on the installment due date")).toBeTruthy();
    expect(screen.getByText(/Newer body/)).toBeTruthy();
    expect(screen.getAllByRole("button", { name: "Edit" })).toHaveLength(1);
  });

  it("keeps provider and version internals out of the main list", () => {
    render(<TemplatesPanel />);
    for (const text of [/Provider template/, /Version 1/, /Activate/, /Submit for Approval/, /Created/, /{{customerName}}/]) expect(screen.queryByText(text)).toBeNull();
  });

  it("opens advanced controls in Edit and activates an approved version", async () => {
    const activate = idle();
    hooks.useActivateTemplateVersion.mockReturnValue(activate);
    render(<TemplatesPanel />);
    fireEvent.click(screen.getByRole("button", { name: "Edit" }));
    expect(screen.getByText("Version History")).toBeTruthy();
    expect(screen.getByRole("button", { name: "New Version" })).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Activate" }));
    await waitFor(() => expect(activate.mutateAsync).toHaveBeenCalledWith({ templateKey: "payment_due_today", version: 2 }));
  });

  it("submits a draft for approval from its history row", async () => {
    const update = idle();
    hooks.useUpdateTemplateVersion.mockReturnValue(update);
    render(<TemplatesPanel />);
    fireEvent.click(screen.getByRole("button", { name: "Edit" }));
    fireEvent.click(screen.getByRole("button", { name: "Version 1" }));
    fireEvent.click(screen.getByRole("button", { name: "Submit for Approval" }));
    await waitFor(() => expect(update.mutateAsync).toHaveBeenCalledWith({ templateKey: "payment_due_today", version: 1, input: { approvalStatus: "pending_approval" } }));
  });

  it("resolves template variables in the preview", () => {
    const resolved = { ...template, versions: [{ ...template.versions[0], isActive: true, approvalStatus: "approved" as const }] };
    hooks.useWhatsAppTemplates.mockReturnValue({ isPending: false, isError: false, data: { data: { items: [resolved] } } });
    render(<TemplatesPanel />);
    expect(screen.getByText(/Hi Asha Rao/)).toBeTruthy();
  });

  it("derives an Active status from the active version", () => {
    const active = { ...template, versions: template.versions.map((version) => version.version === 2 ? { ...version, isActive: true } : version) };
    hooks.useWhatsAppTemplates.mockReturnValue({ isPending: false, isError: false, data: { data: { items: [active] } } });
    render(<TemplatesPanel />);
    expect(screen.getByText("Active")).toBeTruthy();
  });
});

describe("AnnouncementsPanel", () => {
  const withPush = { ...announcement, publicId: "ANN-0123456789AC", pushAccepted: 2, pushFailed: 1, devicesTargeted: 3 };
  const list = (items: Announcement[]) => hooks.useAnnouncements.mockReturnValue({ isPending: false, isError: false, data: { data: { items, pagination: { nextCursor: null } } } });

  it("shows a compact row without zero-value noise", () => {
    list([{ ...announcement, devicesTargeted: 0, pushAccepted: 0, pushFailed: 0 }]);
    render(<AnnouncementsPanel />);
    expect(screen.getByText("Maintenance tonight")).toBeTruthy();
    expect(screen.getByText("4 recipients")).toBeTruthy();
    expect(screen.getByText("4 in-app")).toBeTruthy();
    expect(screen.queryByText(/Devices targeted/)).toBeNull();
    expect(screen.queryByText(/^d+ push/)).toBeNull();
  });

  it("shows the disabled-push banner once", () => {
    list([{ ...announcement, devicesTargeted: 0, pushAccepted: 0, pushFailed: 0 }, { ...announcement, publicId: "ANN-0123456789AD", devicesTargeted: 0, pushAccepted: 0, pushFailed: 0 }]);
    render(<AnnouncementsPanel />);
    expect(screen.getAllByText(/Push delivery is not configured yet/)).toHaveLength(1);
  });

  it("hides the banner and surfaces failures when push was attempted", () => {
    list([withPush]);
    render(<AnnouncementsPanel />);
    expect(screen.queryByText(/not configured yet/)).toBeNull();
    expect(screen.getByText("1 push failed")).toBeTruthy();
    expect(screen.getByText("2 push")).toBeTruthy();
  });

  it("puts technical delivery stats in the detail view", () => {
    list([withPush]);
    render(<AnnouncementsPanel />);
    fireEvent.click(screen.getByRole("button", { name: "View" }));
    expect(screen.getByText("Devices targeted")).toBeTruthy();
    expect(screen.getByText("Push sent")).toBeTruthy();
  });

  it("requires a recipient-count confirmation before sending", async () => {
    list([announcement]);
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
    expect(await screen.findByText("Will notify 3 merchants and 1 employee")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Send to 4" }));
    await waitFor(() => expect(create.mutateAsync).toHaveBeenCalledWith(expect.objectContaining({ audienceType: "both", title: "Hello", body: "World", confirmRecipientCount: 4, idempotencyKey: expect.any(String) })));
  });

  it("keeps Review Recipients disabled until the message is complete", () => {
    list([announcement]);
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
