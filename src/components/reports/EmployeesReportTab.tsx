"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import type { ColumnDef } from "@tanstack/react-table";
import { Download } from "lucide-react";
import { DataTable } from "@/components/table/DataTable";
import { Button } from "@/components/ui/button";
import { useAdminEmployees, useAdminMerchants, useAdminCollectionFollowUps, useAdminKycReviews } from "@/hooks/useAdminEntities";
import { calculateEmployeeReport, type EmployeeReportRow, type ReportDateRange } from "@/data/admin/reports";
import { formatCompactInr } from "@/lib/format";
import { exportRowsToCsv } from "@/lib/csv";

/**
 * Operational workload only — no "performance score" is computed, since no
 * formula for one was ever defined. The Employee<->Merchant relationship
 * used below is the same NAME-based Merchant.assignedEmployeeName link
 * used everywhere else in this app (documented limitation — no real
 * employeeId foreign key exists yet); this report does not invent a
 * second, competing relationship.
 */
export function EmployeesReportTab({ range, employeeId }: { range: ReportDateRange; employeeId?: string }) {
  const employees = useAdminEmployees();
  const merchants = useAdminMerchants();
  const followUps = useAdminCollectionFollowUps();
  const kycReviews = useAdminKycReviews();
  const router = useRouter();

  const rows = useMemo(() => {
    const report = calculateEmployeeReport(employees, merchants, followUps, kycReviews, range);
    return employeeId ? report.filter((row) => row.employeeId === employeeId) : report;
  }, [employees, merchants, followUps, kycReviews, range, employeeId]);

  const columns: ColumnDef<EmployeeReportRow>[] = [
    { accessorKey: "name", header: "Employee" },
    { accessorKey: "assignedMerchants", header: "Assigned Merchants" },
    { accessorKey: "customersOnboarded", header: "Customers Onboarded" },
    { accessorKey: "activePlans", header: "Active Plans" },
    { accessorKey: "collectionsHandled", header: "Collections Handled" },
    {
      accessorKey: "outstandingUnderAssigned",
      header: "Outstanding (Assigned)",
      cell: ({ row }) => (
        <span className="tabular-nums text-text-primary">{formatCompactInr(row.original.outstandingUnderAssigned)}</span>
      ),
    },
    {
      accessorKey: "overdueUnderAssigned",
      header: "Overdue (Assigned)",
      cell: ({ row }) => (
        <span className={`tabular-nums ${row.original.overdueUnderAssigned > 0 ? "text-error" : "text-text-primary"}`}>
          {formatCompactInr(row.original.overdueUnderAssigned)}
        </span>
      ),
    },
    { accessorKey: "followUpsLogged", header: "Follow-ups Logged (period)" },
    { accessorKey: "kycReviewsWorkload", header: "KYC Reviews Assigned" },
  ];

  return (
    <div className="flex flex-col gap-3">
      <p className="text-[11.5px] text-text-muted">
        Merchant assignment is matched by employee name (Merchant.assignedEmployeeName) — a known, documented
        limitation until a real employeeId relationship exists.
      </p>
      <div className="flex items-center justify-between">
        <h3 className="text-[13.5px] font-semibold text-text-primary">Employees</h3>
        <Button
          variant="outline"
          size="sm"
          className="h-8 gap-1.5 text-[12.5px]"
          onClick={() =>
            exportRowsToCsv("employees-report.csv", rows, [
              { header: "Employee", accessor: (row) => row.name },
              { header: "Assigned Merchants", accessor: (row) => row.assignedMerchants },
              { header: "Customers Onboarded", accessor: (row) => row.customersOnboarded },
              { header: "Active Plans", accessor: (row) => row.activePlans },
              { header: "Collections Handled", accessor: (row) => row.collectionsHandled },
              { header: "Outstanding (Assigned)", accessor: (row) => row.outstandingUnderAssigned },
              { header: "Overdue (Assigned)", accessor: (row) => row.overdueUnderAssigned },
              { header: "Follow-ups Logged", accessor: (row) => row.followUpsLogged },
              { header: "KYC Reviews Assigned", accessor: (row) => row.kycReviewsWorkload },
            ])
          }
        >
          <Download className="size-3.5" />
          Export
        </Button>
      </div>
      <DataTable
        columns={columns}
        data={rows}
        enablePagination
        pageSize={10}
        stickyHeader
        tableClassName="min-w-[1150px]"
        onRowClick={(row) => router.push(`/employees/${row.employeeId}`)}
        emptyState={<span className="text-[13px] text-text-muted">No employees match this scope.</span>}
      />
    </div>
  );
}
