import { CustomersWorkspace } from "@/features/customers/components/CustomersWorkspace";

export default function CustomersPage() {
  return (
    <div className="mx-auto flex max-w-7xl min-w-0 flex-col gap-5">
      <div className="min-w-0">
        <h1 className="text-[24px] font-semibold tracking-tight text-text-primary">
          Customers
        </h1>
        <p className="mt-1 text-[13px] leading-relaxed text-text-secondary">
          Manage merchant-owned customer profiles and lifecycle status.
        </p>
      </div>

      <CustomersWorkspace />
    </div>
  );
}
