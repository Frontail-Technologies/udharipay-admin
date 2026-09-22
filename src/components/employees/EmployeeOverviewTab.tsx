import type { Employee } from "@/api/generated/contracts/employees";
import { EmployeeProfileSection } from "@/components/employees/EmployeeProfileSection";
import { EmployeeContactSection } from "@/components/employees/EmployeeContactSection";

export function EmployeeOverviewTab({ employee }: { employee: Employee }) {
  return <div className="grid grid-cols-1 gap-4 lg:grid-cols-2"><EmployeeProfileSection employee={employee} /><EmployeeContactSection employee={employee} /></div>;
}
