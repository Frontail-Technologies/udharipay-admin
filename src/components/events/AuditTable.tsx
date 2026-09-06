"use client";

import { useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/table/DataTable";
import { ManagementToolbar } from "@/components/table/ManagementToolbar";
import { AuditDetailSheet } from "@/components/events/AuditDetailSheet";
import { useAdminAuditEvents } from "@/store/adminAuditStore";
import type { AdminAuditEvent } from "@/data/admin/events/types";
import { formatDate, pseudoTimeOfDay } from "@/lib/format";
import { exportRowsToCsv } from "@/lib/csv";

/**
 * Part C — explicitly a DEMO audit presentation, not a production audit
 * trail (no authenticated Admin actor/backend exists yet). See
 * adminAuditStore.ts.
 */
export function AuditTable() {
  const events = useAdminAuditEvents();
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<AdminAuditEvent | null>(null);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return events;
    return events.filter(
      (event) =>
        event.action.toLowerCase().includes(query) ||
        event.entityLabel.toLowerCase().includes(query) ||
        event.actorName.toLowerCase().includes(query),
    );
  }, [events, search]);

  const columns: ColumnDef<AdminAuditEvent>[] = [
    { accessorKey: "actorName", header: "Actor" },
    { accessorKey: "action", header: "Action" },
    { accessorKey: "entityLabel", header: "Entity" },
    {
      id: "changes",
      header: "Changes",
      cell: ({ row }) => (
        <span className="truncate text-text-secondary">
          {row.original.changes && row.original.changes.length > 0
            ? row.original.changes.map((change) => change.field).join(", ")
            : "—"}
        </span>
      ),
    },
    {
      id: "timestamp",
      header: "Timestamp",
      cell: ({ row }) => (
        <span className="text-[12px] text-text-muted">
          {formatDate(row.original.createdAt.slice(0, 10))} · {pseudoTimeOfDay(row.original.id)}
        </span>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-3">
      <p className="text-[11.5px] text-text-muted">
        Demo audit history — production audit logging will be server-side.
      </p>

      <ManagementToolbar
        search={{ value: search, onChange: setSearch, placeholder: "Search audit log...", ariaLabel: "Search audit log" }}
        exportAriaLabel="Export audit log"
        onExport={() =>
          exportRowsToCsv("audit-log.csv", filtered, [
            { header: "Actor", accessor: (row) => row.actorName },
            { header: "Action", accessor: (row) => row.action },
            { header: "Entity", accessor: (row) => row.entityLabel },
            {
              header: "Changes",
              accessor: (row) => (row.changes ?? []).map((change) => `${change.field}: ${change.from} -> ${change.to}`).join("; "),
            },
            { header: "Timestamp", accessor: (row) => row.createdAt },
          ])
        }
      />

      <DataTable
        columns={columns}
        data={filtered}
        enablePagination
        pageSize={12}
        stickyHeader
        tableClassName="min-w-[950px]"
        onRowClick={(row) => setSelected(row)}
        emptyState={<span className="text-[13px] text-text-muted">No audit entries match this search.</span>}
      />

      <AuditDetailSheet event={selected} onOpenChange={(open) => !open && setSelected(null)} />
    </div>
  );
}
