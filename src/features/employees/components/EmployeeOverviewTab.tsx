import type { Employee } from "@/api/generated/contracts/employees";
import { EmployeeProfileSection } from "@/features/employees/components/EmployeeProfileSection";
import { EmployeeContactSection } from "@/features/employees/components/EmployeeContactSection";

export function EmployeeOverviewTab({ employee }: { employee: Employee }) {
  return <div className="grid grid-cols-1 gap-4 lg:grid-cols-2"><EmployeeProfileSection employee={employee} /><EmployeeContactSection employee={employee} /></div>;
}
