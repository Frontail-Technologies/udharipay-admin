"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/table/DataTable";
import { ManagementToolbar, type ManagementFilterDef } from "@/components/table/ManagementToolbar";
import { RowActionsMenu } from "@/components/table/RowActionsMenu";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useAdminKycReviews, useAdminMerchants, useAdminCustomers, useAdminEmployees } from "@/hooks/useAdminEntities";
import type { KycReview } from "@/data/admin";
import { KYC_REVIEW_STATUS_LABEL } from "@/data/admin";
import { kycReviewStatusTone } from "@/data/admin/statusTones";
import { formatDate } from "@/lib/format";
import { exportRowsToCsv } from "@/lib/csv";

const ENTITY_TYPE_OPTIONS = ["merchant", "customer", "employee"] as const;
const STATUS_OPTIONS = ["pending", "in_review", "approved", "rejected", "resubmission_required"] as const;

const ENTITY_TYPE_LABEL: Record<KycReview["entityType"], string> = {
  merchant: "Merchant",
  customer: "Customer",
  employee: "Employee",
};

function daysBetween(fromIso: string, toIso: string): number {
  const from = new Date(`${fromIso}T00:00:00`).getTime();
  const to = new Date(`${toIso}T00:00:00`).getTime();
  return Math.max(0, Math.round((to - from) / (1000 * 60 * 60 * 24)));
}

