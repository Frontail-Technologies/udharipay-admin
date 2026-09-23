import { MandatesWorkspace } from "@/features/mandates/components/MandatesWorkspace";

export default function MandatesPage() {
  return (
    <div className="mx-auto flex max-w-7xl min-w-0 flex-col gap-5">
      <div className="min-w-0">
        <h1 className="text-[24px] font-semibold tracking-tight text-text-primary">
          Mandates
        </h1>
        <p className="mt-1 text-[13px] leading-relaxed text-text-secondary">
          View customer payment authorizations and provider attempt history.
        </p>
      </div>

      <MandatesWorkspace />
    </div>
  );
}
