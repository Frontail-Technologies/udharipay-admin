"use client";

import { UserStatus, type UserStatus as UserStatusType } from "@/api/generated/common";
import { normalizeApiError } from "@/api/http/errors";
import { employeeStatusTone } from "@/features/employees/employeeStatus";
import { useChangeEmployeeStatus, useEmployee } from "@/features/employees/useEmployees";
import { EntityPageHeader } from "@/components/entity/EntityPageHeader";
import { EntitySummaryGrid } from "@/components/entity/EntitySummaryGrid";
import { EmployeeOverviewTab } from "@/components/employees/EmployeeOverviewTab";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate, humanizeSnakeCase, initialsFromName } from "@/lib/format";

export function EmployeeDetailView({ employeeId }: { employeeId: string }) {
  const query = useEmployee(employeeId);
  const statusChange = useChangeEmployeeStatus();

  if (query.isPending) return <EmployeeDetailSkeleton />;
  if (query.isError) return <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-8 text-center text-[13px] text-destructive">{normalizeApiError(query.error).message}</div>;

  const employee = query.data.data;

  return (
    <div className="mx-auto flex max-w-6xl min-w-0 flex-col gap-5">
      <EntityPageHeader
        backHref="/employees"
        avatarLabel={initialsFromName(employee.name)}
        title={employee.name}
        meta={`${employee.publicId} · ${employee.branch ?? "No branch"} · Joined ${formatDate(employee.createdAt)}`}
        badges={<StatusBadge tone={employeeStatusTone[employee.status]}>Account {humanizeSnakeCase(employee.status)}</StatusBadge>}
        actions={
          <Select value={employee.status} disabled={statusChange.isPending} onValueChange={(value) => statusChange.changeStatus(employee, parseStatus(value))}>
            <SelectTrigger className="h-8 w-32 text-[12.5px]" aria-label="Change employee status"><SelectValue /></SelectTrigger>
            <SelectContent>{Object.values(UserStatus).map((status) => <SelectItem key={status} value={status}>{humanizeSnakeCase(status)}</SelectItem>)}</SelectContent>
          </Select>
        }
      />
      <EntitySummaryGrid items={[
        { label: "Email", value: employee.email ?? "Not provided" },
        { label: "Mobile", value: employee.phone ?? "Not provided" },
        { label: "Branch", value: employee.branch ?? "Not assigned" },
        { label: "Last Updated", value: formatDate(employee.updatedAt) },
      ]} />
      <EmployeeOverviewTab employee={employee} />
    </div>
  );
}

function EmployeeDetailSkeleton() {
  return <div className="mx-auto flex max-w-6xl flex-col gap-5"><Skeleton className="h-24 w-full" /><Skeleton className="h-24 w-full" /><div className="grid gap-4 lg:grid-cols-2"><Skeleton className="h-52" /><Skeleton className="h-52" /></div></div>;
}

function parseStatus(value: string): UserStatusType {
  if (value === "inactive" || value === "suspended") return value;
  return "active";
}
