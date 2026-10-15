"use client";

import { useState, useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import type { UseMutationResult } from "@tanstack/react-query";
import { Check, X, Pencil } from "lucide-react";
import type { MasterDataItem } from "@/api/generated/contracts/master-data";
import { normalizeApiError } from "@/api/http/errors";
import { DataTable } from "@/components/table/DataTable";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatIndiaDateFromTimestamp } from "@/shared/utils/date";
import { toast } from "sonner";

type UpdateFn = UseMutationResult<unknown, unknown, { id: string; body: { name?: string; isActive?: boolean; sortOrder?: number } }>;

type Props = {
  items: MasterDataItem[];
  isLoading: boolean;
  updateMutation: UpdateFn;
};

type EditState = { id: string; name: string; sortOrder: string };

export function MasterDataTable({ items, isLoading, updateMutation }: Props) {
  const [editing, setEditing] = useState<EditState | null>(null);

  const startEdit = (item: MasterDataItem) => {
    setEditing({ id: item.id, name: item.name, sortOrder: String(item.sortOrder) });
  };

  const cancelEdit = () => setEditing(null);

  const saveEdit = async () => {
    if (!editing) return;
    const sortOrder = parseInt(editing.sortOrder, 10);
    if (isNaN(sortOrder) || sortOrder < 0) {
      toast.error("Sort order must be a non-negative number");
      return;
    }
    try {
      await updateMutation.mutateAsync({ id: editing.id, body: { name: editing.name.trim() || undefined, sortOrder } });
      setEditing(null);
    } catch (error) {
      toast.error(normalizeApiError(error).message);
    }
  };

  const toggleActive = async (item: MasterDataItem) => {
    try {
      await updateMutation.mutateAsync({ id: item.id, body: { isActive: !item.isActive } });
    } catch (error) {
      toast.error(normalizeApiError(error).message);
    }
  };

  const columns = useMemo<ColumnDef<MasterDataItem>[]>(() => [
    {
      accessorKey: "code",
      header: "Code",
      cell: ({ row }) => <span className="font-mono text-[12px] text-text-muted">{row.original.code}</span>,
    },
    {
      accessorKey: "name",
      header: "Display Name",
      cell: ({ row }) => {
        if (editing?.id === row.original.id) {
          return (
            <Input
              value={editing.name}
              onChange={(e) => setEditing((s) => s ? { ...s, name: e.target.value } : null)}
              className="h-7 max-w-56 text-[12.5px]"
              onKeyDown={(e) => { if (e.key === "Enter") saveEdit(); if (e.key === "Escape") cancelEdit(); }}
              autoFocus
            />
          );
        }
        return <span className="text-text-primary">{row.original.name}</span>;
      },
    },
    {
      accessorKey: "sortOrder",
      header: "Order",
      cell: ({ row }) => {
        if (editing?.id === row.original.id) {
          return (
            <Input
              value={editing.sortOrder}
              onChange={(e) => setEditing((s) => s ? { ...s, sortOrder: e.target.value } : null)}
              className="h-7 w-16 text-[12.5px]"
              onKeyDown={(e) => { if (e.key === "Enter") saveEdit(); if (e.key === "Escape") cancelEdit(); }}
            />
          );
        }
        return <span className="text-text-secondary">{row.original.sortOrder}</span>;
      },
    },
    {
      accessorKey: "isActive",
      header: "Active",
      cell: ({ row }) => (
        <StatusBadge tone={row.original.isActive ? "success" : "neutral"}>
          {row.original.isActive ? "Active" : "Inactive"}
        </StatusBadge>
      ),
    },
    {
      accessorKey: "updatedAt",
      header: "Updated",
      cell: ({ row }) => <span className="text-[12px] text-text-muted">{formatIndiaDateFromTimestamp(row.original.updatedAt)}</span>,
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => {
        if (editing?.id === row.original.id) {
          return (
            <div className="flex items-center gap-1">
              <Button type="button" size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={saveEdit} disabled={updateMutation.isPending} aria-label="Save">
                <Check className="size-3.5 text-green-600" />
              </Button>
              <Button type="button" size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={cancelEdit} aria-label="Cancel">
                <X className="size-3.5 text-text-muted" />
              </Button>
            </div>
          );
        }
        return (
          <div className="flex items-center gap-1">
            <Button type="button" size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => startEdit(row.original)} aria-label="Edit name and order">
              <Pencil className="size-3.5 text-text-muted" />
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              className="h-7 px-2 text-[11.5px]"
              onClick={() => toggleActive(row.original)}
              disabled={updateMutation.isPending}
            >
              {row.original.isActive ? "Deactivate" : "Activate"}
            </Button>
          </div>
        );
      },
    },
  ], [editing, updateMutation.isPending]);

  return (
    <DataTable
      columns={columns}
      data={items}
      isLoading={isLoading}
      tableClassName="min-w-[600px]"
      emptyState={<span className="text-[13px] text-text-muted">No items found.</span>}
    />
  );
}
