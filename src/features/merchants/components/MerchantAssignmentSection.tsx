"use client";

import { useDeferredValue, useMemo, useState } from "react";
import { Loader2, Search } from "lucide-react";
import { toast } from "sonner";
import type { Merchant } from "@/api/generated/contracts/merchants";
import { normalizeApiError } from "@/api/http/errors";
import { useEmployees } from "@/features/employees/hooks/useEmployees";
import { useAssignMerchant, useUnassignMerchant } from "@/features/merchants/hooks/useMerchants";
import { DetailSection } from "@/components/entity/DetailSection";
import { KeyValueRow } from "@/components/entity/KeyValueRow";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

export function MerchantAssignmentSection({ merchant }: { merchant: Merchant }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(merchant.assignedEmployeeId ?? "");
  const deferredSearch = useDeferredValue(search);
  const params = useMemo(() => ({ limit: 25, status: "active" as const, search: deferredSearch || undefined }), [deferredSearch]);
  const employeesQuery = useEmployees(params);
  const assignment = useAssignMerchant();
  const unassignment = useUnassignMerchant();
  const employees = employeesQuery.data?.data.items ?? [];
  const currentEmployee = employees.find((employee) => employee.id === merchant.assignedEmployeeId);

  const setDialogOpen = (next: boolean) => {
    if (assignment.isPending) return;
    setOpen(next);
    if (next) { setSearch(""); setSelectedEmployeeId(merchant.assignedEmployeeId ?? ""); }
  };

  const submit = async () => {
    if (!selectedEmployeeId || selectedEmployeeId === merchant.assignedEmployeeId) { setOpen(false); return; }
    try {
      await assignment.mutateAsync({ merchantId: merchant.id, input: { assignedEmployeeId: selectedEmployeeId } });
      setOpen(false);
    } catch (error) {
      toast.error(normalizeApiError(error).message);
    }
  };

  return <DetailSection title="Employee Assignment" action={<div className="flex gap-2"><Dialog open={open} onOpenChange={setDialogOpen}><DialogTrigger asChild><Button type="button" variant="outline" size="sm" className="h-8 text-[12.5px]">{merchant.assignedEmployeeId ? "Reassign" : "Assign"}</Button></DialogTrigger><DialogContent className="sm:max-w-md"><DialogHeader><DialogTitle>{merchant.assignedEmployeeId ? "Reassign Merchant" : "Assign Merchant"}</DialogTitle><DialogDescription>Select an active employee using the live employee directory.</DialogDescription></DialogHeader><div className="relative"><Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-text-muted" /><Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search employees" className="pl-9" /></div><div className="max-h-64 overflow-y-auto rounded-lg border border-border">
    {employeesQuery.isPending ? <div className="flex justify-center p-6"><Loader2 className="size-4 animate-spin" /></div> : employees.length ? employees.map((employee) => <button key={employee.id} type="button" onClick={() => setSelectedEmployeeId(employee.id)} className={`flex w-full items-center justify-between border-b border-border px-3 py-2.5 text-left last:border-b-0 ${selectedEmployeeId === employee.id ? "bg-primary/5 text-primary" : "hover:bg-surface-hover"}`}><span><span className="block text-[13px] font-medium">{employee.name}</span><span className="block text-[11.5px] text-text-muted">{employee.publicId} · {employee.branch ?? "No branch"}</span></span>{selectedEmployeeId === employee.id && <StatusBadge tone="primary">Selected</StatusBadge>}</button>) : <p className="p-6 text-center text-[12.5px] text-text-muted">No active employees found.</p>}
  </div><DialogFooter><Button type="button" variant="outline" disabled={assignment.isPending} onClick={() => setDialogOpen(false)}>Cancel</Button><Button type="button" disabled={!selectedEmployeeId || selectedEmployeeId === merchant.assignedEmployeeId || assignment.isPending} onClick={() => void submit()}>{assignment.isPending && <Loader2 className="size-4 animate-spin" />}Save Assignment</Button></DialogFooter></DialogContent></Dialog>{merchant.assignedEmployeeId && <Button type="button" variant="outline" size="sm" className="h-8 text-[12.5px] text-error" disabled={unassignment.isPending} onClick={() => void unassignment.unassign(merchant)}>Unassign</Button>}</div>}>
    <KeyValueRow label="Assigned Employee" value={currentEmployee ? `${currentEmployee.name} (${currentEmployee.publicId})` : merchant.assignedEmployeeId ?? "Unassigned"} />
    <KeyValueRow label="Assignment State" value={<StatusBadge tone={merchant.assignedEmployeeId ? "success" : "neutral"}>{merchant.assignedEmployeeId ? "Assigned" : "Unassigned"}</StatusBadge>} />
  </DetailSection>;
}
