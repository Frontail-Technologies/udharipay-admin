import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { BillingPlan } from "@/api/generated/contracts/billing";
import { BillingConfigurationSection } from "./BillingConfigurationSection";

const useBillingSettings = vi.hoisted(() => vi.fn());
const useBillingPlans = vi.hoisted(() => vi.fn());
const settingsMutation = vi.hoisted(() => ({ isPending: false, mutateAsync: vi.fn() }));
const planMutation = vi.hoisted(() => ({ isPending: false, mutateAsync: vi.fn() }));
vi.mock("@/features/billing/hooks/useBilling", () => ({
  useBillingSettings,
  useBillingPlans,
  useUpdateBillingSettings: () => settingsMutation,
  useUpdateBillingPlan: () => planMutation,
}));

const standard: BillingPlan = { code: "standard", name: "Standard", monthlyAmountPaise: "349900", isActive: true, displayOrder: 0, updatedAt: "2026-09-22T08:30:00.000Z" };

beforeEach(() => {
  vi.clearAllMocks();
  settingsMutation.isPending = false;
  settingsMutation.mutateAsync.mockResolvedValue({});
  planMutation.isPending = false;
  planMutation.mutateAsync.mockResolvedValue({});
  useBillingSettings.mockReturnValue({ isPending: false, isError: false, data: { data: { activationFeePaise: "49900", updatedAt: "2026-09-22T08:30:00.000Z" } } });
  useBillingPlans.mockReturnValue({ isPending: false, isError: false, data: { data: { items: [standard] } } });
});

describe("BillingConfigurationSection", () => {
  it("renders the canonical activation fee and plan price as real money, not raw paise", () => {
    render(<BillingConfigurationSection />);
    expect(screen.getByText("₹499")).toBeInTheDocument();
    expect(screen.getByText("₹3,499")).toBeInTheDocument();
  });

  it("submits the activation fee edit as a precise paise string", async () => {
    render(<BillingConfigurationSection />);
    fireEvent.click(screen.getByRole("button", { name: "Edit Activation Fee" }));
    fireEvent.change(screen.getByLabelText("Activation Fee (₹)"), { target: { value: "599.50" } });
    fireEvent.click(screen.getByRole("button", { name: "Save Changes" }));
    await waitFor(() => expect(settingsMutation.mutateAsync).toHaveBeenCalledWith({ activationFeePaise: "59950" }));
  });

  it("submits a plan price edit as a precise paise string", async () => {
    render(<BillingConfigurationSection />);
    fireEvent.click(screen.getByRole("button", { name: "Edit" }));
    fireEvent.change(screen.getByLabelText("Monthly Price (₹)"), { target: { value: "444.00" } });
    fireEvent.click(screen.getByRole("button", { name: "Save Changes" }));
    await waitFor(() => expect(planMutation.mutateAsync).toHaveBeenCalledWith({ planCode: "standard", input: { name: "Standard", monthlyAmountPaise: "44400", isActive: true } }));
  });

  it("submits a plan disable as isActive false", async () => {
    render(<BillingConfigurationSection />);
    fireEvent.click(screen.getByRole("button", { name: "Edit" }));
    fireEvent.click(screen.getByLabelText(/Active — selectable for new subscriptions/));
    fireEvent.click(screen.getByRole("button", { name: "Save Changes" }));
    await waitFor(() => expect(planMutation.mutateAsync).toHaveBeenCalledWith({ planCode: "standard", input: { name: "Standard", monthlyAmountPaise: "349900", isActive: false } }));
  });

  it("shows a real error state for a failed settings load", () => {
    useBillingSettings.mockReturnValue({ isPending: false, isError: true, error: new Error("Unavailable"), data: undefined });
    render(<BillingConfigurationSection />);
    expect(screen.getByText("Unavailable")).toBeInTheDocument();
  });
});
