import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "@/api/http/errors";
import { ProvisionMerchantAccountDialog } from "./ProvisionMerchantAccountDialog";

const mutation = vi.hoisted(() => ({ isPending: false, mutateAsync: vi.fn() }));
const toast = vi.hoisted(() => ({ error: vi.fn() }));

vi.mock("@/features/merchants/useMerchants", () => ({ useProvisionMerchantAccount: () => mutation }));
vi.mock("sonner", () => ({ toast }));

beforeEach(() => {
  vi.clearAllMocks();
  mutation.isPending = false;
  mutation.mutateAsync.mockResolvedValue({});
});

describe("ProvisionMerchantAccountDialog", () => {
  it("submits the generated request shape and clears the password", async () => {
    render(<ProvisionMerchantAccountDialog merchantId="merchant-id" />);
    fireEvent.click(screen.getByRole("button", { name: "Provision Account" }));
    fireEvent.change(screen.getByLabelText("Email"), { target: { value: "login@example.test" } });
    fireEvent.change(screen.getByLabelText("Initial Password"), { target: { value: "secure-password" } });
    fireEvent.click(screen.getByRole("button", { name: "Provision Account" }));
    await waitFor(() => expect(mutation.mutateAsync).toHaveBeenCalledWith({ merchantId: "merchant-id", input: { email: "login@example.test", initialPassword: "secure-password" } }));
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    fireEvent.click(screen.getByRole("button", { name: "Provision Account" }));
    expect(screen.getByLabelText("Initial Password")).toHaveValue("");
  });

  it("maps validation errors inline without a duplicate toast", async () => {
    mutation.mutateAsync.mockRejectedValueOnce(new ApiError({ message: "Validation failed", code: "VALIDATION_ERROR", status: 400, details: { fieldErrors: { initialPassword: ["Password is too short"] } } }));
    render(<ProvisionMerchantAccountDialog merchantId="merchant-id" />);
    fireEvent.click(screen.getByRole("button", { name: "Provision Account" }));
    fireEvent.change(screen.getByLabelText("Email"), { target: { value: "login@example.test" } });
    fireEvent.change(screen.getByLabelText("Initial Password"), { target: { value: "short" } });
    fireEvent.click(screen.getByRole("button", { name: "Provision Account" }));
    expect(await screen.findByText("Password is too short")).toBeInTheDocument();
    expect(toast.error).not.toHaveBeenCalled();
  });

  it("shows one normalized conflict error", async () => {
    mutation.mutateAsync.mockRejectedValueOnce(new ApiError({ message: "Merchant account identity already exists", code: "CONFLICT", status: 409 }));
    render(<ProvisionMerchantAccountDialog merchantId="merchant-id" />);
    fireEvent.click(screen.getByRole("button", { name: "Provision Account" }));
    fireEvent.change(screen.getByLabelText("Email"), { target: { value: "login@example.test" } });
    fireEvent.change(screen.getByLabelText("Initial Password"), { target: { value: "secure-password" } });
    fireEvent.click(screen.getByRole("button", { name: "Provision Account" }));
    await waitFor(() => expect(toast.error).toHaveBeenCalledWith("Merchant account identity already exists"));
    expect(toast.error).toHaveBeenCalledOnce();
  });
});
