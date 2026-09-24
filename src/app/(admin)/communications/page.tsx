import { CommunicationsView } from "@/features/communications/components/CommunicationsView";

export default function CommunicationsPage() {
  return (
    <div className="mx-auto flex max-w-7xl min-w-0 flex-col gap-5">
      <div className="min-w-0">
        <h1 className="text-[24px] font-semibold tracking-tight text-text-primary">Communications</h1>
        <p className="mt-1 text-[13px] leading-relaxed text-text-secondary">
          Manage customer reminders and team announcements.
        </p>
      </div>
      <CommunicationsView />
    </div>
  );
}
