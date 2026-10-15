import { GlobalPaymentsTable } from "@/features/payments/components/GlobalPaymentsTable";

export default function PaymentsPage() {
  return (
    <div className="mx-auto flex max-w-7xl min-w-0 flex-col gap-5">
      <div className="min-w-0">
        <h1 className="text-[24px] font-semibold tracking-tight text-text-primary">
          Payments
        </h1>
        <p className="mt-1 text-[13px] leading-relaxed text-text-secondary">
          All transactions across collections, activation fees, and merchant subscriptions.
        </p>
      </div>

      <GlobalPaymentsTable />
    </div>
  );
}
