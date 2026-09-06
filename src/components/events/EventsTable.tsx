"use client";

import { useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/table/DataTable";
import { ManagementToolbar, type ManagementFilterDef } from "@/components/table/ManagementToolbar";
import { RowActionsMenu } from "@/components/table/RowActionsMenu";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { EventDetailSheet } from "@/components/events/EventDetailSheet";
import { useEventEntityResolver } from "@/components/events/resolveEventEntity";
import { useAdminOperationalEvents } from "@/hooks/useAdminEvents";
import type { AdminOperationalEvent, EventCategory, EventEntityType, EventSeverity, EventStatus } from "@/data/admin/events/types";
import { eventSeverityTone, eventStatusTone } from "@/data/admin/statusTones";
import { formatDate, humanizeSnakeCase, pseudoTimeOfDay } from "@/lib/format";
import { exportRowsToCsv } from "@/lib/csv";

const CATEGORY_OPTIONS: EventCategory[] = [
  "collection",
  "payment",
  "mandate",
  "subscription",
  "kyc",
  "merchant",
  "customer",
  "employee",
  "plan",
  "system",
];
const SEVERITY_OPTIONS: EventSeverity[] = ["info", "success", "warning", "critical"];
const STATUS_OPTIONS: EventStatus[] = ["open", "resolved", "informational"];
const ENTITY_TYPE_OPTIONS: EventEntityType[] = [
  "customer",
  "merchant",
  "employee",
  "mandate",
  "subscription",
  "plan",
  "kyc_review",
  "installment",
  "payment",
];

export function EventsTable() {
  const events = useAdminOperationalEvents();
  const resolveEntity = useEventEntityResolver();

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string>("all");
  const [severity, setSeverity] = useState<string>("all");
  const [status, setStatus] = useState<string>("all");
  const [entityType, setEntityType] = useState<string>("all");
  const [selected, setSelected] = useState<AdminOperationalEvent | null>(null);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return events.filter((event) => {
      if (category !== "all" && event.category !== category) return false;
      if (severity !== "all" && event.severity !== severity) return false;
      if (status !== "all" && event.status !== status) return false;
      if (entityType !== "all" && event.entityType !== entityType) return false;
      if (!query) return true;
      const entityLabel = resolveEntity(event.entityType, event.entityId).label.toLowerCase();
      return event.title.toLowerCase().includes(query) || entityLabel.includes(query) || event.id.toLowerCase().includes(query);
    });
  }, [events, search, category, severity, status, entityType, resolveEntity]);

  const columns = useMemo<ColumnDef<AdminOperationalEvent>[]>(
    () => [
      {
        accessorKey: "title",
        header: "Event",
        cell: ({ row }) => (
          <div className="min-w-0">
            <p className="truncate font-medium text-text-primary">{row.original.title}</p>
            {row.original.description && (
              <p className="truncate text-[11.5px] text-text-muted">{row.original.description}</p>
            )}
          </div>
        ),
      },
      {
        id: "entity",
        header: "Entity",
        cell: ({ row }) => {
          const entity = resolveEntity(row.original.entityType, row.original.entityId);
          return <span className="truncate text-text-secondary">{entity.label}</span>;
        },
      },
      {
        accessorKey: "category",
        header: "Category",
        cell: ({ row }) => <span className="capitalize text-text-secondary">{row.original.category}</span>,
      },
      {
        accessorKey: "severity",
        header: "Severity",
        cell: ({ row }) => (
          <StatusBadge tone={eventSeverityTone[row.original.severity]}>{humanizeSnakeCase(row.original.severity)}</StatusBadge>
        ),
      },
      {
        accessorKey: "occurredAt",
        header: "Occurred At",
        cell: ({ row }) => (
          <span className="text-[12px] text-text-muted">
            {formatDate(row.original.occurredAt)} · {pseudoTimeOfDay(row.original.sourceId)}
          </span>
        ),
      },
      { accessorKey: "sourceType", header: "Source" },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => (
          <StatusBadge tone={eventStatusTone[row.original.status]}>{humanizeSnakeCase(row.original.status)}</StatusBadge>
        ),
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => {
          const entity = resolveEntity(row.original.entityType, row.original.entityId);
          const kycHref = row.original.sourceType === "KYC Review" ? `/kyc/${row.original.sourceId}` : undefined;
          return (
            <RowActionsMenu
              actions={[
                ...(entity.href ? [{ label: entity.actionLabel, href: entity.href }] : []),
                ...(kycHref ? [{ label: "View KYC Review", href: kycHref }] : []),
              ]}
            />
          );
        },
      },
    ],
    [resolveEntity],
  );

  const filterDefs: ManagementFilterDef[] = [
    {
      id: "category",
      label: "Category",
      value: category,
      onChange: setCategory,
      triggerClassName: "w-36",
      options: [
        { value: "all", label: "All categories" },
        ...CATEGORY_OPTIONS.map((option) => ({ value: option, label: option[0].toUpperCase() + option.slice(1) })),
      ],
    },
    {
      id: "severity",
      label: "Severity",
      value: severity,
      onChange: setSeverity,
      triggerClassName: "w-32",
      options: [
        { value: "all", label: "All severities" },
        ...SEVERITY_OPTIONS.map((option) => ({ value: option, label: humanizeSnakeCase(option) })),
      ],
    },
    {
      id: "status",
      label: "Status",
      value: status,
      onChange: setStatus,
      triggerClassName: "w-32",
      options: [
        { value: "all", label: "All statuses" },
        ...STATUS_OPTIONS.map((option) => ({ value: option, label: humanizeSnakeCase(option) })),
      ],
    },
    {
      id: "entityType",
      label: "Entity Type",
      value: entityType,
      onChange: setEntityType,
      triggerClassName: "w-36",
      options: [
        { value: "all", label: "All entity types" },
        ...ENTITY_TYPE_OPTIONS.map((option) => ({ value: option, label: humanizeSnakeCase(option) })),
      ],
    },
  ];

  return (
    <div className="flex flex-col gap-3">
      <ManagementToolbar
        search={{ value: search, onChange: setSearch, placeholder: "Search events...", ariaLabel: "Search events" }}
        filters={filterDefs}
        moreFiltersLabel="Date Range / More Filters"
        exportAriaLabel="Export events"
        onExport={() =>
          exportRowsToCsv("events.csv", filtered, [
            { header: "Event", accessor: (row) => row.title },
            { header: "Entity", accessor: (row) => resolveEntity(row.entityType, row.entityId).label },
            { header: "Category", accessor: (row) => row.category },
            { header: "Severity", accessor: (row) => humanizeSnakeCase(row.severity) },
            { header: "Occurred At", accessor: (row) => row.occurredAt },
            { header: "Source", accessor: (row) => row.sourceType },
            { header: "Status", accessor: (row) => humanizeSnakeCase(row.status) },
          ])
        }
      />

      <DataTable
        columns={columns}
        data={filtered}
        enablePagination
        pageSize={12}
        stickyHeader
        tableClassName="min-w-[1250px]"
        onRowClick={(row) => setSelected(row)}
        emptyState={<span className="text-[13px] text-text-muted">No events match these filters.</span>}
      />

      <EventDetailSheet event={selected} onOpenChange={(open) => !open && setSelected(null)} />
    </div>
  );
}
