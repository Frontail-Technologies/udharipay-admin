"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { createEmployee, getEmployee, listEmployees, updateEmployee } from "@/api/generated/employees";
import type { CreateEmployeeBody, Employee, ListEmployeesParams, UpdateEmployeeBody } from "@/api/generated/contracts/employees";
import type { UserStatus } from "@/api/generated/common";
import { normalizeApiError } from "@/api/http/errors";
import { useConfirm } from "@/components/feedback/ConfirmProvider";

export const employeeKeys = {
  all: ["employees"] as const,
  lists: () => [...employeeKeys.all, "list"] as const,
  list: (params: ListEmployeesParams) => [...employeeKeys.lists(), params] as const,
  details: () => [...employeeKeys.all, "detail"] as const,
  detail: (employeeId: string) => [...employeeKeys.details(), employeeId] as const,
};

export function useEmployees(params: ListEmployeesParams) {
  return useQuery({
    queryKey: employeeKeys.list(params),
    queryFn: ({ signal }) => listEmployees(params, { signal }),
  });
}

export function useEmployee(employeeId: string) {
  return useQuery({
    queryKey: employeeKeys.detail(employeeId),
    queryFn: ({ signal }) => getEmployee(employeeId, { signal }),
  });
}

export function useCreateEmployee() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateEmployeeBody) => createEmployee(input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: employeeKeys.lists() });
      toast.success("Employee created");
    },
  });
}

export function useUpdateEmployee() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ employeeId, input }: { employeeId: string; input: UpdateEmployeeBody }) => updateEmployee(employeeId, input),
    onSuccess: async (response, variables) => {
      queryClient.setQueryData(employeeKeys.detail(variables.employeeId), response);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: employeeKeys.lists() }),
        queryClient.invalidateQueries({ queryKey: employeeKeys.detail(variables.employeeId) }),
      ]);
      toast.success(variables.input.status ? "Employee status updated" : "Employee details updated");
    },
  });
}

export function useChangeEmployeeStatus() {
  const confirm = useConfirm();
  const update = useUpdateEmployee();
  const changeStatus = async (employee: Employee, status: UserStatus) => {
    if (employee.status === status || update.isPending) return false;
    if (status === "inactive" || status === "suspended") {
      const approved = await confirm({
        title: status === "suspended" ? "Suspend employee?" : "Deactivate employee?",
        description: `${employee.name} will lose access and active sessions will be revoked.`,
        confirmLabel: status === "suspended" ? "Suspend" : "Deactivate",
        destructive: true,
      });
      if (!approved) return false;
    }
    try {
      await update.mutateAsync({ employeeId: employee.id, input: { status } });
      return true;
    } catch (error) {
      toast.error(normalizeApiError(error).message);
      return false;
    }
  };
  return { changeStatus, isPending: update.isPending };
}
