import { CustomersTable } from "@/components/customers/CustomersTable";

export default function CustomersPage() {
  return (
    <div className="mx-auto flex max-w-7xl min-w-0 flex-col gap-5">
      <div className="min-w-0">
        <h1 className="text-[24px] font-semibold tracking-tight text-text-primary">
          Customers
        </h1>
        <p className="mt-1 text-[13px] leading-relaxed text-text-secondary">
          Monitor customer udhaar plans, collections and repayment status.
        </p>
      </div>

      <CustomersTable pageSize={10} />
    </div>
  );
}
