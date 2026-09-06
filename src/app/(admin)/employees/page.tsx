import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmployeesTable } from "@/components/employees/EmployeesTable";

export default function EmployeesPage() {
  return (
    <div className="mx-auto flex max-w-7xl min-w-0 flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-[24px] font-semibold tracking-tight text-text-primary">
            Employees
          </h1>
          <p className="mt-1 text-[13px] leading-relaxed text-text-secondary">
            Manage field and operational users, verification and activity.
          </p>
        </div>
        <Button size="sm" disabled className="h-9 gap-1.5 text-[13px]">
          <Plus className="size-3.5" />
          Add Employee
        </Button>
      </div>

      <EmployeesTable />
    </div>
  );
}
