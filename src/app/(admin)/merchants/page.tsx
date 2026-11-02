import { PageHeader } from "@/components/admin/PageHeader";
import { MerchantsTable } from "@/features/merchants/components/MerchantsTable";
import { CreateMerchantDialog } from "@/features/merchants/components/CreateMerchantDialog";

export default function MerchantsPage() {
  return (
    <div className="flex w-full min-w-0 flex-col gap-5">
      <PageHeader title="Merchants" description="Manage merchant profiles, assignments, access and lifecycle status." actions={<CreateMerchantDialog />} />

      <MerchantsTable />
    </div>
  );
}
