import type { Merchant } from "@/api/generated/contracts/merchants";
import { MerchantBusinessProfileSection } from "@/components/merchants/MerchantBusinessProfileSection";
import { MerchantContactAddressSection } from "@/components/merchants/MerchantContactAddressSection";
import { MerchantAssignmentSection } from "@/components/merchants/MerchantAssignmentSection";
import { MerchantAccountsSection } from "@/components/merchants/MerchantAccountsSection";

export function MerchantOverviewTab({ merchant }: { merchant: Merchant }) {
  return <div className="grid grid-cols-1 gap-4 lg:grid-cols-2"><MerchantBusinessProfileSection merchant={merchant} /><MerchantContactAddressSection merchant={merchant} /><MerchantAssignmentSection merchant={merchant} /><MerchantAccountsSection merchant={merchant} /></div>;
}
