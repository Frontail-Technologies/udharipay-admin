"use client";

import { useMemo, useState } from "react";
import { ManagementToolbar, type ManagementFilterDef } from "@/components/table/ManagementToolbar";
import { EntityTabs } from "@/components/entity/EntityTabs";
import {
  useAdminMerchants,
  useAdminEmployees,
  useAdminPlans,
  useAdminInstallments,
  useAdminMandates,
  useAdminSubscriptions,
} from "@/hooks/useAdminEntities";
import {
  REPORT_DATE_RANGE_PRESETS,
  getReportDateRange,
  calculateCollectionMetrics,
  calculateMandateMetrics,
  calculateMrr,
  type ReportDateRangePreset,
} from "@/data/admin/reports";
import { formatCompactInr } from "@/lib/format";
import { exportRowsToCsv } from "@/lib/csv";
import { OverviewReportTab } from "./OverviewReportTab";
import { CollectionsReportTab } from "./CollectionsReportTab";
import { MerchantsReportTab } from "./MerchantsReportTab";
import { PlansReportTab } from "./PlansReportTab";
import { MandatesReportTab } from "./MandatesReportTab";
import { SubscriptionsReportTab } from "./SubscriptionsReportTab";
import { EmployeesReportTab } from "./EmployeesReportTab";
import { KycReportTab } from "./KycReportTab";

const TABS = [
  { value: "overview", label: "Overview" },
  { value: "collections", label: "Collections" },
  { value: "merchants", label: "Merchants" },
  { value: "plans", label: "Plans" },
  { value: "mandates", label: "Mandates" },
  { value: "subscriptions", label: "Subscriptions" },
  { value: "employees", label: "Employees" },
  { value: "kyc", label: "KYC" },
];

export function ReportsView() {
  const [preset, setPreset] = useState<ReportDateRangePreset>("30d");
  const [merchantId, setMerchantId] = useState<string>("all");
  const [employeeId, setEmployeeId] = useState<string>("all");

  const merchants = useAdminMerchants();
  const employees = useAdminEmployees();
  const plans = useAdminPlans();
  const installments = useAdminInstallments();
  const mandates = useAdminMandates();
  const subscriptions = useAdminSubscriptions();

  const range = useMemo(() => getReportDateRange(preset), [preset]);
  const scopedMerchantId = merchantId === "all" ? undefined : merchantId;
  const scopedEmployeeId = employeeId === "all" ? undefined : employeeId;

  const handleExportSummary = () => {
    const scopedInstallments = scopedMerchantId ? installments.filter((i) => i.merchantId === scopedMerchantId) : installments;
    const scopedPlans = scopedMerchantId ? plans.filter((p) => p.merchantId === scopedMerchantId) : plans;
    const scopedMandates = scopedMerchantId ? mandates.filter((m) => m.merchantId === scopedMerchantId) : mandates;
    const collectionMetrics = calculateCollectionMetrics(scopedInstallments, [], range, undefined);
    const mandateMetrics = calculateMandateMetrics(scopedMandates);

    exportRowsToCsv(
      "reports-overview-summary.csv",
      [
        { metric: "Date Range", value: range.label },
        { metric: "Total Outstanding", value: formatCompactInr(scopedPlans.reduce((sum, p) => sum + p.remainingAmount, 0)) },
        { metric: "Collected in Period", value: formatCompactInr(collectionMetrics.collectedAmount) },
        { metric: "Collection Rate", value: `${collectionMetrics.collectionRate}%` },
        { metric: "Overdue Amount", value: formatCompactInr(collectionMetrics.overdueAmount) },
        { metric: "Active Plans", value: String(scopedPlans.filter((p) => p.status !== "completed").length) },
        {
          metric: "Mandate Success Rate",
          value: mandateMetrics.attemptSuccessRate !== null ? `${mandateMetrics.attemptSuccessRate}%` : "—",
        },
        { metric: "MRR", value: formatCompactInr(calculateMrr(subscriptions)) },
      ],
      [
        { header: "Metric", accessor: (row) => row.metric },
        { header: "Value", accessor: (row) => row.value },
      ],
      // This is a metric/value summary, not a list of business records —
      // a row position number wouldn't mean anything here.
      { includeSerialNumber: false },
    );
  };

  return (
    <div className="mx-auto flex max-w-7xl min-w-0 flex-col gap-5">
      <div className="min-w-0">
        <h1 className="text-[24px] font-semibold tracking-tight text-text-primary">Reports &amp; Insights</h1>
        <p className="mt-1 text-[13px] leading-relaxed text-text-secondary">
          Analyze collections, receivables, merchant activity and platform operations.
        </p>
      </div>

      <ManagementToolbar
        filters={
          [
            {
              id: "range",
              label: "Date Range",
              value: preset,
              onChange: (value) => setPreset(value as ReportDateRangePreset),
              // The default preset ("30d") doesn't count as an "active" filter —
              // only a deviation from it does, since this Select always has some
              // value selected (there's no "all" state for a date range).
              allValue: "30d",
              triggerClassName: "w-40",
              options: REPORT_DATE_RANGE_PRESETS.map((option) => ({ value: option.value, label: option.label })),
            },
            {
              id: "merchant",
              label: "Merchant",
              value: merchantId,
              onChange: setMerchantId,
              triggerClassName: "w-44",
              options: [
                { value: "all", label: "All merchants" },
                ...merchants.map((merchant) => ({ value: merchant.id, label: merchant.businessName })),
              ],
            },
            {
              id: "employee",
              label: "Employee",
              value: employeeId,
              onChange: setEmployeeId,
              triggerClassName: "w-40",
              options: [
                { value: "all", label: "All employees" },
                ...employees.map((employee) => ({ value: employee.id, label: employee.name })),
              ],
            },
          ] satisfies ManagementFilterDef[]
        }
        exportLabel="Export Summary"
        exportAriaLabel="Export reports overview summary"
        onExport={handleExportSummary}
      />

      <EntityTabs
        tabs={TABS}
        defaultValue="overview"
        panels={{
          overview: <OverviewReportTab range={range} merchantId={scopedMerchantId} />,
          collections: <CollectionsReportTab range={range} merchantId={scopedMerchantId} />,
          merchants: <MerchantsReportTab range={range} merchantId={scopedMerchantId} />,
          plans: <PlansReportTab merchantId={scopedMerchantId} />,
          mandates: <MandatesReportTab range={range} merchantId={scopedMerchantId} />,
          subscriptions: <SubscriptionsReportTab range={range} />,
          employees: <EmployeesReportTab range={range} employeeId={scopedEmployeeId} />,
          kyc: <KycReportTab range={range} />,
        }}
      />
    </div>
  );
}
