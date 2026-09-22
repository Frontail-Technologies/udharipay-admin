import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { CreatePlanDialog } from "./CreatePlanDialog";

const mutation = vi.hoisted(() => ({ isPending: false, mutateAsync: vi.fn() }));
vi.mock("@/features/plans/hooks/usePlans", () => ({ useCreatePlan: () => mutation }));

beforeEach(() => {
  vi.clearAllMocks();
  mutation.isPending = false;
  mutation.mutateAsync.mockResolvedValue({});
});

describe("CreatePlanDialog", () => {
  it("submits exact generated fields with safe paise and date-only values", async () => {
    render(<CreatePlanDialog customerId="customer-id" />);
    fireEvent.click(screen.getByRole("button", { name: "Create Plan" }));
    fireEvent.change(screen.getByLabelText("Description"), { target: { value: "Inventory purchase" } });
    fireEvent.change(screen.getByLabelText("Invoice Number"), { target: { value: "INV-42" } });
    fireEvent.change(screen.getByLabelText("Original Amount (₹)"), { target: { value: "999.99" } });
    fireEvent.change(screen.getByLabelText("Number of Collections"), { target: { value: "3" } });
    fireEvent.change(screen.getByLabelText("Start Date"), { target: { value: "2026-01-31" } });
    fireEvent.click(screen.getByRole("button", { name: "Create Plan" }));
    await waitFor(() => expect(mutation.mutateAsync).toHaveBeenCalledWith({ customerId: "customer-id", input: { description: "Inventory purchase", invoiceNumber: "INV-42", originalAmountPaise: "99999", numberOfCollections: 3, frequency: "monthly", startDate: "2026-01-31" } }));
  });
});
