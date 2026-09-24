import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Customer } from "@/api/generated/contracts/customers";
import { CustomerProfileSection } from "./CustomerProfileSection";

const mutation = vi.hoisted(() => ({ isPending: false, mutateAsync: vi.fn() }));

vi.mock("@/features/customers/hooks/useCustomers", () => ({ useUpdateCustomer: () => mutation }));
vi.mock("sonner", () => ({ toast: { error: vi.fn() } }));

const customer: Customer = { id: "customer-id", publicId: "CUS-1001", merchantId: "merchant-id", name: "Rahul Verma", phone: "+919000000001", alternatePhone: "+919000000002", address: "12 Market Road", city: "Jaipur", state: "Rajasthan", pincode: "302001", notes: null, status: "active", createdAt: "2026-09-20T00:00:00.000Z", updatedAt: "2026-09-20T00:00:00.000Z" };

beforeEach(() => {
  vi.clearAllMocks();
  mutation.isPending = false;
  mutation.mutateAsync.mockResolvedValue({});
});

describe("CustomerProfileSection", () => {
  it("sends only null when the alternate phone is cleared", async () => {
    render(<CustomerProfileSection customer={customer} />);
    fireEvent.click(screen.getByRole("button", { name: "Edit Customer Profile" }));
    fireEvent.change(screen.getByLabelText("Alternate Phone"), { target: { value: "" } });
    fireEvent.click(screen.getByRole("button", { name: "Save Changes" }));
    await waitFor(() => expect(mutation.mutateAsync).toHaveBeenCalledWith({ customerId: customer.id, merchantId: customer.merchantId, input: { alternatePhone: null } }));
  });
});
