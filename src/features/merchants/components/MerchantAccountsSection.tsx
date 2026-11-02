import type { Merchant } from "@/api/generated/contracts/merchants";
import { DetailSection } from "@/components/entity/DetailSection";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { ProvisionMerchantAccountDialog } from "@/features/merchants/components/ProvisionMerchantAccountDialog";
import { humanizeSnakeCase } from "@/lib/format";

export function MerchantAccountsSection({ merchant }: { merchant: Merchant }) {
  const accounts = merchant.accounts ?? [];
  return <DetailSection title="Merchant Login Accounts" description="Business lifecycle and login account statuses are managed separately." action={<ProvisionMerchantAccountDialog merchantId={merchant.id} />} className="lg:col-span-2">
    {accounts.length ? <div className="overflow-x-auto"><table className="w-full min-w-[620px] text-left text-[12.5px]"><thead className="bg-table-header"><tr className="border-b border-border-strong text-text-secondary"><th className="px-3 py-2 font-semibold">Login</th><th className="px-3 py-2 font-semibold">Role</th><th className="px-3 py-2 font-semibold">Account Status</th><th className="px-3 py-2 font-semibold">Membership</th></tr></thead><tbody>{accounts.map((account) => <tr key={account.userId} className="border-b border-border last:border-b-0"><td className="px-3 py-2.5"><p className="text-text-primary">{account.email ?? account.phone ?? "No login identifier"}</p><p className="text-[11px] text-text-muted">{account.userId}</p></td><td className="px-3 py-2.5 text-text-secondary">{humanizeSnakeCase(account.role)}</td><td className="px-3 py-2.5"><StatusBadge tone={account.status === "active" ? "success" : "neutral"}>{humanizeSnakeCase(account.status)}</StatusBadge></td><td className="px-3 py-2.5"><StatusBadge tone={account.membershipStatus === "active" ? "success" : "neutral"}>{humanizeSnakeCase(account.membershipStatus)}</StatusBadge></td></tr>)}</tbody></table></div> : <p className="py-4 text-center text-[12.5px] text-text-muted">No merchant login account has been provisioned.</p>}
  </DetailSection>;
}
