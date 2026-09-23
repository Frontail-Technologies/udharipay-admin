import { KycDirectory } from "@/features/kyc/components/KycDirectory";

export default function KycQueuePage() {
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

      <KycDirectory />
    </div>
  );
}
