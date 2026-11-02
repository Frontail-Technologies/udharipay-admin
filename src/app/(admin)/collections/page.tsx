import { PageHeader } from "@/components/admin/PageHeader";
import { CollectionsWorkspace } from "@/features/collections/components/CollectionsWorkspace";

export default function CollectionsPage() {
  return (
    <div className="flex w-full min-w-0 flex-col gap-5">
      <PageHeader title="Collections" description="Track due, overdue and upcoming customer collections." />

      <CollectionsWorkspace />
    </div>
  );
}
