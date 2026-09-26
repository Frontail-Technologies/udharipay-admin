import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { Mandate } from "@/api/generated/contracts/mandates";
import { MandateDetailView } from "./MandateDetailView";

const useMandate = vi.hoisted(() => vi.fn());
vi.mock("@/features/mandates/hooks/useMandates", () => ({ useMandate, useAttemptHistory: () => ({ query: { isError: false, isPending: false }, attempts: [], nextCursor: null, hasPrevious: false, goPrevious: vi.fn(), goNext: vi.fn() }) }));

const mandate: Mandate = { id: "mandate-id", publicId: "MAN-1001", merchantId: "merchant-id", customerId: "customer-id", planId: null, provider: null, method: "enach", status: "authorization_pending", providerReference: null, authorizedAt: null, activatedAt: null, expiresAt: null, maxAmountPaise: "9007199254740993", createdAt: "2026-09-22T08:30:00.000Z", updatedAt: "2026-09-22T08:30:00.000Z" };

describe("MandateDetailView", () => {
  it("renders a customer-level Mandate without unsupported lifecycle controls", () => {
    useMandate.mockReturnValue({ isPending: false, isError: false, data: { data: mandate } });
    render(<MandateDetailView mandateId={mandate.id} defaultTab="overview" />);
    expect(screen.getAllByText("MAN-1001").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Customer-level").length).toBeGreaterThan(0);
    expect(screen.getByText("No Plan restriction")).toBeInTheDocument();
    expect(screen.getAllByText("₹9,00,71,99,25,47,409.93").length).toBeGreaterThan(0);
    expect(screen.queryByRole("button", { name: /activate|pause|cancel|retry|execute|charge|collect|delete|mark successful/i })).not.toBeInTheDocument();
  });

  it("shows the Razorpay provider and safe reference without any cancellation control", () => {
    useMandate.mockReturnValue({ isPending: false, isError: false, data: { data: { ...mandate, provider: "razorpay", providerReference: "inv_ABC123", status: "active" } } });
    render(<MandateDetailView mandateId={mandate.id} defaultTab="overview" />);
    expect(screen.getAllByText("eNACH / Bank AutoPay").length).toBeGreaterThan(0);
    expect(screen.getAllByText("razorpay").length).toBeGreaterThan(0);
    expect(screen.getAllByText("inv_ABC123").length).toBeGreaterThan(0);
    expect(screen.queryByRole("button", { name: /cancel|force|revoke/i })).not.toBeInTheDocument();
  });
});
