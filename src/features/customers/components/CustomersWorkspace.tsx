"use client";

import { useCustomerDirectory } from "@/features/customers/hooks/useCustomers";
import { MerchantSelector } from "@/features/customers/components/MerchantSelector";
import { CreateCustomerDialog } from "@/features/customers/components/CreateCustomerDialog";
import { CustomersTable } from "@/features/customers/components/CustomersTable";

export function CustomersWorkspace() {
  const directory = useCustomerDirectory();
  return <div className="flex flex-col gap-3"><div className="flex flex-wrap items-center justify-between gap-3"><MerchantSelector merchantId={directory.merchantId} onSelect={directory.setMerchantId} />{directory.merchantId && <CreateCustomerDialog merchantId={directory.merchantId} />}</div><CustomersTable directory={directory} /></div>;
}
