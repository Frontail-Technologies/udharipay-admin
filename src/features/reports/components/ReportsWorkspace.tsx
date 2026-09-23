"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { KycSubjectType } from "@/api/generated/common";
import { ReportInvoiceType } from "@/api/generated/contracts/reports";
import { normalizeApiError } from "@/api/http/errors";
import { useReportDirectory } from "@/features/reports/hooks/useReports";
import { reportKindLabels, reportKindList, reportMethodOptions, reportStatusOptions } from "@/features/reports/utils/metadata";
import { ReportMetricsGrid } from "@/features/reports/components/ReportMetricsGrid";
import { ReportTable } from "@/features/reports/components/ReportTable";
import { ReportExportMenu } from "@/features/reports/components/ReportExportMenu";
import { MerchantSelector } from "@/features/customers/components/MerchantSelector";
import { EmployeeSelector } from "@/features/employees/components/EmployeeSelector";
import { EntityTabs } from "@/components/entity/EntityTabs";
import { ManagementToolbar, type ManagementFilterDef } from "@/components/table/ManagementToolbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatDate, humanizeSnakeCase } from "@/lib/format";

type ReportDirectory = ReturnType<typeof useReportDirectory>;

export function ReportsWorkspace() {
  const directory = useReportDirectory();

  return <div className="flex flex-col gap-4">
    <EntityTabs
      tabs={reportKindList.map((kind) => ({ value: kind, label: reportKindLabels[kind] }))}
      defaultValue={directory.kind}
      value={directory.kind}
      onValueChange={(value) => directory.setKind(value as typeof directory.kind)}
      panels={Object.fromEntries(reportKindList.map((kind) => [kind, <ReportBody key={kind} directory={directory} />]))}
    />
  </div>;
}

function ReportBody({ directory }: { directory: ReportDirectory }) {
  const { controls, state } = directory;
  const report = directory.report;

  const filterDefs: ManagementFilterDef[] = [];
  const statusOptions = reportStatusOptions[directory.kind];
  const methodOptions = reportMethodOptions[directory.kind];
  if (controls.includes("status") && statusOptions) {
    filterDefs.push({ id: "status", label: "Status", value: state.status ?? "all", onChange: (value) => directory.setFilters({ status: value === "all" ? undefined : value }), triggerClassName: "w-40", options: [{ value: "all", label: "All statuses" }, ...statusOptions.map((value) => ({ value, label: humanizeSnakeCase(value) }))] });
  }
  if (controls.includes("method") && methodOptions) {
    filterDefs.push({ id: "method", label: "Method", value: state.method ?? "all", onChange: (value) => directory.setFilters({ method: value === "all" ? undefined : value }), triggerClassName: "w-36", options: [{ value: "all", label: "All methods" }, ...methodOptions.map((value) => ({ value, label: humanizeSnakeCase(value) }))] });
  }
  if (controls.includes("subjectType")) {
    filterDefs.push({ id: "subjectType", label: "Subject Type", value: state.subjectType ?? "all", onChange: (value) => directory.setFilters({ subjectType: value === "all" ? undefined : value }), triggerClassName: "w-36", options: [{ value: "all", label: "All subjects" }, ...Object.values(KycSubjectType).map((value) => ({ value, label: humanizeSnakeCase(value) }))] });
  }
  if (controls.includes("invoiceType")) {
    filterDefs.push({ id: "invoiceType", label: "Invoice Type", value: state.invoiceType ?? "all", onChange: (value) => directory.setFilters({ invoiceType: value === "all" ? undefined : value }), triggerClassName: "w-40", options: [{ value: "all", label: "All types" }, ...Object.values(ReportInvoiceType).map((value) => ({ value, label: humanizeSnakeCase(value) }))] });
  }

  return <div className="flex flex-col gap-3">
    <div className="flex flex-wrap items-center gap-2">
      {controls.includes("dateRange") && <>
        <Input type="date" value={state.dateFrom ?? ""} onChange={(event) => directory.setFilters({ dateFrom: event.target.value || undefined })} className="h-9 w-40" aria-label="Date from" />
        <Input type="date" value={state.dateTo ?? ""} onChange={(event) => directory.setFilters({ dateTo: event.target.value || undefined })} className="h-9 w-40" aria-label="Date to" />
      </>}
      {controls.includes("merchant") && <MerchantSelector merchantId={state.merchantId} onSelect={(merchantId) => directory.setFilters({ merchantId })} />}
      {controls.includes("merchant") && state.merchantId && <Button variant="outline" size="sm" className="h-9" onClick={() => directory.setFilters({ merchantId: undefined })}>Clear Merchant</Button>}
      {controls.includes("employee") && <EmployeeSelector employeeId={state.employeeId} onSelect={(employeeId) => directory.setFilters({ employeeId })} />}
      {controls.includes("employee") && state.employeeId && <Button variant="outline" size="sm" className="h-9" onClick={() => directory.setFilters({ employeeId: undefined })}>Clear Employee</Button>}
      <ReportExportMenu exportingFormat={directory.exportingFormat} exportError={directory.exportError} onExport={directory.runExport} />
    </div>

    {filterDefs.length > 0 && <ManagementToolbar filters={filterDefs} />}

    {directory.query.isError ? <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-8 text-center text-[13px] text-destructive">{normalizeApiError(directory.query.error).message}</div> : report ? <>
      <p className="text-[12px] text-text-muted">Period: {formatDate(report.period.from)} – {formatDate(report.period.to)} ({report.period.timeZone})</p>
      <ReportMetricsGrid metrics={report.metrics} />
      <ReportTable columns={report.columns} rows={report.rows} isLoading={directory.query.isPending} />
      <div className="flex items-center justify-between"><p className="text-[12px] text-text-muted">{report.rows.length} result{report.rows.length === 1 ? "" : "s"} on this page</p><div className="flex gap-1.5"><Button variant="outline" size="sm" className="h-8" disabled={!state.reportCursor} onClick={directory.goPrevious}><ChevronLeft className="size-3.5" />Previous</Button><Button variant="outline" size="sm" className="h-8" disabled={!report.pagination.nextCursor} onClick={() => report.pagination.nextCursor && directory.goNext(report.pagination.nextCursor)}>Next<ChevronRight className="size-3.5" /></Button></div></div>
    </> : <ReportTable columns={[]} rows={[]} isLoading={directory.query.isPending} />}
  </div>;
}
