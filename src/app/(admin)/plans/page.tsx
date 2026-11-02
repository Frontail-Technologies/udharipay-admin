import { PageHeader } from "@/components/admin/PageHeader";
import { PlansWorkspace } from "@/features/plans/components/PlansWorkspace";

export default function PlansPage() {
  return (
    <div className="mx-auto flex max-w-7xl min-w-0 flex-col gap-5">
      <PageHeader title="Udhaar Plans" description="View customer plans and their backend-generated installment schedules." />
      <PlansWorkspace />
    </div>
  );
}
