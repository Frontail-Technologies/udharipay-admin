import Link from "next/link";
import { ChevronRight, Store } from "lucide-react";
import type { Customer } from "@/api/generated/contracts/customers";
import { useMerchant } from "@/features/merchants/hooks/useMerchants";
import { merchantStatusTone } from "@/features/merchants/utils/status";
import { CustomerProfileSection } from "@/features/customers/components/CustomerProfileSection";
import { DetailSection } from "@/components/entity/DetailSection";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { humanizeSnakeCase } from "@/lib/format";

export function CustomerOverview({ customer }: { customer: Customer }) {
  const merchantQuery = useMerchant(customer.merchantId);
  const merchant = merchantQuery.data?.data;
  return <div className="grid grid-cols-1 gap-4 lg:grid-cols-2"><CustomerProfileSection customer={customer} /><DetailSection title="Merchant Relationship">{merchant ? <Link href={`/merchants/${merchant.id}`} className="flex items-center gap-3 rounded-lg border border-border p-3 hover:bg-surface-hover"><span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-primary-muted text-primary"><Store className="size-4" /></span><div className="min-w-0 flex-1"><p className="truncate text-[13.5px] font-medium text-text-primary">{merchant.businessName}</p><p className="truncate text-[11.5px] text-text-muted">{merchant.publicId} · {merchant.city}, {merchant.state}</p></div><StatusBadge tone={merchantStatusTone[merchant.status]}>{humanizeSnakeCase(merchant.status)}</StatusBadge><ChevronRight className="size-4 shrink-0 text-text-muted" /></Link> : merchantQuery.isError ? <p className="text-[12.5px] text-error">Merchant details could not be loaded.</p> : <p className="text-[12.5px] text-text-muted">Loading merchant relationship...</p>}</DetailSection></div>;
}
