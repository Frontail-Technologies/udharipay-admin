import { KeyValueRow } from "@/components/entity/KeyValueRow";
import { StatusBadge } from "@/components/admin/StatusBadge";

/** Mirrors package.json's "version" — kept as a plain constant since a JSON import isn't wired into this bundle config. */
const ADMIN_VERSION = "0.1.0";

/**
 * Part Q — an honest snapshot of what stage this build is at. No claim of
 * production readiness anywhere here.
 */
export function SystemInfoSection() {
  return (
    <div className="max-w-xl rounded-[11px] border border-border bg-surface p-4">
      <h3 className="text-[13.5px] font-semibold text-text-primary">System Information</h3>
      <div className="mt-3 flex flex-col divide-y divide-border">
        <KeyValueRow label="Environment" value={<StatusBadge tone="info">Demo / Development</StatusBadge>} />
        <KeyValueRow label="Admin Version" value={ADMIN_VERSION} />
        <KeyValueRow label="Backend" value={<StatusBadge tone="neutral">Not Connected</StatusBadge>} />
        <KeyValueRow label="Payment Integration" value={<StatusBadge tone="neutral">Not Connected</StatusBadge>} />
        <KeyValueRow label="KYC Integration" value={<StatusBadge tone="neutral">Demo Data</StatusBadge>} />
      </div>
    </div>
  );
}
