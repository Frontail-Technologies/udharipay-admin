"use client";

import { useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { exportReport, getReport } from "@/api/generated/reports";
import { ReportInvoiceType, ReportKind, type ExportReportFormat, type ExportReportParams, type GetReportParams, type ReportKind as ReportKindType } from "@/api/generated/contracts/reports";
import { KycSubjectType } from "@/api/generated/common";
import { normalizeApiError } from "@/api/http/errors";
import { downloadBlob } from "@/lib/downloads";
import { reportFilterControls } from "@/features/reports/utils/metadata";
import { readCursorState, writeCursorState, type CursorState } from "@/shared/utils/url";

const PAGE_SIZE = 25;

export const reportKeys = {
  all: ["reports"] as const,
  reports: (kind: ReportKindType) => [...reportKeys.all, kind] as const,
  report: (kind: ReportKindType, params: GetReportParams) => [...reportKeys.reports(kind), params] as const,
};

export function useReport(kind: ReportKindType, params: GetReportParams) {
  return useQuery({ queryKey: reportKeys.report(kind, params), queryFn: ({ signal }) => getReport(kind, params, { signal }) });
}

export function useReportDirectory() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const state = readCursorState(new URLSearchParams(searchParams.toString()));
  const kind = parseReportKind(state.reportKind);
  const controls = reportFilterControls[kind];
  const [exportingFormat, setExportingFormat] = useState<ExportReportFormat | null>(null);
  const [exportError, setExportError] = useState<string | null>(null);

  const filters = useMemo(() => ({
    dateFrom: controls.includes("dateRange") ? state.dateFrom : undefined,
    dateTo: controls.includes("dateRange") ? state.dateTo : undefined,
    merchantId: controls.includes("merchant") ? state.merchantId : undefined,
    assignedEmployeeId: controls.includes("employee") ? state.employeeId : undefined,
    status: controls.includes("status") ? state.status : undefined,
    method: controls.includes("method") ? state.method : undefined,
    subjectType: controls.includes("subjectType") ? parseSubjectType(state.subjectType) : undefined,
    invoiceType: controls.includes("invoiceType") ? parseInvoiceType(state.invoiceType) : undefined,
  }), [controls, state.dateFrom, state.dateTo, state.employeeId, state.invoiceType, state.merchantId, state.method, state.status, state.subjectType]);

  const params = useMemo<GetReportParams>(() => ({ ...filters, limit: PAGE_SIZE, cursor: state.reportCursor }), [filters, state.reportCursor]);
  const query = useReport(kind, params);

  const replaceState = (next: CursorState) => {
    const queryString = writeCursorState(new URLSearchParams(searchParams.toString()), next);
    router.replace(queryString ? `${pathname}?${queryString}` : pathname, { scroll: false });
  };

  const setKind = (nextKind: ReportKindType) => {
    const nextControls = reportFilterControls[nextKind];
    replaceState({
      reportKind: nextKind,
      reportCursor: undefined,
      dateFrom: nextControls.includes("dateRange") ? state.dateFrom : undefined,
      dateTo: nextControls.includes("dateRange") ? state.dateTo : undefined,
      merchantId: nextControls.includes("merchant") ? state.merchantId : undefined,
      employeeId: nextControls.includes("employee") ? state.employeeId : undefined,
      status: nextControls.includes("status") ? state.status : undefined,
      method: nextControls.includes("method") ? state.method : undefined,
      subjectType: nextControls.includes("subjectType") ? state.subjectType : undefined,
      invoiceType: nextControls.includes("invoiceType") ? state.invoiceType : undefined,
    });
  };

  const setFilters = (next: Partial<CursorState>) => replaceState({ reportKind: kind, dateFrom: state.dateFrom, dateTo: state.dateTo, merchantId: state.merchantId, employeeId: state.employeeId, status: state.status, method: state.method, subjectType: state.subjectType, invoiceType: state.invoiceType, ...next, reportCursor: undefined });

  const goNext = (reportCursor: string) => replaceState({ reportKind: kind, dateFrom: state.dateFrom, dateTo: state.dateTo, merchantId: state.merchantId, employeeId: state.employeeId, status: state.status, method: state.method, subjectType: state.subjectType, invoiceType: state.invoiceType, reportCursor });

  const runExport = async (format: ExportReportFormat) => {
    if (exportingFormat) return;
    setExportError(null);
    setExportingFormat(format);
    try {
      const exportParams: ExportReportParams = { ...filters, format };
      const blob = await exportReport(kind, exportParams);
      downloadBlob(blob, `${kind}-report.${format}`);
    } catch (error) {
      setExportError(normalizeApiError(error).message);
    } finally {
      setExportingFormat(null);
    }
  };

  return {
    query,
    report: query.data?.data,
    kind,
    controls,
    state,
    filters,
    setKind,
    setFilters,
    goPrevious: router.back,
    goNext,
    exportingFormat,
    exportError,
    runExport,
  };
}

function parseReportKind(value: string | undefined): ReportKindType {
  return Object.values(ReportKind).find((kind) => kind === value) ?? ReportKind.collections;
}

function parseSubjectType(value: string | undefined) {
  return Object.values(KycSubjectType).find((subjectType) => subjectType === value);
}

function parseInvoiceType(value: string | undefined) {
  return Object.values(ReportInvoiceType).find((invoiceType) => invoiceType === value);
}
