import { EmployeeDetailView } from "@/components/employees/EmployeeDetailView";

export default async function EmployeeDetailPage({
  params,
}: {
  params: Promise<{ employeeId: string }>;
}) {
  const { employeeId } = await params;
  return <EmployeeDetailView employeeId={employeeId} />;
}
