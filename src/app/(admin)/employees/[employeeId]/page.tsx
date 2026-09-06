import { notFound } from "next/navigation";
import { getEmployeeById } from "@/data/admin";
import { EmployeeDetailView } from "@/components/employees/EmployeeDetailView";

const VALID_TABS = ["overview", "merchants", "activity", "kyc"];

export default async function EmployeeDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ employeeId: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const { employeeId } = await params;
  const { tab } = await searchParams;

  if (!getEmployeeById(employeeId)) notFound();

  const defaultTab = VALID_TABS.includes(tab ?? "") ? (tab as string) : "overview";

  return <EmployeeDetailView employeeId={employeeId} defaultTab={defaultTab} />;
}
