import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ConfirmProvider } from "@/shared/hooks/useConfirm";
import { kycReview } from "@/test/fixtures/kyc";
import { KycReviewActions } from "./KycReviewActions";
import { KycDecisionDialog } from "./KycDecisionDialog";

const hooks = vi.hoisted(() => ({ useApproveKyc: vi.fn(), useRejectKyc: vi.fn(), useRequestKycResubmission: vi.fn() }));
vi.mock("@/features/kyc/hooks/useKyc", () => hooks);

describe("KycReviewActions", () => {
  it("shows decision actions only for in-review status", () => {
    const mutation = { isPending: false, mutateAsync: vi.fn() };
    hooks.useApproveKyc.mockReturnValue(mutation);
    hooks.useRejectKyc.mockReturnValue(mutation);
    hooks.useRequestKycResubmission.mockReturnValue(mutation);
    const { rerender } = render(<ConfirmProvider><KycReviewActions review={kycReview} /></ConfirmProvider>);
    expect(screen.queryByRole("button", { name: "Approve" })).not.toBeInTheDocument();
    rerender(<ConfirmProvider><KycReviewActions review={{ ...kycReview, status: "in_review" }} /></ConfirmProvider>);
    expect(screen.getByRole("button", { name: "Approve" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Request Resubmission" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Reject" })).toBeInTheDocument();
  });

  it.each(["approved", "rejected", "resubmission_required"] as const)("hides impossible decision actions for %s", (status) => {
    const mutation = { isPending: false, mutateAsync: vi.fn() };
    hooks.useApproveKyc.mockReturnValue(mutation);
    hooks.useRejectKyc.mockReturnValue(mutation);
    hooks.useRequestKycResubmission.mockReturnValue(mutation);
    render(<ConfirmProvider><KycReviewActions review={{ ...kycReview, status }} /></ConfirmProvider>);
    expect(screen.queryByRole("button", { name: /approve|reject|resubmission/i })).not.toBeInTheDocument();
  });

  it("requires a canonical ten-character decision reason", () => {
    const onConfirm = vi.fn().mockResolvedValue(undefined);
    render(<KycDecisionDialog open onOpenChange={vi.fn()} title="Reject KYC Review" description="Provide a reason" confirmLabel="Reject Review" destructive onConfirm={onConfirm} isPending={false} />);
    const button = screen.getByRole("button", { name: "Reject Review" });
    fireEvent.change(screen.getByLabelText("Reason"), { target: { value: "short" } });
    expect(button).toBeDisabled();
    fireEvent.change(screen.getByLabelText("Reason"), { target: { value: "Detailed reason" } });
    expect(button).toBeEnabled();
  });
});
