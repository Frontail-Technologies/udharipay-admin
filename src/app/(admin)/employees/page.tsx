import { PageHeader } from "@/components/admin/PageHeader";
import { EmployeesTable } from "@/features/employees/components/EmployeesTable";
import { CreateEmployeeDialog } from "@/features/employees/components/CreateEmployeeDialog";

export default function EmployeesPage() {
  return (
    <div className="mx-auto flex max-w-7xl min-w-0 flex-col gap-5">
      <PageHeader title="Employees" description="Manage field and operational users, verification and activity." actions={<CreateEmployeeDialog />} />

      <EmployeesTable />
    </div>
  );
}
