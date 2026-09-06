import { MandatesTable } from "@/components/mandates/MandatesTable";
import { MandatesSummary } from "@/components/mandates/MandatesSummary";

export default function MandatesPage() {
  return (
    <div className="mx-auto flex max-w-7xl min-w-0 flex-col gap-5">
      <div className="min-w-0">
        <h1 className="text-[24px] font-semibold tracking-tight text-text-primary">
          Mandates
        </h1>
        <p className="mt-1 text-[13px] leading-relaxed text-text-secondary">
          Monitor customer autopay authorizations used to collect Udhaar repayments.
        </p>
      </div>

      <MandatesSummary />
      <MandatesTable />
    </div>
  );
}
