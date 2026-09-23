"use client";

import { useDeferredValue, useState } from "react";
import { Check, Loader2, Search, User } from "lucide-react";
import { useEmployee, useEmployees } from "@/features/employees/hooks/useEmployees";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

export function EmployeeSelector({ employeeId, onSelect }: { employeeId?: string; onSelect: (employeeId: string) => void }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);
  const employeesQuery = useEmployees({ limit: 25, search: deferredSearch || undefined });
  const selectedQuery = useEmployee(employeeId ?? "");
  const employees = employeesQuery.data?.data.items ?? [];
  const selected = employeeId ? selectedQuery.data?.data : undefined;

  return <Dialog open={open} onOpenChange={(next) => { setOpen(next); if (!next) setSearch(""); }}>
    <DialogTrigger asChild><Button type="button" variant="outline" className="h-9 min-w-52 justify-start gap-2"><User className="size-4" /><span className="truncate">{selected?.name ?? (employeeId ? "Selected employee" : "Select Employee")}</span></Button></DialogTrigger>
    <DialogContent className="sm:max-w-md"><DialogHeader><DialogTitle>Select Employee</DialogTitle><DialogDescription>Choose the employee to filter by.</DialogDescription></DialogHeader>
      <div className="relative"><Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-text-muted" /><Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search employees" className="pl-9" /></div>
      <div className="max-h-72 overflow-y-auto rounded-lg border border-border">{employeesQuery.isPending ? <div className="flex justify-center p-6"><Loader2 className="size-4 animate-spin" /></div> : employees.length ? employees.map((employee) => <button key={employee.id} type="button" onClick={() => { onSelect(employee.id); setOpen(false); setSearch(""); }} className="flex w-full items-center justify-between border-b border-border px-3 py-2.5 text-left last:border-b-0 hover:bg-surface-hover"><span><span className="block text-[13px] font-medium text-text-primary">{employee.name}</span><span className="block text-[11.5px] text-text-muted">{employee.publicId} · {employee.branch ?? "No branch"}</span></span>{employee.id === employeeId && <Check className="size-4 text-primary" />}</button>) : <p className="p-6 text-center text-[12.5px] text-text-muted">No employees found.</p>}</div>
    </DialogContent>
  </Dialog>;
}
