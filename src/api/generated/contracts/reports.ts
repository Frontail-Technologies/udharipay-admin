import type { CursorPagination, KycSubjectType, MoneyPaise } from "../common";
export type ReportKind = typeof ReportKind[keyof typeof ReportKind];
export const ReportKind = {
    collections: 'collections',
    payments: 'payments',
    outstanding: 'outstanding',
    customers: 'customers',
    merchants: 'merchants',
    employees: 'employees',
    mandates: 'mandates',
    kyc: 'kyc',
    billing: 'billing',
} as const;
export type ReportInvoiceType = typeof ReportInvoiceType[keyof typeof ReportInvoiceType];
export const ReportInvoiceType = {
    activation_fee: 'activation_fee',
    subscription: 'subscription',
} as const;
export interface PortfolioSummary {
    referenceDate: string;
    monthStart: string;
    outstandingPaise: MoneyPaise;
    overduePaise: MoneyPaise;
    dueTodayPaise: MoneyPaise;
    upcomingPaise: MoneyPaise;
    customerCount: number;
    activeCustomerCount: number;
    merchantCount: number;
    activeMerchantCount: number;
    activeMandateCount: number;
    collectedTodayPaise: MoneyPaise;
    paymentCountToday: number;
    collectedMonthPaise: MoneyPaise;
}
export type CanonicalReportPeriodTimeZone = typeof CanonicalReportPeriodTimeZone[keyof typeof CanonicalReportPeriodTimeZone];
export const CanonicalReportPeriodTimeZone = {
    'Asia/Kolkata': 'Asia/Kolkata',
} as const;
export type CanonicalReportPeriod = {
    from: string;
    to: string;
    timeZone: CanonicalReportPeriodTimeZone;
};
export type CanonicalReportFilters = {
    [key: string]: string;
};
export type CanonicalReportMetricsItem = {
    key: string;
    label: string;
    value: string;
    type: string;
};
export type CanonicalReportColumnsItem = {
    key: string;
    label: string;
    type: string;
    width?: number;
};
export type CanonicalReportRowsItem = {
    [key: string]: string | number | boolean | null | unknown[] | {
        [key: string]: unknown;
    };
};
export interface CanonicalReport {
    kind: string;
    title: string;
    generatedAt: string;
    period: CanonicalReportPeriod;
    filters: CanonicalReportFilters;
    metrics: CanonicalReportMetricsItem[];
    columns: CanonicalReportColumnsItem[];
    rows: CanonicalReportRowsItem[];
    pagination: CursorPagination;
}
export type GetReportParams = {
    dateFrom?: string;
    dateTo?: string;
    merchantId?: string;
    assignedEmployeeId?: string;
    status?: string;
    method?: string;
    subjectType?: KycSubjectType;
    invoiceType?: ReportInvoiceType;
    order?: GetReportOrder;
    limit?: number;
    cursor?: string;
};
export type GetReportOrder = typeof GetReportOrder[keyof typeof GetReportOrder];
export const GetReportOrder = {
    asc: 'asc',
    desc: 'desc',
} as const;
export type GetReport200 = {
    data: CanonicalReport;
};
export type ExportReportParams = {
    dateFrom?: string;
    dateTo?: string;
    merchantId?: string;
    assignedEmployeeId?: string;
    status?: string;
    method?: string;
    subjectType?: KycSubjectType;
    invoiceType?: ReportInvoiceType;
    format: ExportReportFormat;
};
export type ExportReportFormat = typeof ExportReportFormat[keyof typeof ExportReportFormat];
export const ExportReportFormat = {
    xlsx: 'xlsx',
    pdf: 'pdf',
} as const;
export type GetPortfolioSummaryParams = {
    merchantId?: string;
};
export type GetPortfolioSummary200 = {
    data: PortfolioSummary;
};
