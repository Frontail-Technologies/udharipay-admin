"use client";

import { useDeferredValue, useState } from "react";
import { Check, Loader2, Search, Store } from "lucide-react";
import { useMerchant, useMerchants } from "@/features/merchants/hooks/useMerchants";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

export function MerchantSelector({ merchantId, onSelect }: { merchantId?: string; onSelect: (merchantId: string) => void }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);
  const merchantsQuery = useMerchants({ limit: 25, search: deferredSearch || undefined });
  const selectedQuery = useMerchant(merchantId);
  const merchants = merchantsQuery.data?.data.items ?? [];
  const selected = selectedQuery.data?.data;

  return <Dialog open={open} onOpenChange={(next) => { setOpen(next); if (!next) setSearch(""); }}>
    <DialogTrigger asChild><Button type="button" variant="outline" className="h-9 min-w-52 justify-start gap-2"><Store className="size-4" /><span className="truncate">{selected?.businessName ?? (merchantId ? "Selected merchant" : "Select Merchant")}</span></Button></DialogTrigger>
    <DialogContent className="sm:max-w-md"><DialogHeader><DialogTitle>Select Merchant</DialogTitle><DialogDescription>Choose the merchant whose customers you want to manage.</DialogDescription></DialogHeader>
      <div className="relative"><Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-text-muted" /><Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search merchants" className="pl-9" /></div>
      <div className="max-h-72 overflow-y-auto rounded-lg border border-border">{merchantsQuery.isPending ? <div className="flex justify-center p-6"><Loader2 className="size-4 animate-spin" /></div> : merchants.length ? merchants.map((merchant) => <button key={merchant.id} type="button" onClick={() => { onSelect(merchant.id); setOpen(false); setSearch(""); }} className="flex w-full items-center justify-between border-b border-border px-3 py-2.5 text-left last:border-b-0 hover:bg-surface-hover"><span><span className="block text-[13px] font-medium text-text-primary">{merchant.businessName}</span><span className="block text-[11.5px] text-text-muted">{merchant.publicId} · {merchant.city}, {merchant.state}</span></span>{merchant.id === merchantId && <Check className="size-4 text-primary" />}</button>) : <p className="p-6 text-center text-[12.5px] text-text-muted">No merchants found.</p>}</div>
    </DialogContent>
  </Dialog>;
}
