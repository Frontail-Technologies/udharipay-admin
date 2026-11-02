import { PageHeader } from "@/components/admin/PageHeader";
import { KycDirectory } from "@/features/kyc/components/KycDirectory";

export default function KycQueuePage() {
  return (
    <div className="flex w-full min-w-0 flex-col gap-5">
      <PageHeader title="KYC &amp; Verification" description="Review identity, business and compliance submissions." />

      <KycDirectory />
    </div>
  );
}
