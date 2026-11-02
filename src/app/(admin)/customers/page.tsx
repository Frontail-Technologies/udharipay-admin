import { PageHeader } from "@/components/admin/PageHeader";
import { CustomersWorkspace } from "@/features/customers/components/CustomersWorkspace";

export default function CustomersPage() {
  return (
    <div className="flex w-full min-w-0 flex-col gap-5">
      <PageHeader title="Customers" description="Manage merchant-owned customer profiles and lifecycle status." />

      <CustomersWorkspace />
    </div>
  );
}
