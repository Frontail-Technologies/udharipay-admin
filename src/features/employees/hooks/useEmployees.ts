"use client";

import { useDeferredValue, useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { createEmployee, getEmployee, listEmployees, updateEmployee } from "@/api/generated/employees";
import type { CreateEmployeeBody, Employee, ListEmployeesParams, UpdateEmployeeBody } from "@/api/generated/contracts/employees";
import { UserStatus, type UserStatus as UserStatusType } from "@/api/generated/common";
import { normalizeApiError } from "@/api/http/errors";
import { useConfirm } from "@/shared/hooks/useConfirm";
import { readCursorState, writeCursorState, type CursorState } from "@/shared/utils/url";

const PAGE_SIZE = 25;

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

export function useEmployeeDirectory() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const state = readCursorState(new URLSearchParams(searchParams.toString()));
  const search = state.search ?? "";
  const status = parseEmployeeStatus(state.status);
  const deferredSearch = useDeferredValue(search);
  const params = useMemo<ListEmployeesParams>(() => ({ limit: PAGE_SIZE, cursor: state.cursor, search: deferredSearch || undefined, status }), [deferredSearch, state.cursor, status]);
  const query = useEmployees(params);
  const replaceState = (next: CursorState) => {
    const queryString = writeCursorState(new URLSearchParams(searchParams.toString()), next);
    router.replace(queryString ? `${pathname}?${queryString}` : pathname, { scroll: false });
  };
  const goNext = (cursor: string) => {
    const queryString = writeCursorState(new URLSearchParams(searchParams.toString()), { cursor, search: state.search, status: state.status });
    router.push(`${pathname}?${queryString}`, { scroll: false });
  };
  return { query, employees: query.data?.data.items ?? [], nextCursor: query.data?.data.pagination.nextCursor ?? null, state, search, status, replaceState, goPrevious: router.back, goNext };
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
  const changeStatus = async (employee: Employee, status: UserStatusType) => {
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

function parseEmployeeStatus(value: string | undefined): UserStatusType | undefined {
  return Object.values(UserStatus).find((status) => status === value);
}
