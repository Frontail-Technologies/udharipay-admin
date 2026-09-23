import { AuditWorkspace } from "@/features/audit/components/AuditWorkspace";

export default function EventsPage() {
  return (
    <div className="mx-auto flex max-w-7xl min-w-0 flex-col gap-5">
      <div className="min-w-0">
        <h1 className="text-[24px] font-semibold tracking-tight text-text-primary">Events</h1>
        <p className="mt-1 text-[13px] leading-relaxed text-text-secondary">
          Canonical audit log of administrative and system actions across the platform.
        </p>
      </div>

      <AuditWorkspace />
    </div>
  );
}
