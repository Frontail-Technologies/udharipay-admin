import { PageHeader } from "@/components/admin/PageHeader";
import { CommunicationsView } from "@/features/communications/components/CommunicationsView";

export default function CommunicationsPage() {
  return (
    <div className="flex w-full min-w-0 flex-col gap-5">
      <PageHeader title="Communications" description="Manage customer reminders and team announcements." />
      <CommunicationsView />
    </div>
  );
}
