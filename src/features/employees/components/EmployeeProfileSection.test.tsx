import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { Employee } from "@/api/generated/contracts/employees";
import { EmployeeProfileSection } from "./EmployeeProfileSection";

const useUpdateEmployee = vi.hoisted(() => vi.fn());
vi.mock("@/features/employees/hooks/useEmployees", () => ({ useUpdateEmployee }));

const employee: Employee = { id: "8d25b5aa-34e1-4c47-93b2-97bb946e1f71", publicId: "EMP-1001", name: "Asha Rao", email: "asha@example.com", phone: "+911234567890", branch: "Bengaluru", status: "active", createdAt: "2026-09-22T08:30:00.000Z", updatedAt: "2026-09-22T08:30:00.000Z" };

describe("EmployeeProfileSection", () => {
  it("renders the real created timestamp instead of Invalid Date", () => {
    useUpdateEmployee.mockReturnValue({ mutateAsync: vi.fn(), isPending: false });
    render(<EmployeeProfileSection employee={employee} />);
    expect(screen.queryByText(/Invalid Date/)).not.toBeInTheDocument();
    expect(screen.getByText(/2026/)).toBeInTheDocument();
  });
});
