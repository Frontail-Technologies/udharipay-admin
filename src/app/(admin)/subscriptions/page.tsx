import { PageHeader } from "@/components/admin/PageHeader";
import { BillingDirectory } from "@/features/billing/components/BillingDirectory";

export default function SubscriptionsPage() {
  return (
    <div className="mx-auto flex max-w-7xl min-w-0 flex-col gap-5">
      <PageHeader title="Subscriptions" description="Merchant SaaS billing invoices — activation fees and monthly subscription plans. Separate from customer Udhaar collections." />

      <BillingDirectory />
    </div>
  );
}
