"use client";

import { useCallback, useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/table/DataTable";
import { ManagementToolbar } from "@/components/table/ManagementToolbar";
import { RowActionsMenu } from "@/components/table/RowActionsMenu";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { CollectionWorkspaceSheet } from "@/components/collections/CollectionWorkspaceSheet";
import { cn } from "@/lib/utils";
import {
  useAdminInstallments,
  useAdminCustomers,
  useAdminMerchants,
  useAdminPlans,
  useAdminEmployees,
  useAdminCollectionFollowUps,
} from "@/hooks/useAdminEntities";
import type { Installment } from "@/data/admin";
import { isInstallmentAtRisk, DEMO_TODAY } from "@/data/admin";
import { useAdminSettings } from "@/store/adminSettingsStore";
import { installmentStatusTone, mandateStatusTone } from "@/data/admin/statusTones";
import { formatCompactInr, formatDate, formatDueContext, humanizeSnakeCase } from "@/lib/format";
import { exportRowsToCsv } from "@/lib/csv";

type QueueTab = "due_today" | "overdue" | "upcoming" | "failed" | "all";

const QUEUE_TABS: { value: QueueTab; label: string }[] = [
  { value: "due_today", label: "Due Today" },
  { value: "overdue", label: "Overdue" },
  { value: "upcoming", label: "Upcoming" },
  { value: "failed", label: "Failed" },
  { value: "all", label: "All" },
];

const TODAY_ISO = DEMO_TODAY.toISOString().slice(0, 10);

function matchesTab(installment: Installment, tab: QueueTab): boolean {
  switch (tab) {
    case "due_today":
      return installment.status === "due";
    case "overdue":
      return installment.status === "overdue";
    case "upcoming":
      return installment.status === "upcoming";
    case "failed":
      return installment.status === "failed";
    case "all":
      return installment.status !== "paid";
  }
}

export function CollectionsQueueTable() {
  const installments = useAdminInstallments();
  const customers = useAdminCustomers();
  const merchants = useAdminMerchants();
  const plans = useAdminPlans();
  const employees = useAdminEmployees();
  const followUps = useAdminCollectionFollowUps();
  const atRiskOverdueDays = useAdminSettings().collections.atRiskOverdueDays;

  const customerById = useMemo(() => new Map(customers.map((c) => [c.id, c])), [customers]);
  const merchantById = useMemo(() => new Map(merchants.map((m) => [m.id, m])), [merchants]);
  const planById = useMemo(() => new Map(plans.map((p) => [p.id, p])), [plans]);

  // Defaults to Overdue rather than Due Today — with a small demo dataset,
  // "due exactly today" can easily be empty on any given day, which is a
  // poor first impression for an operational "who needs attention" queue.
  const [tab, setTab] = useState<QueueTab>("overdue");
  const [search, setSearch] = useState("");
  const [merchantFilter, setMerchantFilter] = useState<string>("all");
  const [employeeFilter, setEmployeeFilter] = useState<string>("all");
  const [mandateFilter, setMandateFilter] = useState<string>("all");
  const [workspaceInstallment, setWorkspaceInstallment] = useState<Installment | null>(null);

  const assignedEmployeeName = useCallback(
    (merchantId: string) => merchantById.get(merchantId)?.assignedEmployeeName ?? null,
    [merchantById],
  );

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return installments.filter((installment) => {
      if (!matchesTab(installment, tab)) return false;
      if (merchantFilter !== "all" && installment.merchantId !== merchantFilter) return false;
      if (employeeFilter !== "all" && assignedEmployeeName(installment.merchantId) !== employeeFilter) return false;
      if (mandateFilter !== "all" && customerById.get(installment.customerId)?.mandateStatus !== mandateFilter) {
        return false;
      }
      if (!query) return true;
      const customerName = customerById.get(installment.customerId)?.name.toLowerCase() ?? "";
      return (
        customerName.includes(query) ||
        installment.planId.toLowerCase().includes(query) ||
        installment.customerId.toLowerCase().includes(query)
      );
    });
  }, [installments, tab, merchantFilter, employeeFilter, mandateFilter, search, customerById, assignedEmployeeName]);

  const columns = useMemo<ColumnDef<Installment>[]>(
    () => [
      {
        id: "customer",
        header: "Customer",
        cell: ({ row }) => {
          const customer = customerById.get(row.original.customerId);
          return (
            <div className="min-w-0">
              <p className="truncate font-medium text-text-primary">{customer?.name ?? "—"}</p>
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
        accessorKey: "planId",
        header: "Plan",
        cell: ({ row }) => <span className="text-text-secondary">{row.original.planId}</span>,
      },
      {
        id: "installment",
        header: "Installment",
        cell: ({ row }) => {
          const plan = planById.get(row.original.planId);
          return (
            <span className="tabular-nums text-text-secondary">
              #{row.original.installmentNumber} of {plan?.totalInstallments ?? "—"}
            </span>
          );
        },
      },
      {
        accessorKey: "dueDate",
        header: "Due Date",
        cell: ({ row }) => <span className="text-text-secondary">{formatDate(row.original.dueDate)}</span>,
      },
      {
        accessorKey: "amount",
        header: "Amount",
        cell: ({ row }) => <span className="tabular-nums">{formatCompactInr(row.original.amount)}</span>,
      },
      {
        id: "days",
        header: "Days",
        cell: ({ row }) => {
          const context = formatDueContext(row.original.dueDate, TODAY_ISO);
          const isOverdue = context.includes("overdue");
          return <span className={cn("text-[12.5px]", isOverdue ? "text-error" : "text-text-secondary")}>{context}</span>;
        },
      },
      {
        id: "mandate",
        header: "Mandate",
        cell: ({ row }) => {
          const customer = customerById.get(row.original.customerId);
          if (!customer) return <span className="text-text-muted">—</span>;
          return (
            <StatusBadge tone={mandateStatusTone[customer.mandateStatus]}>
              {humanizeSnakeCase(customer.mandateStatus)}
            </StatusBadge>
          );
        },
      },
      {
        id: "assignedEmployee",
        header: "Assigned Employee",
        cell: ({ row }) => (
          <span className="text-text-secondary">{assignedEmployeeName(row.original.merchantId) ?? "—"}</span>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
          const atRisk = isInstallmentAtRisk({ installment: row.original, followUps, thresholdDays: atRiskOverdueDays });
          return (
            <div className="flex items-center gap-1.5">
              <StatusBadge tone={installmentStatusTone[row.original.status]}>
                {humanizeSnakeCase(row.original.status)}
              </StatusBadge>
              {atRisk && <StatusBadge tone="warning">At Risk</StatusBadge>}
            </div>
          );
        },
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => (
          <RowActionsMenu
            actions={[
              { label: "View Plan", href: `/plans/${row.original.planId}` },
              { label: "View Customer", href: `/customers/${row.original.customerId}` },
              { label: "View Merchant", href: `/merchants/${row.original.merchantId}` },
            ]}
          />
        ),
      },
    ],
    [customerById, merchantById, planById, followUps, assignedEmployeeName, atRiskOverdueDays],
  );

  return (
    <div className="flex flex-col gap-3">
      <div className="flex w-max max-w-full items-center gap-1 overflow-x-auto rounded-lg border border-border bg-surface-muted p-1 scrollbar-none">
        {QUEUE_TABS.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => setTab(option.value)}
            className={cn(
              "h-8 shrink-0 whitespace-nowrap rounded-md border border-transparent px-3.5 text-[13px] font-medium transition-colors",
              tab === option.value
                ? "border-primary/20 bg-primary/10 font-semibold text-primary shadow-xs"
                : "text-text-secondary hover:bg-surface-hover hover:text-text-primary",
            )}
          >
            {option.label}
          </button>
        ))}
      </div>

      <ManagementToolbar
        search={{ value: search, onChange: setSearch, placeholder: "Search customer/plan...", ariaLabel: "Search collections" }}
        filters={[
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
          {
            id: "employee",
            label: "Assigned Employee",
            value: employeeFilter,
            onChange: setEmployeeFilter,
            triggerClassName: "w-44",
            options: [
              { value: "all", label: "All employees" },
              ...employees.map((employee) => ({ value: employee.name, label: employee.name })),
            ],
          },
          {
            id: "mandate",
            label: "Mandate",
            value: mandateFilter,
            onChange: setMandateFilter,
            triggerClassName: "w-36",
            options: [
              { value: "all", label: "All mandates" },
              { value: "active", label: "Active" },
              { value: "pending", label: "Pending" },
              { value: "failed", label: "Failed" },
              { value: "not_set", label: "Not Set" },
            ],
          },
        ]}
        moreFiltersLabel="More Filters"
        exportAriaLabel="Export collections"
        onExport={() =>
          exportRowsToCsv("collections.csv", filtered, [
            { header: "Customer", accessor: (row) => customerById.get(row.customerId)?.name ?? "" },
            { header: "Merchant", accessor: (row) => merchantById.get(row.merchantId)?.businessName ?? "" },
            { header: "Plan", accessor: (row) => row.planId },
            { header: "Installment", accessor: (row) => row.installmentNumber },
            { header: "Due Date", accessor: (row) => row.dueDate },
            { header: "Amount", accessor: (row) => row.amount },
            { header: "Status", accessor: (row) => humanizeSnakeCase(row.status) },
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
        onRowClick={setWorkspaceInstallment}
        emptyState={<span className="text-[13px] text-text-muted">No collections match these filters.</span>}
      />

      <CollectionWorkspaceSheet
        installment={workspaceInstallment}
        onOpenChange={(open) => !open && setWorkspaceInstallment(null)}
      />
    </div>
  );
}
