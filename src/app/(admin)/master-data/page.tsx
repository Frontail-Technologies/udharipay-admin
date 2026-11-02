import { PageHeader } from "@/components/admin/PageHeader";
import { MasterDataView } from "@/features/master-data/components/MasterDataView";

export default function MasterDataPage() {
  return (
    <div className="mx-auto flex max-w-7xl min-w-0 flex-col gap-5">
      <PageHeader title="Master Data" description="Manage configurable display values for business selectors. Codes are fixed; names, order, and active state are editable." />

      <MasterDataView />
    </div>
  );
}
