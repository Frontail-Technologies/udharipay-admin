import { PageHeader } from "@/components/admin/PageHeader";
import { MandatesWorkspace } from "@/features/mandates/components/MandatesWorkspace";

export default function MandatesPage() {
  return (
    <div className="flex w-full min-w-0 flex-col gap-5">
      <PageHeader title="Mandates" description="View customer payment authorizations and provider attempt history." />

      <MandatesWorkspace />
    </div>
  );
}
