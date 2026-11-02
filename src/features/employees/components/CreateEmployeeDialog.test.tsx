import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "@/api/http/errors";
import { CreateEmployeeDialog } from "./CreateEmployeeDialog";

const mutation = vi.hoisted(() => ({ isPending: false, mutateAsync: vi.fn() }));
const toast = vi.hoisted(() => ({ error: vi.fn() }));

vi.mock("@/features/employees/hooks/useEmployees", () => ({ useCreateEmployee: () => mutation }));
vi.mock("sonner", () => ({ toast }));

beforeEach(() => {
  vi.clearAllMocks();
  mutation.isPending = false;
  mutation.mutateAsync.mockResolvedValue({});
});

describe("CreateEmployeeDialog", () => {
  it("submits name and mobile without a password (OTP login), closes, and clears the form", async () => {
    render(<CreateEmployeeDialog />);
    fireEvent.click(screen.getByRole("button", { name: "Add Employee" }));
    fireEvent.change(screen.getByLabelText("Name"), { target: { value: "Nikita Rao" } });
    fireEvent.change(screen.getByLabelText("Email"), { target: { value: "nikita@example.test" } });
    fireEvent.change(screen.getByLabelText("Mobile"), { target: { value: "9800000011" } });
    fireEvent.click(screen.getByRole("button", { name: "Create Employee" }));
    await waitFor(() => expect(mutation.mutateAsync).toHaveBeenCalledWith({
      name: "Nikita Rao",
      email: "nikita@example.test",
      phone: "9800000011",
      status: "active",
    }));
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    fireEvent.click(screen.getByRole("button", { name: "Add Employee" }));
    expect(screen.getByLabelText("Name")).toHaveValue("");
    expect(screen.getByLabelText("Mobile")).toHaveValue("");
    expect(screen.queryByLabelText(/password/i)).not.toBeInTheDocument();
  });

  it("maps backend validation errors inline without a duplicate toast", async () => {
    mutation.mutateAsync.mockRejectedValueOnce(new ApiError({
      message: "Validation failed",
      code: "VALIDATION_ERROR",
      status: 400,
      details: { fieldErrors: { name: ["Name is invalid"] } },
    }));
    render(<CreateEmployeeDialog />);
    fireEvent.click(screen.getByRole("button", { name: "Add Employee" }));
    fireEvent.change(screen.getByLabelText("Name"), { target: { value: "N" } });
    fireEvent.change(screen.getByLabelText("Email"), { target: { value: "nikita@example.test" } });
    fireEvent.change(screen.getByLabelText("Mobile"), { target: { value: "9800000011" } });
    fireEvent.click(screen.getByRole("button", { name: "Create Employee" }));
    expect(await screen.findByText("Name is invalid")).toBeInTheDocument();
    expect(toast.error).not.toHaveBeenCalled();
  });

  it("requires a mobile number, because the OTP is sent to it", async () => {
    render(<CreateEmployeeDialog />);
    fireEvent.click(screen.getByRole("button", { name: "Add Employee" }));
    fireEvent.change(screen.getByLabelText("Name"), { target: { value: "Nikita Rao" } });
    fireEvent.click(screen.getByRole("button", { name: "Create Employee" }));
    expect(await screen.findByText("Mobile number is required")).toBeInTheDocument();
    expect(mutation.mutateAsync).not.toHaveBeenCalled();
  });

  it("shows a single normalized conflict error", async () => {
    mutation.mutateAsync.mockRejectedValueOnce(new ApiError({ message: "Employee login identity already exists", code: "CONFLICT", status: 409 }));
    render(<CreateEmployeeDialog />);
    fireEvent.click(screen.getByRole("button", { name: "Add Employee" }));
    fireEvent.change(screen.getByLabelText("Name"), { target: { value: "Nikita Rao" } });
    fireEvent.change(screen.getByLabelText("Email"), { target: { value: "nikita@example.test" } });
    fireEvent.change(screen.getByLabelText("Mobile"), { target: { value: "9800000011" } });
    fireEvent.click(screen.getByRole("button", { name: "Create Employee" }));
    await waitFor(() => expect(toast.error).toHaveBeenCalledWith("Employee login identity already exists"));
    expect(toast.error).toHaveBeenCalledOnce();
  });
});
