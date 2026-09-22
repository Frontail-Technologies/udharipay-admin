import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "@/api/http/errors";
import { CreateCustomerDialog } from "./CreateCustomerDialog";

const mutation = vi.hoisted(() => ({ isPending: false, mutateAsync: vi.fn() }));
const toast = vi.hoisted(() => ({ error: vi.fn() }));

vi.mock("@/features/customers/hooks/useCustomers", () => ({ useCreateCustomer: () => mutation }));
vi.mock("sonner", () => ({ toast }));

beforeEach(() => {
  vi.clearAllMocks();
  mutation.isPending = false;
  mutation.mutateAsync.mockResolvedValue({});
});

describe("CreateCustomerDialog", () => {
  it("submits for the selected Merchant, closes, and resets the form", async () => {
    render(<CreateCustomerDialog merchantId="merchant-id" />);
    fireEvent.click(screen.getByRole("button", { name: "Add Customer" }));
    fillRequiredFields();
    fireEvent.click(screen.getByRole("combobox", { name: "State" }));
    fireEvent.click(screen.getByRole("option", { name: "Rajasthan" }));
    fireEvent.click(screen.getByRole("button", { name: "Create Customer" }));
    await waitFor(() => expect(mutation.mutateAsync).toHaveBeenCalledWith({ merchantId: "merchant-id", input: { name: "Rahul Verma", phone: "+919000000001", address: "12 Market Road", city: "Jaipur", state: "Rajasthan", pincode: "302001", status: "active" } }));
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    fireEvent.click(screen.getByRole("button", { name: "Add Customer" }));
    expect(screen.getByLabelText("Name")).toHaveValue("");
  });

  it("shows one Merchant-scoped duplicate phone conflict", async () => {
    mutation.mutateAsync.mockRejectedValueOnce(new ApiError({ message: "Customer phone already exists for this merchant", code: "CONFLICT", status: 409 }));
    render(<CreateCustomerDialog merchantId="merchant-id" />);
    fireEvent.click(screen.getByRole("button", { name: "Add Customer" }));
    fillRequiredFields();
    fireEvent.click(screen.getByRole("combobox", { name: "State" }));
    fireEvent.click(screen.getByRole("option", { name: "Rajasthan" }));
    fireEvent.click(screen.getByRole("button", { name: "Create Customer" }));
    await waitFor(() => expect(toast.error).toHaveBeenCalledWith("Customer phone already exists for this merchant"));
    expect(toast.error).toHaveBeenCalledOnce();
  });
});

function fillRequiredFields() {
  fireEvent.change(screen.getByLabelText("Name"), { target: { value: "Rahul Verma" } });
  fireEvent.change(screen.getByLabelText("Mobile"), { target: { value: "+919000000001" } });
  fireEvent.change(screen.getByLabelText("Address"), { target: { value: "12 Market Road" } });
  fireEvent.change(screen.getByLabelText("City"), { target: { value: "Jaipur" } });
  fireEvent.change(screen.getByLabelText("Pincode"), { target: { value: "302001" } });
}
