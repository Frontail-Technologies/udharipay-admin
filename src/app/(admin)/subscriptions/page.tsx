import { SubscriptionsTable } from "@/components/subscriptions/SubscriptionsTable";
import { SubscriptionsSummary } from "@/components/subscriptions/SubscriptionsSummary";

export default function SubscriptionsPage() {
  return (
    <div className="mx-auto flex max-w-7xl min-w-0 flex-col gap-5">
      <div className="min-w-0">
        <h1 className="text-[24px] font-semibold tracking-tight text-text-primary">
          Subscriptions
        </h1>
        <p className="mt-1 text-[13px] leading-relaxed text-text-secondary">
          Merchant SaaS billing — activation fees and monthly subscription plans. Separate from customer Udhaar collections.
        </p>
      </div>

      <SubscriptionsSummary />
      <SubscriptionsTable />
    </div>
  );
}
