"use client";

import Link from "next/link";
import { EntityPageHeader } from "@/components/entity/EntityPageHeader";
import { EntitySummaryGrid } from "@/components/entity/EntitySummaryGrid";
import { EntityTabs } from "@/components/entity/EntityTabs";
import { EntityKycTab } from "@/components/entity/EntityKycTab";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { Button } from "@/components/ui/button";
import { MerchantsTable } from "@/components/merchants/MerchantsTable";
import { EmployeeOverviewTab } from "@/components/employees/EmployeeOverviewTab";
import { EmployeeActivityTab } from "@/components/employees/EmployeeActivityTab";
import { useAdminEmployee } from "@/hooks/useAdminEntities";
import { employeeStatusTone, kycStatusTone } from "@/data/admin/statusTones";
import { formatDate, humanizeSnakeCase, initialsFromName } from "@/lib/format";

const TABS = [
  { value: "overview", label: "Overview" },
  { value: "merchants", label: "Assigned Merchants" },
  { value: "activity", label: "Activity" },
  { value: "kyc", label: "KYC & Documents" },
];

export function EmployeeDetailView({ employeeId, defaultTab }: { employeeId: string; defaultTab: string }) {
  const employee = useAdminEmployee(employeeId);

  if (!employee) return null;

  const kycReviewNeeded = employee.kycStatus !== "verified";

  return (
    <div className="mx-auto flex max-w-6xl min-w-0 flex-col gap-5">
      <EntityPageHeader
        backHref="/employees"
        avatarLabel={initialsFromName(employee.name)}
        title={employee.name}
        meta={`${employee.id} · ${employee.role} · Joined ${formatDate(employee.joinedAt)}`}
        badges={
          <>
            <StatusBadge tone={employeeStatusTone[employee.status]}>
              Account {humanizeSnakeCase(employee.status)}
            </StatusBadge>
            <StatusBadge tone={kycStatusTone[employee.kycStatus]}>
              KYC {humanizeSnakeCase(employee.kycStatus)}
            </StatusBadge>
          </>
        }
        actions={
          <Button
            variant={kycReviewNeeded ? "default" : "outline"}
            size="sm"
            asChild
            className="h-8 text-[12.5px]"
          >
            <Link href={`/employees/${employee.id}?tab=kyc`}>Review KYC</Link>
          </Button>
        }
      />

      <EntitySummaryGrid
        items={[
          { label: "Assigned Merchants", value: String(employee.assignedMerchantCount) },
          { label: "Customers Onboarded", value: String(employee.customersOnboarded) },
          { label: "Active Plans Created", value: String(employee.activePlansCreated) },
          { label: "Collections Handled", value: String(employee.collectionsHandled) },
          {
            label: "Pending Requests",
            value: String(employee.pendingRequests),
            emphasis: employee.pendingRequests > 0 ? "warning" : "default",
          },
        ]}
      />

      <EntityTabs
        tabs={TABS}
        defaultValue={defaultTab}
        panels={{
          overview: <EmployeeOverviewTab employee={employee} />,
          merchants: <MerchantsTable assignedEmployeeName={employee.name} />,
          activity: <EmployeeActivityTab employee={employee} />,
          kyc: <EntityKycTab entityType="employee" entityId={employee.id} />,
        }}
      />
    </div>
  );
}
