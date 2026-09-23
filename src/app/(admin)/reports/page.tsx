import { ReportsWorkspace } from "@/features/reports/components/ReportsWorkspace";

export default function ReportsPage() {
  return (
    <div className="mx-auto flex max-w-7xl min-w-0 flex-col gap-5">
      <div className="min-w-0">
        <h1 className="text-[24px] font-semibold tracking-tight text-text-primary">Reports &amp; Insights</h1>
        <p className="mt-1 text-[13px] leading-relaxed text-text-secondary">
          Canonical backend reports across collections, receivables, merchant activity and platform operations.
        </p>
      </div>

      <ReportsWorkspace />
    </div>
  );
}
