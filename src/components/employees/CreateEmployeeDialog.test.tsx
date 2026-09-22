import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "@/api/http/errors";
import { CreateEmployeeDialog } from "./CreateEmployeeDialog";

const mutation = vi.hoisted(() => ({ isPending: false, mutateAsync: vi.fn() }));
const toast = vi.hoisted(() => ({ error: vi.fn() }));

vi.mock("@/features/employees/useEmployees", () => ({ useCreateEmployee: () => mutation }));
vi.mock("sonner", () => ({ toast }));

beforeEach(() => {
  vi.clearAllMocks();
  mutation.isPending = false;
  mutation.mutateAsync.mockResolvedValue({});
});

describe("CreateEmployeeDialog", () => {
  it("submits the generated request shape, closes, and clears sensitive form state", async () => {
    render(<CreateEmployeeDialog />);
    fireEvent.click(screen.getByRole("button", { name: "Add Employee" }));
    fireEvent.change(screen.getByLabelText("Name"), { target: { value: "Nikita Rao" } });
    fireEvent.change(screen.getByLabelText("Email"), { target: { value: "nikita@example.test" } });
    fireEvent.change(screen.getByLabelText("Initial Password"), { target: { value: "secure-password" } });
    fireEvent.click(screen.getByRole("button", { name: "Create Employee" }));
    await waitFor(() => expect(mutation.mutateAsync).toHaveBeenCalledWith({
      name: "Nikita Rao",
      email: "nikita@example.test",
      initialPassword: "secure-password",
      status: "active",
    }));
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    fireEvent.click(screen.getByRole("button", { name: "Add Employee" }));
    expect(screen.getByLabelText("Name")).toHaveValue("");
    expect(screen.getByLabelText("Initial Password")).toHaveValue("");
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
    fireEvent.change(screen.getByLabelText("Initial Password"), { target: { value: "secure-password" } });
    fireEvent.click(screen.getByRole("button", { name: "Create Employee" }));
    expect(await screen.findByText("Name is invalid")).toBeInTheDocument();
    expect(toast.error).not.toHaveBeenCalled();
  });

  it("shows a single normalized conflict error", async () => {
    mutation.mutateAsync.mockRejectedValueOnce(new ApiError({ message: "Employee login identity already exists", code: "CONFLICT", status: 409 }));
    render(<CreateEmployeeDialog />);
    fireEvent.click(screen.getByRole("button", { name: "Add Employee" }));
    fireEvent.change(screen.getByLabelText("Name"), { target: { value: "Nikita Rao" } });
    fireEvent.change(screen.getByLabelText("Email"), { target: { value: "nikita@example.test" } });
    fireEvent.change(screen.getByLabelText("Initial Password"), { target: { value: "secure-password" } });
    fireEvent.click(screen.getByRole("button", { name: "Create Employee" }));
    await waitFor(() => expect(toast.error).toHaveBeenCalledWith("Employee login identity already exists"));
    expect(toast.error).toHaveBeenCalledOnce();
  });
});
