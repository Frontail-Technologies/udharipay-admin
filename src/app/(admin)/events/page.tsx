import { PageHeader } from "@/components/admin/PageHeader";
import { AuditWorkspace } from "@/features/audit/components/AuditWorkspace";

export default function EventsPage() {
  return (
    <div className="flex w-full min-w-0 flex-col gap-5">
      <PageHeader title="Events" description="Canonical audit log of administrative and system actions across the platform." />

      <AuditWorkspace />
    </div>
  );
}
