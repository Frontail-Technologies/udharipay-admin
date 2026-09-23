import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { MandateAttempt } from "@/api/generated/contracts/mandates";
import { MandateAttempts } from "./MandateAttempts";

const useAttemptHistory = vi.hoisted(() => vi.fn());
vi.mock("@/features/mandates/hooks/useMandates", () => ({ useAttemptHistory }));

const attempts: MandateAttempt[] = [{ id: "attempt-1", mandateId: "mandate-id", planId: null, installmentId: null, amountPaise: null, status: "successful", provider: null, providerReference: null, failureCode: null, failureReason: null, attemptedAt: "2026-09-22T08:30:00.000Z", createdAt: "2026-09-22T08:30:00.000Z", updatedAt: "2026-09-22T08:30:00.000Z" }, { id: "attempt-2", mandateId: "mandate-id", planId: "plan-id", installmentId: "installment-id", amountPaise: "10000", status: "failed", provider: "provider", providerReference: "attempt-ref", failureCode: "BANK_DECLINED", failureReason: "Bank declined the debit", attemptedAt: "2026-09-23T08:30:00.000Z", createdAt: "2026-09-23T08:30:00.000Z", updatedAt: "2026-09-23T08:30:00.000Z" }];

describe("MandateAttempts", () => {
  it("renders successful and failed provider evidence without Payment semantics", () => {
    useAttemptHistory.mockReturnValue({ query: { isError: false, isPending: false }, attempts, nextCursor: null, hasPrevious: false, goPrevious: vi.fn(), goNext: vi.fn() });
    render(<MandateAttempts mandateId="mandate-id" />);
    expect(screen.getByText("Successful")).toBeInTheDocument();
    expect(screen.getByText("Failed")).toBeInTheDocument();
    expect(screen.getByText("BANK_DECLINED")).toBeInTheDocument();
    expect(screen.getByText("Bank declined the debit")).toBeInTheDocument();
    expect(screen.getByText("Customer-level")).toBeInTheDocument();
    expect(screen.queryByText(/payment received|^paid$/i)).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /retry|charge|collect/i })).not.toBeInTheDocument();
  });

  it("renders the real attempts-empty state", () => {
    useAttemptHistory.mockReturnValue({ query: { isError: false, isPending: false }, attempts: [], nextCursor: null, hasPrevious: false, goPrevious: vi.fn(), goNext: vi.fn() });
    render(<MandateAttempts mandateId="mandate-id" />);
    expect(screen.getByText("No mandate attempts recorded.")).toBeInTheDocument();
  });
});