export function KycQueueTable({ demoTodayIso }: { demoTodayIso: string }) {
  const reviews = useAdminKycReviews();
  const merchants = useAdminMerchants();
  const customers = useAdminCustomers();
  const employees = useAdminEmployees();
  const router = useRouter();

  const [search, setSearch] = useState("");
  const [entityTypeFilter, setEntityTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [verificationTypeFilter, setVerificationTypeFilter] = useState<string>("all");

  const entityNameById = useMemo(() => {
    const map = new Map<string, string>();
    for (const merchant of merchants) map.set(`merchant:${merchant.id}`, merchant.businessName);
    for (const customer of customers) map.set(`customer:${customer.id}`, customer.name);
    for (const employee of employees) map.set(`employee:${employee.id}`, employee.name);
    return map;
  }, [merchants, customers, employees]);

  const entityHref = (review: KycReview) => {
    if (review.entityType === "merchant") return `/merchants/${review.entityId}`;
    if (review.entityType === "customer") return `/customers/${review.entityId}`;
    return `/employees/${review.entityId}`;
  };

  const verificationTypes = useMemo(
    () => Array.from(new Set(reviews.map((review) => review.verificationType))),
    [reviews],
  );

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return reviews.filter((review) => {
      if (entityTypeFilter !== "all" && review.entityType !== entityTypeFilter) return false;
      if (statusFilter !== "all" && review.status !== statusFilter) return false;
      if (verificationTypeFilter !== "all" && review.verificationType !== verificationTypeFilter) return false;
      if (!query) return true;
      const entityName = entityNameById.get(`${review.entityType}:${review.entityId}`) ?? "";
      return (
        entityName.toLowerCase().includes(query) ||
        review.entityId.toLowerCase().includes(query) ||
        review.id.toLowerCase().includes(query)
      );
    });
  }, [reviews, search, entityTypeFilter, statusFilter, verificationTypeFilter, entityNameById]);

  const columns = useMemo<ColumnDef<KycReview>[]>(
    () => [
      {
        id: "entity",
        header: "Entity",
        cell: ({ row }) => (
          <div className="min-w-0">
            <p className="truncate font-medium text-text-primary">
              {entityNameById.get(`${row.original.entityType}:${row.original.entityId}`) ?? row.original.entityId}
            </p>
            <p className="truncate text-[11.5px] text-text-muted">{row.original.entityId}</p>
          </div>
        ),
      },
      {
        accessorKey: "entityType",
        header: "Entity Type",
        cell: ({ row }) => (
          <span className="text-text-secondary">{ENTITY_TYPE_LABEL[row.original.entityType]}</span>
        ),
      },
      {
        accessorKey: "assignedEmployeeName",
        header: "Assigned Employee",
        cell: ({ row }) => (
          <span className="text-text-secondary">{row.original.assignedEmployeeName ?? "—"}</span>
        ),
      },
      { accessorKey: "verificationType", header: "Verification Type" },
      {
        accessorKey: "submittedAt",
        header: "Submitted At",
        cell: ({ row }) => (
          <span className="text-[12px] text-text-muted">{formatDate(row.original.submittedAt)}</span>
        ),
      },
      {
        id: "issue",
        header: "Risk / Issue",
        cell: ({ row }) => {
          const review = row.original;
          if (review.status !== "rejected" && review.status !== "resubmission_required") {
            return <span className="text-text-muted">—</span>;
          }
          const lastEvent = [...review.history].reverse().find((event) => event.note);
          const label = lastEvent?.note ?? "Flagged";
          if (!lastEvent?.note) {
            return <span className="block max-w-44 truncate text-[12px] text-warning">{label}</span>;
          }
          return (
            <Tooltip>
              <TooltipTrigger asChild>
                <span
                  tabIndex={0}
                  className="block max-w-44 truncate text-[12px] text-warning outline-none focus-visible:underline"
                >
                  {label}
                </span>
              </TooltipTrigger>
              <TooltipContent className="max-w-64 text-[12px]">{lastEvent.note}</TooltipContent>
            </Tooltip>
          );
        },
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => (
          <StatusBadge tone={kycReviewStatusTone[row.original.status]}>
            {KYC_REVIEW_STATUS_LABEL[row.original.status]}
          </StatusBadge>
        ),
      },
      {
        id: "age",
        header: "Age",
        cell: ({ row }) => (
          <span className="tabular-nums text-text-muted">{daysBetween(row.original.submittedAt, demoTodayIso)}d</span>
        ),
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => (
          <RowActionsMenu
            actions={[
              { label: "Open Review", href: `/kyc/${row.original.id}` },
              { label: "View Entity", href: entityHref(row.original) },
            ]}
          />
        ),
      },
    ],
    [entityNameById, demoTodayIso],
  );

  const filterDefs: ManagementFilterDef[] = [
    {
      id: "entityType",
      label: "Entity Type",
      value: entityTypeFilter,
      onChange: setEntityTypeFilter,
      triggerClassName: "w-36",
      options: [
        { value: "all", label: "All entity types" },
        ...ENTITY_TYPE_OPTIONS.map((type) => ({ value: type, label: ENTITY_TYPE_LABEL[type] })),
      ],
    },
    {
      id: "status",
      label: "Status",
      value: statusFilter,
      onChange: setStatusFilter,
      triggerClassName: "w-44",
      options: [
        { value: "all", label: "All statuses" },
        ...STATUS_OPTIONS.map((status) => ({ value: status, label: KYC_REVIEW_STATUS_LABEL[status] })),
      ],
    },
    {
      id: "verificationType",
      label: "Verification Type",
      value: verificationTypeFilter,
      onChange: setVerificationTypeFilter,
      triggerClassName: "w-48",
      options: [
        { value: "all", label: "All verification types" },
        ...verificationTypes.map((type) => ({ value: type, label: type })),
      ],
    },
  ];

  return (
    <div className="flex flex-col gap-3">
      <ManagementToolbar
        search={{ value: search, onChange: setSearch, placeholder: "Search entity...", ariaLabel: "Search entity" }}
        filters={filterDefs}
        moreFiltersLabel="More Filters"
        exportAriaLabel="Export KYC reviews"
        onExport={() =>
          exportRowsToCsv("kyc-reviews.csv", filtered, [
            { header: "Review ID", accessor: (row) => row.id },
            {
              header: "Entity",
              accessor: (row) => entityNameById.get(`${row.entityType}:${row.entityId}`) ?? row.entityId,
            },
            { header: "Entity Type", accessor: (row) => ENTITY_TYPE_LABEL[row.entityType] },
            { header: "Verification Type", accessor: (row) => row.verificationType },
            { header: "Submitted At", accessor: (row) => row.submittedAt },
            { header: "Status", accessor: (row) => KYC_REVIEW_STATUS_LABEL[row.status] },
          ])
        }
      />

      <DataTable
        columns={columns}
        data={filtered}
        enablePagination
        pageSize={10}
        stickyHeader
        tableClassName="min-w-[1250px]"
        onRowClick={(row) => router.push(`/kyc/${row.id}`)}
        emptyState={<span className="text-[13px] text-text-muted">No reviews match these filters.</span>}
      />
    </div>
  );
}
