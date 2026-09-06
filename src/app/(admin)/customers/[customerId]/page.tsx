import { notFound } from "next/navigation";
import { getCustomerById } from "@/data/admin";
import { CustomerDetailView } from "@/components/customers/CustomerDetailView";

const VALID_TABS = ["overview", "plans", "payments", "mandate", "documents"];

export default async function CustomerDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ customerId: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const { customerId } = await params;
  const { tab } = await searchParams;

  if (!getCustomerById(customerId)) notFound();

  const defaultTab = VALID_TABS.includes(tab ?? "")
    ? (tab as string)
    : "overview";

  return <CustomerDetailView customerId={customerId} defaultTab={defaultTab} />;
}
