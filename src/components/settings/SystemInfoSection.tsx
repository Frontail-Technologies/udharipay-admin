import { KeyValueRow } from "@/components/entity/KeyValueRow";
import { StatusBadge } from "@/components/admin/StatusBadge";

const ADMIN_VERSION = "0.1.0";

export function SystemInfoSection() {
  return (
    <div className="max-w-xl rounded-[11px] border border-border bg-surface p-4">
      <h3 className="text-[13.5px] font-semibold text-text-primary">System Information</h3>
      <div className="mt-3 flex flex-col divide-y divide-border">
        <KeyValueRow label="Admin Version" value={ADMIN_VERSION} />
        <KeyValueRow label="Backend" value={<StatusBadge tone="success">Connected</StatusBadge>} />
      </div>
    </div>
  );
}
