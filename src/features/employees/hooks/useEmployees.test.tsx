import type { ReactNode } from "react";
import fs from "node:fs";
import path from "node:path";
import { act, renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Employee } from "@/api/generated/contracts/employees";
import { employeeKeys, useChangeEmployeeStatus, useCreateEmployee, useEmployees, useUpdateEmployee } from "./useEmployees";

const api = vi.hoisted(() => ({
  createEmployee: vi.fn(),
  getEmployee: vi.fn(),
  listEmployees: vi.fn(),
  updateEmployee: vi.fn(),
}));
const confirm = vi.hoisted(() => vi.fn());

vi.mock("@/api/generated/employees", () => api);
vi.mock("@/shared/hooks/useConfirm", () => ({ useConfirm: () => confirm }));
vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

const employee: Employee = {
  id: "8d25b5aa-34e1-4c47-93b2-97bb946e1f71",
  publicId: "EMP-1001",
  name: "Nikita Rao",
  email: "nikita@example.test",
  phone: "+919000000001",
  status: "active",
  branch: "Mumbai",
  createdAt: "2026-09-20T00:00:00.000Z",
  updatedAt: "2026-09-20T00:00:00.000Z",
};

function setup() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
  const wrapper = ({ children }: { children: ReactNode }) => <QueryClientProvider client={client}>{children}</QueryClientProvider>;
  return { client, wrapper };
}

beforeEach(() => {
  vi.clearAllMocks();
  api.listEmployees.mockResolvedValue({ data: { items: [employee], pagination: { nextCursor: "next-cursor" } } });
  api.createEmployee.mockResolvedValue({ data: employee });
  api.updateEmployee.mockResolvedValue({ data: employee });
});

describe("Employee API hooks", () => {
  it("keeps Employee screens independent from demo Employee state", () => {
    const files = [
      "src/app/(admin)/employees/page.tsx",
      "src/app/(admin)/employees/[employeeId]/page.tsx",
      ...fs.readdirSync("src/features/employees/components").filter((name) => name.endsWith(".tsx") && !name.endsWith(".test.tsx")).map((name) => path.join("src/features/employees/components", name)),
    ];
    const source = files.map((file) => fs.readFileSync(file, "utf8")).join("\n");
    expect(source).not.toMatch(/useAdminEntities|adminDemoStore|data\/admin\/employees/);
  });

  it("loads employees and sends search, status, and cursor filters", async () => {
    const { wrapper } = setup();
    const params = { limit: 25, search: "Nikita", status: "active" as const, cursor: "current-cursor" };
    const { result } = renderHook(() => useEmployees(params), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.data.items).toEqual([employee]);
    expect(result.current.data?.data.pagination.nextCursor).toBe("next-cursor");
    expect(api.listEmployees).toHaveBeenCalledWith(params, { signal: expect.any(AbortSignal) });
  });

  it("returns a real empty result without demo fallback", async () => {
    api.listEmployees.mockResolvedValueOnce({ data: { items: [], pagination: { nextCursor: null } } });
    const { wrapper } = setup();
    const { result } = renderHook(() => useEmployees({ limit: 25 }), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.data.items).toEqual([]);
  });

  it("creates an employee and invalidates Employee lists only", async () => {
    const { client, wrapper } = setup();
    client.setQueryData(employeeKeys.list({ limit: 25 }), { data: { items: [], pagination: { nextCursor: null } } });
    client.setQueryData(["merchants"], { data: [] });
    const { result } = renderHook(() => useCreateEmployee(), { wrapper });
    const input = { name: "Nikita Rao", email: "nikita@example.test", initialPassword: "secure-password", status: "active" as const };
    await act(() => result.current.mutateAsync(input));
    expect(api.createEmployee).toHaveBeenCalledWith(input);
    expect(client.getQueryState(employeeKeys.list({ limit: 25 }))?.isInvalidated).toBe(true);
    expect(client.getQueryState(["merchants"])?.isInvalidated).toBe(false);
  });

  it("updates an employee and invalidates its detail and Employee lists", async () => {
    const { client, wrapper } = setup();
    client.setQueryData(employeeKeys.list({ limit: 25 }), { data: { items: [employee], pagination: { nextCursor: null } } });
    client.setQueryData(employeeKeys.detail(employee.id), { data: employee });
    const { result } = renderHook(() => useUpdateEmployee(), { wrapper });
    await act(() => result.current.mutateAsync({ employeeId: employee.id, input: { branch: "Pune" } }));
    expect(api.updateEmployee).toHaveBeenCalledWith(employee.id, { branch: "Pune" });
    expect(client.getQueryState(employeeKeys.list({ limit: 25 }))?.isInvalidated).toBe(true);
    expect(client.getQueryState(employeeKeys.detail(employee.id))?.isInvalidated).toBe(true);
  });

  it("does not change sensitive status when confirmation is cancelled", async () => {
    confirm.mockResolvedValueOnce(false);
    const { wrapper } = setup();
    const { result } = renderHook(() => useChangeEmployeeStatus(), { wrapper });
    await act(() => result.current.changeStatus(employee, "suspended"));
    expect(confirm).toHaveBeenCalledOnce();
    expect(api.updateEmployee).not.toHaveBeenCalled();
  });

  it("changes status only after confirmation", async () => {
    confirm.mockResolvedValueOnce(true);
    const { wrapper } = setup();
    const { result } = renderHook(() => useChangeEmployeeStatus(), { wrapper });
    await act(() => result.current.changeStatus(employee, "inactive"));
    expect(api.updateEmployee).toHaveBeenCalledWith(employee.id, { status: "inactive" });
  });
});
