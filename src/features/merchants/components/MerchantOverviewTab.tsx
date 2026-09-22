import type { Merchant } from "@/api/generated/contracts/merchants";
import { MerchantBusinessProfileSection } from "@/features/merchants/components/MerchantBusinessProfileSection";
import { MerchantContactAddressSection } from "@/features/merchants/components/MerchantContactAddressSection";
import { MerchantAssignmentSection } from "@/features/merchants/components/MerchantAssignmentSection";
import { MerchantAccountsSection } from "@/features/merchants/components/MerchantAccountsSection";

export function MerchantOverviewTab({ merchant }: { merchant: Merchant }) {
  return <div className="grid grid-cols-1 gap-4 lg:grid-cols-2"><MerchantBusinessProfileSection merchant={merchant} /><MerchantContactAddressSection merchant={merchant} /><MerchantAssignmentSection merchant={merchant} /><MerchantAccountsSection merchant={merchant} /></div>;
}
