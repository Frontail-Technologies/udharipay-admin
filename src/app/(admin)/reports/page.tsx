import { PageHeader } from "@/components/admin/PageHeader";
import { ReportsWorkspace } from "@/features/reports/components/ReportsWorkspace";

export default function ReportsPage() {
  return (
    <div className="flex w-full min-w-0 flex-col gap-5">
      <PageHeader title="Reports &amp; Insights" description="Canonical backend reports across collections, receivables, merchant activity and platform operations." />

      <ReportsWorkspace />
    </div>
  );
}
