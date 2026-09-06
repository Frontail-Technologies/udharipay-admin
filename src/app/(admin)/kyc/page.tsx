import { KycQueueTable } from "@/components/kyc/KycQueueTable";
import { KycQueueSummary } from "@/components/kyc/KycQueueSummary";
import { DEMO_TODAY } from "@/data/admin";

export default function KycQueuePage() {
  const demoTodayIso = DEMO_TODAY.toISOString().slice(0, 10);

  return (
    <div className="mx-auto flex max-w-7xl min-w-0 flex-col gap-5">
      <div className="min-w-0">
        <h1 className="text-[24px] font-semibold tracking-tight text-text-primary">
          KYC &amp; Verification
        </h1>
        <p className="mt-1 text-[13px] leading-relaxed text-text-secondary">
          Review identity, business and compliance submissions.
        </p>
      </div>

      <KycQueueSummary />
      <KycQueueTable demoTodayIso={demoTodayIso} />
    </div>
  );
}
