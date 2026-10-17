"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { normalizeApiError } from "@/api/http/errors";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { formatIndiaDateFromTimestamp } from "@/shared/utils/date";
import { useCountries, useCreateState, useStates, useUpdateState } from "../hooks/useMasterData";

type EditState = { id: string; name: string; sortOrder: string } | null;

export function StatesPanel() {
  const countries = useCountries();
  const [countryId, setCountryId] = useState("");
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<EditState>(null);
  const [form, setForm] = useState({ code: "", name: "", sortOrder: "0" });
  const states = useStates(countryId);
  const create = useCreateState();
  const update = useUpdateState();
  const countryName = new Map((countries.data?.data.items ?? []).map((item) => [item.id, item.name]));
  const rows = useMemo(() => (states.data?.data.items ?? []).filter((item) => item.name.toLowerCase().includes(search.toLowerCase()) || item.code.toLowerCase().includes(search.toLowerCase())), [states.data, search]);

  async function saveNew() {
    if (!countryId || !form.code.trim() || !form.name.trim()) return toast.error("Country, name and code are required");
    try { await create.mutateAsync({ countryId, code: form.code.trim().toUpperCase(), name: form.name.trim(), sortOrder: Number(form.sortOrder) || 0 }); setForm({ code: "", name: "", sortOrder: "0" }); } catch (error) { toast.error(normalizeApiError(error).message); }
  }

  async function saveEdit() {
    if (!editing) return;
    try { await update.mutateAsync({ id: editing.id, body: { name: editing.name.trim(), sortOrder: Number(editing.sortOrder) || 0 } }); setEditing(null); } catch (error) { toast.error(normalizeApiError(error).message); }
  }

  return <section className="flex flex-col gap-4">
    <div className="grid gap-2 rounded-lg border border-border bg-surface p-4 md:grid-cols-4">
      <select className="h-9 rounded-md border border-border bg-background px-3 text-sm" value={countryId} onChange={(event) => setCountryId(event.target.value)}><option value="">Select country</option>{(countries.data?.data.items ?? []).map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select>
      <Input placeholder="State name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
      <Input placeholder="Code" value={form.code} onChange={(event) => setForm({ ...form, code: event.target.value })} />
      <div className="flex gap-2"><Input placeholder="Sort" type="number" value={form.sortOrder} onChange={(event) => setForm({ ...form, sortOrder: event.target.value })} /><Button type="button" onClick={() => void saveNew()} disabled={create.isPending}>Add State</Button></div>
    </div>
    <div className="flex items-center justify-between gap-3"><Input className="max-w-sm" placeholder="Search states" value={search} onChange={(event) => setSearch(event.target.value)} /><span className="text-xs text-text-muted">{countryName.get(countryId) ?? "Choose a country"}</span></div>
    <div className="overflow-x-auto rounded-lg border border-border"><table className="w-full min-w-[760px] text-left text-[12.5px]"><thead className="border-b border-border bg-muted"><tr>{["Name", "Code", "Country", "Status", "Sort Order", "Updated", ""].map((label) => <th key={label} className="px-3 py-2 font-medium text-text-muted">{label}</th>)}</tr></thead><tbody>{rows.map((row) => <tr key={row.id} className="border-b border-border last:border-0"><td className="px-3 py-2">{editing?.id === row.id ? <Input className="h-7" value={editing.name} onChange={(event) => setEditing({ ...editing, name: event.target.value })} /> : row.name}</td><td className="px-3 py-2 font-mono text-text-muted">{row.code}</td><td className="px-3 py-2">{countryName.get(row.countryId) ?? "-"}</td><td className="px-3 py-2"><StatusBadge tone={row.isActive ? "success" : "neutral"}>{row.isActive ? "Active" : "Inactive"}</StatusBadge></td><td className="px-3 py-2">{editing?.id === row.id ? <Input className="h-7 w-20" type="number" value={editing.sortOrder} onChange={(event) => setEditing({ ...editing, sortOrder: event.target.value })} /> : row.sortOrder}</td><td className="px-3 py-2 text-text-muted">{formatIndiaDateFromTimestamp(row.updatedAt)}</td><td className="px-3 py-2"><div className="flex gap-1">{editing?.id === row.id ? <Button size="sm" onClick={() => void saveEdit()}>Save</Button> : <Button size="sm" variant="ghost" onClick={() => setEditing({ id: row.id, name: row.name, sortOrder: String(row.sortOrder) })}>Edit</Button>}<Button size="sm" variant="ghost" onClick={() => void update.mutateAsync({ id: row.id, body: { isActive: !row.isActive } })}>{row.isActive ? "Deactivate" : "Activate"}</Button></div></td></tr>)}</tbody></table></div>
  </section>;
}
