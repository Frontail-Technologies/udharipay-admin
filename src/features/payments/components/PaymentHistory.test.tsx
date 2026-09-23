import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { PaymentListItem } from "@/api/generated/contracts/payments";
import { PaymentHistory } from "./PaymentHistory";

const usePlanPaymentHistory = vi.hoisted(() => vi.fn());
const push = vi.hoisted(() => vi.fn());
vi.mock("@/features/payments/hooks/usePayments", () => ({ usePlanPaymentHistory }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push }) }));

const base: PaymentListItem = { id: "8d25b5aa-34e1-4c47-93b2-97bb946e1f71", publicId: "PAY-1001", merchantId: "7d25b5aa-34e1-4c47-93b2-97bb946e1f72", customerId: "6d25b5aa-34e1-4c47-93b2-97bb946e1f73", planId: "5d25b5aa-34e1-4c47-93b2-97bb946e1f74", amountPaise: "10000", method: "cash", source: "manual", status: "pending", provider: null, providerReference: null, paidAt: null, createdAt: "2026-09-22T08:30:00.000Z", updatedAt: "2026-09-22T08:30:00.000Z" };

describe("PaymentHistory", () => {
  it("renders pending failed and reversed records without a page-derived total", () => {
    const payments: PaymentListItem[] = [{ ...base, status: "pending" }, { ...base, id: "payment-2", publicId: "PAY-1002", status: "failed", method: "upi", source: "provider" }, { ...base, id: "payment-3", publicId: "PAY-1003", status: "reversed", method: "bank_transfer", source: "system_import" }];
    usePlanPaymentHistory.mockReturnValue({ query: { isError: false, isPending: false }, payments, nextCursor: null, hasPrevious: false, goPrevious: vi.fn(), goNext: vi.fn() });
    render(<PaymentHistory planId={base.planId} />);
    expect(screen.getByText("Pending")).toBeInTheDocument();
    expect(screen.getByText("Failed")).toBeInTheDocument();
    expect(screen.getByText("Reversed")).toBeInTheDocument();
    expect(screen.queryByText(/total collected|payment count/i)).not.toBeInTheDocument();
  });

  it("renders a real empty state", () => {
    usePlanPaymentHistory.mockReturnValue({ query: { isError: false, isPending: false }, payments: [], nextCursor: null, hasPrevious: false, goPrevious: vi.fn(), goNext: vi.fn() });
    render(<PaymentHistory planId={base.planId} />);
    expect(screen.getByText("No payments recorded for this Plan.")).toBeInTheDocument();
  });
});
