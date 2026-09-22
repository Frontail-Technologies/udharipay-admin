"use client";

import { useDeferredValue, useState } from "react";
import { Check, Loader2, Search, User } from "lucide-react";
import { useCustomer, useCustomers } from "@/features/customers/hooks/useCustomers";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

export function CustomerSelector({ merchantId, customerId, onSelect }: { merchantId?: string; customerId?: string; onSelect: (customerId: string) => void }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);
  const customersQuery = useCustomers(merchantId, { limit: 25, search: deferredSearch || undefined });
  const selectedQuery = useCustomer(customerId);
  const customers = customersQuery.data?.data.items ?? [];
  const selected = customerId ? selectedQuery.data?.data : undefined;

  return <Dialog open={open} onOpenChange={(next) => { setOpen(next); if (!next) setSearch(""); }}>
    <DialogTrigger asChild><Button type="button" variant="outline" disabled={!merchantId} className="h-9 min-w-52 justify-start gap-2"><User className="size-4" /><span className="truncate">{selected?.name ?? (customerId ? "Selected customer" : "Select Customer")}</span></Button></DialogTrigger>
    <DialogContent className="sm:max-w-md"><DialogHeader><DialogTitle>Select Customer</DialogTitle><DialogDescription>Choose the customer whose Udhaar Plans you want to manage.</DialogDescription></DialogHeader>
      <div className="relative"><Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-text-muted" /><Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search customers" className="pl-9" /></div>
      <div className="max-h-72 overflow-y-auto rounded-lg border border-border">{customersQuery.isPending ? <div className="flex justify-center p-6"><Loader2 className="size-4 animate-spin" /></div> : customers.length ? customers.map((customer) => <button key={customer.id} type="button" onClick={() => { onSelect(customer.id); setOpen(false); setSearch(""); }} className="flex w-full items-center justify-between border-b border-border px-3 py-2.5 text-left last:border-b-0 hover:bg-surface-hover"><span><span className="block text-[13px] font-medium text-text-primary">{customer.name}</span><span className="block text-[11.5px] text-text-muted">{customer.publicId} · {customer.phone}</span></span>{customer.id === customerId && <Check className="size-4 text-primary" />}</button>) : <p className="p-6 text-center text-[12.5px] text-text-muted">No customers found.</p>}</div>
    </DialogContent>
  </Dialog>;
}
