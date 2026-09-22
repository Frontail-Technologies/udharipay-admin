import { MerchantsTable } from "@/components/merchants/MerchantsTable";
import { CreateMerchantDialog } from "@/components/merchants/CreateMerchantDialog";

export default function MerchantsPage() {
  return (
    <div className="mx-auto flex max-w-7xl min-w-0 flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-[24px] font-semibold tracking-tight text-text-primary">
            Merchants
          </h1>
          <p className="mt-1 text-[13px] leading-relaxed text-text-secondary">
            Manage merchant profiles, assignments, access and lifecycle status.
          </p>
        </div>
        <CreateMerchantDialog />
      </div>

      <MerchantsTable />
    </div>
  );
}
