import { PageHeader } from "@/components/admin/PageHeader";
import { GlobalPaymentsTable } from "@/features/payments/components/GlobalPaymentsTable";

export default function PaymentsPage() {
  return (
    <div className="flex w-full min-w-0 flex-col gap-5">
      <PageHeader title="Payments" description="All transactions across collections, activation fees, and merchant subscriptions." />

      <GlobalPaymentsTable />
    </div>
  );
}
