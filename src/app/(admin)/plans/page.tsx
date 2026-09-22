import { PlansWorkspace } from "@/features/plans/components/PlansWorkspace";

export default function PlansPage() {
  return (
    <div className="mx-auto flex max-w-7xl min-w-0 flex-col gap-5">
      <div className="min-w-0">
          <h1 className="text-[24px] font-semibold tracking-tight text-text-primary">
            Udhaar Plans
          </h1>
          <p className="mt-1 text-[13px] leading-relaxed text-text-secondary">
            View customer plans and their backend-generated installment schedules.
          </p>
      </div>
      <PlansWorkspace />
    </div>
  );
}
