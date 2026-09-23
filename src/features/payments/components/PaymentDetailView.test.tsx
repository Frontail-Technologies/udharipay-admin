import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { PaymentDetail } from "@/api/generated/contracts/payments";
import { PaymentDetailView } from "./PaymentDetailView";

const usePayment = vi.hoisted(() => vi.fn());
vi.mock("@/features/payments/hooks/usePayments", () => ({ usePayment }));

const payment: PaymentDetail = { id: "8d25b5aa-34e1-4c47-93b2-97bb946e1f71", publicId: "PAY-1001", merchantId: "7d25b5aa-34e1-4c47-93b2-97bb946e1f72", customerId: "6d25b5aa-34e1-4c47-93b2-97bb946e1f73", planId: "5d25b5aa-34e1-4c47-93b2-97bb946e1f74", amountPaise: "9007199254740993", method: "upi", source: "provider", status: "successful", provider: "razorpay", providerReference: "pay_reference", paidAt: "2026-09-22T08:30:00.000Z", createdAt: "2026-09-22T08:30:00.000Z", updatedAt: "2026-09-22T08:30:00.000Z", allocations: [{ id: "4d25b5aa-34e1-4c47-93b2-97bb946e1f75", installmentId: "3d25b5aa-34e1-4c47-93b2-97bb946e1f76", installmentNumber: 1, dueDate: "2026-09-20", amountPaise: "4503599627370496", createdAt: "2026-09-22T08:30:00.000Z" }, { id: "2d25b5aa-34e1-4c47-93b2-97bb946e1f77", installmentId: "1d25b5aa-34e1-4c47-93b2-97bb946e1f78", installmentNumber: 2, dueDate: "2026-10-20", amountPaise: "4503599627370497", createdAt: "2026-09-22T08:30:00.000Z" }] };

describe("PaymentDetailView", () => {
  it("renders multiple canonical allocations with precision-safe totals", () => {
    usePayment.mockReturnValue({ isPending: false, isError: false, data: { data: payment } });
    render(<PaymentDetailView paymentId={payment.id} />);
    expect(screen.getByText("PAY-1001")).toBeInTheDocument();
    expect(screen.getByText("#1")).toBeInTheDocument();
    expect(screen.getByText("#2")).toBeInTheDocument();
    expect(screen.getAllByText("₹9,00,71,99,25,47,409.93")).toHaveLength(2);
    expect(screen.queryByText(/mark as paid|edit payment|delete payment|refund/i)).not.toBeInTheDocument();
  });

  it.each(["pending", "failed", "reversed"] as const)("keeps %s status visible as historical truth", (status) => {
    usePayment.mockReturnValue({ isPending: false, isError: false, data: { data: { ...payment, status, provider: null, providerReference: null } } });
    render(<PaymentDetailView paymentId={payment.id} />);
    expect(screen.getAllByText(status[0].toUpperCase() + status.slice(1)).length).toBeGreaterThan(0);
    expect(screen.getAllByText("Not provided")).toHaveLength(2);
  });
});
