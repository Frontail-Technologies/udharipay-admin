"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { normalizeApiError } from "@/api/http/errors";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

export function KycDecisionDialog({ open, onOpenChange, title, description, confirmLabel, destructive = false, onConfirm, isPending }: { open: boolean; onOpenChange: (open: boolean) => void; title: string; description: string; confirmLabel: string; destructive?: boolean; onConfirm: (reason: string) => Promise<void>; isPending: boolean }) {
  const [reason, setReason] = useState("");
  const valid = reason.trim().length >= 10;
  const confirm = async () => { try { await onConfirm(reason.trim()); setReason(""); onOpenChange(false); } catch (error) { toast.error(normalizeApiError(error).message); } };
  return <Dialog open={open} onOpenChange={(next) => { if (isPending) return; if (!next) setReason(""); onOpenChange(next); }}><DialogContent className="sm:max-w-md"><DialogHeader><DialogTitle>{title}</DialogTitle><DialogDescription>{description}</DialogDescription></DialogHeader><div className="flex flex-col gap-1.5"><label htmlFor="kyc-decision-reason" className="text-[12px] font-medium text-text-secondary">Reason</label><Textarea id="kyc-decision-reason" value={reason} onChange={(event) => setReason(event.target.value)} maxLength={1000} className="min-h-20 text-[13px]" />{reason.length > 0 && !valid && <p className="text-[11px] text-error">Enter at least 10 characters.</p>}</div><DialogFooter><Button type="button" variant="outline" disabled={isPending} onClick={() => onOpenChange(false)}>Cancel</Button><Button type="button" variant={destructive ? "destructive" : "default"} disabled={!valid || isPending} onClick={() => void confirm()}>{isPending && <Loader2 className="size-4 animate-spin" />}{confirmLabel}</Button></DialogFooter></DialogContent></Dialog>;
}
