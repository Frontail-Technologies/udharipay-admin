import { MasterDataView } from "@/features/master-data/components/MasterDataView";

export default function MasterDataPage() {
  return (
    <div className="mx-auto flex max-w-7xl min-w-0 flex-col gap-5">
      <div className="min-w-0">
        <h1 className="text-[24px] font-semibold tracking-tight text-text-primary">
          Master Data
        </h1>
        <p className="mt-1 text-[13px] leading-relaxed text-text-secondary">
          Manage configurable display values for business selectors. Codes are fixed; names, order, and active state are editable.
        </p>
      </div>

      <MasterDataView />
    </div>
  );
}
