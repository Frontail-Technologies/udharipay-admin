import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "@/api/http/errors";
import { ProvisionMerchantAccountDialog } from "./ProvisionMerchantAccountDialog";

const mutation = vi.hoisted(() => ({ isPending: false, mutateAsync: vi.fn() }));
const toast = vi.hoisted(() => ({ error: vi.fn() }));

vi.mock("@/features/merchants/hooks/useMerchants", () => ({ useProvisionMerchantAccount: () => mutation }));
vi.mock("sonner", () => ({ toast }));

beforeEach(() => {
  vi.clearAllMocks();
  mutation.isPending = false;
  mutation.mutateAsync.mockResolvedValue({});
});

describe("ProvisionMerchantAccountDialog", () => {
  it("provisions without a password (OTP login) and clears the form", async () => {
    render(<ProvisionMerchantAccountDialog merchantId="merchant-id" />);
    fireEvent.click(screen.getByRole("button", { name: "Provision Account" }));
    expect(screen.queryByLabelText(/password/i)).not.toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("Email (optional)"), { target: { value: "login@example.test" } });
    fireEvent.click(screen.getByRole("button", { name: "Provision Account" }));
    await waitFor(() => expect(mutation.mutateAsync).toHaveBeenCalledWith({ merchantId: "merchant-id", input: { email: "login@example.test" } }));
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    fireEvent.click(screen.getByRole("button", { name: "Provision Account" }));
    expect(screen.getByLabelText("Email (optional)")).toHaveValue("");
  });

  it("uses the business mobile when no sign-in number is given", async () => {
    render(<ProvisionMerchantAccountDialog merchantId="merchant-id" />);
    fireEvent.click(screen.getByRole("button", { name: "Provision Account" }));
    fireEvent.click(screen.getAllByRole("button", { name: "Provision Account" }).at(-1)!);
    await waitFor(() => expect(mutation.mutateAsync).toHaveBeenCalledWith({ merchantId: "merchant-id", input: {} }));
  });

  it("maps validation errors inline without a duplicate toast", async () => {
    mutation.mutateAsync.mockRejectedValueOnce(new ApiError({ message: "Validation failed", code: "VALIDATION_ERROR", status: 400, details: { fieldErrors: { phone: ["Mobile number is invalid"] } } }));
    render(<ProvisionMerchantAccountDialog merchantId="merchant-id" />);
    fireEvent.click(screen.getByRole("button", { name: "Provision Account" }));
    fireEvent.change(screen.getByLabelText("Email (optional)"), { target: { value: "login@example.test" } });
    fireEvent.change(screen.getByLabelText("Mobile for sign-in"), { target: { value: "12" } });
    fireEvent.click(screen.getByRole("button", { name: "Provision Account" }));
    expect(await screen.findByText("Mobile number is invalid")).toBeInTheDocument();
    expect(toast.error).not.toHaveBeenCalled();
  });

  it("shows one normalized conflict error", async () => {
    mutation.mutateAsync.mockRejectedValueOnce(new ApiError({ message: "Merchant account identity already exists", code: "CONFLICT", status: 409 }));
    render(<ProvisionMerchantAccountDialog merchantId="merchant-id" />);
    fireEvent.click(screen.getByRole("button", { name: "Provision Account" }));
    fireEvent.change(screen.getByLabelText("Email (optional)"), { target: { value: "login@example.test" } });
    fireEvent.click(screen.getByRole("button", { name: "Provision Account" }));
    await waitFor(() => expect(toast.error).toHaveBeenCalledWith("Merchant account identity already exists"));
    expect(toast.error).toHaveBeenCalledOnce();
  });
});
