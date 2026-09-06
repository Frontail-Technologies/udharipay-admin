"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/table/DataTable";
import { ManagementToolbar, type ManagementFilterDef } from "@/components/table/ManagementToolbar";
import { RowActionsMenu } from "@/components/table/RowActionsMenu";
import { StatusBadge } from "@/components/admin/StatusBadge";
import {
  useAdminMandates,
  useAdminCustomers,
  useAdminMerchants,
} from "@/hooks/useAdminEntities";
import { mandateAttempts } from "@/data/admin";
import type { Mandate, MandateMethod } from "@/data/admin";
import { mandateOperationalStatusTone } from "@/data/admin/statusTones";
import { formatDateShort, humanizeSnakeCase } from "@/lib/format";
import { exportRowsToCsv } from "@/lib/csv";

const STATUS_OPTIONS = ["pending_authorization", "active", "paused", "revoked", "failed", "expired"] as const;
const METHOD_OPTIONS: MandateMethod[] = ["UPI Autopay", "NACH"];

const NEXT_ACTION_LABEL: Record<Mandate["status"], string> = {
  pending_authorization: "Authorization Pending",
  failed: "Retry Required",
  revoked: "Re-authorization Required",
  expired: "Renewal Required",
  paused: "Resume Required",
  active: "—",
};

function lastAttemptDate(mandateId: string): string | null {
  const attempts = mandateAttempts.filter((attempt) => attempt.mandateId === mandateId);
  if (attempts.length === 0) return null;
  return attempts.reduce((latest, attempt) => (attempt.attemptedAt > latest ? attempt.attemptedAt : latest), attempts[0].attemptedAt);
}

export function MandatesTable() {
  const mandates = useAdminMandates();
  const customers = useAdminCustomers();
  const merchants = useAdminMerchants();
  const router = useRouter();

  const customerById = useMemo(() => new Map(customers.map((c) => [c.id, c])), [customers]);
  const merchantById = useMemo(() => new Map(merchants.map((m) => [m.id, m])), [merchants]);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [methodFilter, setMethodFilter] = useState<string>("all");
  const [merchantFilter, setMerchantFilter] = useState<string>("all");

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return mandates.filter((mandate) => {
      if (statusFilter !== "all" && mandate.status !== statusFilter) return false;
      if (methodFilter !== "all" && mandate.method !== methodFilter) return false;
      if (merchantFilter !== "all" && mandate.merchantId !== merchantFilter) return false;
      if (!query) return true;
      const customerName = customerById.get(mandate.customerId)?.name.toLowerCase() ?? "";
      return (
        mandate.id.toLowerCase().includes(query) ||
        customerName.includes(query) ||
        mandate.customerId.toLowerCase().includes(query)
      );
    });
  }, [mandates, search, statusFilter, methodFilter, merchantFilter, customerById]);

  const columns = useMemo<ColumnDef<Mandate>[]>(
    () => [
      {
        accessorKey: "id",
        header: "Mandate",
        cell: ({ row }) => (
          <div className="min-w-0">
            <p className="truncate font-medium text-text-primary">{row.original.id}</p>
            <p className="truncate text-[11.5px] text-text-muted">{row.original.providerReferenceMasked}</p>
          </div>
        ),
      },
      {
        id: "customer",
        header: "Customer",
        cell: ({ row }) => {
          const customer = customerById.get(row.original.customerId);
          return (
            <div className="min-w-0">
              <p className="truncate text-text-primary">{customer?.name ?? "—"}</p>
              <p className="truncate text-[11.5px] text-text-muted">{row.original.customerId}</p>
            </div>
          );
        },
      },
      {
        id: "merchant",
        header: "Merchant",
        cell: ({ row }) => (
          <span className="truncate text-text-secondary">
            {merchantById.get(row.original.merchantId)?.businessName ?? "—"}
          </span>
        ),
      },
      {
        id: "scope",
        header: "Plan / Scope",
        cell: ({ row }) => (
          <span className="text-text-secondary">{row.original.planId ?? "Customer-level"}</span>
        ),
      },
      { accessorKey: "method", header: "Method" },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => (
          <StatusBadge tone={mandateOperationalStatusTone[row.original.status]}>
            {humanizeSnakeCase(row.original.status)}
          </StatusBadge>
        ),
      },
      {
        accessorKey: "authorizedAt",
        header: "Authorized",
        cell: ({ row }) => (
          <span className="text-[12px] text-text-muted">{formatDateShort(row.original.authorizedAt)}</span>
        ),
      },
      {
        id: "lastAttempt",
        header: "Last Attempt",
        cell: ({ row }) => (
          <span className="text-[12px] text-text-muted">{formatDateShort(lastAttemptDate(row.original.id))}</span>
        ),
      },
      {
        id: "nextAction",
        header: "Next Action",
        cell: ({ row }) => {
          const label = NEXT_ACTION_LABEL[row.original.status];
          return label === "—" ? (
            <span className="text-text-muted">—</span>
          ) : (
            <span className="text-warning">{label}</span>
          );
        },
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => (
          <RowActionsMenu
            actions={[
              { label: "View Mandate", href: `/mandates/${row.original.id}` },
              { label: "View Customer", href: `/customers/${row.original.customerId}` },
              { label: "View Merchant", href: `/merchants/${row.original.merchantId}` },
            ]}
          />
        ),
      },
    ],
    [customerById, merchantById],
  );

  const filterDefs: ManagementFilterDef[] = [
    {
      id: "status",
      label: "Status",
      value: statusFilter,
      onChange: setStatusFilter,
      triggerClassName: "w-44",
      options: [
        { value: "all", label: "All statuses" },
        ...STATUS_OPTIONS.map((status) => ({ value: status, label: humanizeSnakeCase(status) })),
      ],
    },
    {
      id: "method",
      label: "Method",
      value: methodFilter,
      onChange: setMethodFilter,
      triggerClassName: "w-36",
      options: [
        { value: "all", label: "All methods" },
        ...METHOD_OPTIONS.map((method) => ({ value: method, label: method })),
      ],
    },
    {
      id: "merchant",
      label: "Merchant",
      value: merchantFilter,
      onChange: setMerchantFilter,
      triggerClassName: "w-44",
      options: [
        { value: "all", label: "All merchants" },
        ...merchants.map((merchant) => ({ value: merchant.id, label: merchant.businessName })),
      ],
    },
  ];

  return (
    <div className="flex flex-col gap-3">
      <ManagementToolbar
        search={{ value: search, onChange: setSearch, placeholder: "Search mandate/customer...", ariaLabel: "Search mandates" }}
        filters={filterDefs}
        moreFiltersLabel="More Filters"
        exportAriaLabel="Export mandates"
        onExport={() =>
          exportRowsToCsv("mandates.csv", filtered, [
            { header: "Mandate ID", accessor: (row) => row.id },
            { header: "Customer", accessor: (row) => customerById.get(row.customerId)?.name ?? "" },
            { header: "Merchant", accessor: (row) => merchantById.get(row.merchantId)?.businessName ?? "" },
            { header: "Method", accessor: (row) => row.method },
            { header: "Status", accessor: (row) => humanizeSnakeCase(row.status) },
            { header: "Authorized", accessor: (row) => row.authorizedAt ?? "" },
          ])
        }
      />

      <DataTable
        columns={columns}
        data={filtered}
        enablePagination
        pageSize={10}
        stickyHeader
        tableClassName="min-w-[1350px]"
        onRowClick={(row) => router.push(`/mandates/${row.id}`)}
        emptyState={<span className="text-[13px] text-text-muted">No mandates match these filters.</span>}
      />
    </div>
  );
}
