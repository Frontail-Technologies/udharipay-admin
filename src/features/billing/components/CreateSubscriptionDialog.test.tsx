import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { BillingPlan } from "@/api/generated/contracts/billing";
import { CreateSubscriptionDialog } from "./CreateSubscriptionDialog";

const useBillingPlans = vi.hoisted(() => vi.fn());
const mutation = vi.hoisted(() => ({ isPending: false, mutateAsync: vi.fn() }));
vi.mock("@/features/billing/hooks/useBilling", () => ({ useBillingPlans, useCreateMerchantSubscription: () => mutation }));

const standard: BillingPlan = { code: "standard", name: "Standard", monthlyAmountPaise: "349900", isActive: true, displayOrder: 0, updatedAt: "2026-09-22T08:30:00.000Z" };
const legacy: BillingPlan = { code: "legacy", name: "Legacy", monthlyAmountPaise: "199900", isActive: false, displayOrder: 3, updatedAt: "2026-09-22T08:30:00.000Z" };

beforeEach(() => {
  vi.clearAllMocks();
  mutation.isPending = false;
  mutation.mutateAsync.mockResolvedValue({});
  useBillingPlans.mockReturnValue({ isPending: false, isError: false, data: { data: { items: [standard, legacy] } } });
});

describe("CreateSubscriptionDialog", () => {
  it("only offers active canonical plans, never an inactive one", () => {
    render(<CreateSubscriptionDialog merchantId="merchant-id" />);
    fireEvent.click(screen.getByRole("button", { name: "Create Subscription" }));
    const trigger = screen.getByLabelText("Plan");
    expect(trigger.textContent).toContain("Standard");
    expect(trigger.textContent).toContain("₹3,499");
    expect(trigger.textContent).not.toContain("Legacy");
  });

  it("submits the real plan code and start date with no hardcoded price", async () => {
    render(<CreateSubscriptionDialog merchantId="merchant-id" />);
    fireEvent.click(screen.getByRole("button", { name: "Create Subscription" }));
    fireEvent.change(screen.getByLabelText("Start Date"), { target: { value: "2026-02-01" } });
    const dialog = screen.getByRole("dialog");
    const submitButton = within(dialog).getByText("Create Subscription", { selector: "button" });
    fireEvent.click(submitButton);
    await waitFor(() => expect(mutation.mutateAsync).toHaveBeenCalledWith({ merchantId: "merchant-id", input: { planCode: "standard", startsOn: "2026-02-01", termMonths: 1, billingCycleMonths: 1 } }));
  });

  it("blocks creation and explains when no active plan exists", () => {
    useBillingPlans.mockReturnValue({ isPending: false, isError: false, data: { data: { items: [legacy] } } });
    render(<CreateSubscriptionDialog merchantId="merchant-id" />);
    fireEvent.click(screen.getByRole("button", { name: "Create Subscription" }));
    expect(screen.getByText(/No active billing plans are available/)).toBeInTheDocument();
  });

  it("shows a real error state instead of a stale price list on failure", () => {
    useBillingPlans.mockReturnValue({ isPending: false, isError: true, error: new Error("Unavailable"), data: undefined });
    render(<CreateSubscriptionDialog merchantId="merchant-id" />);
    fireEvent.click(screen.getByRole("button", { name: "Create Subscription" }));
    expect(screen.getByText("Unavailable")).toBeInTheDocument();
  });
});
