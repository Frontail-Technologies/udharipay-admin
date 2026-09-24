import type { CursorPagination, KycSubjectType, MoneyPaise } from "../common";
export type ReportKind = typeof ReportKind[keyof typeof ReportKind];
export const ReportKind = {
    collections: 'collections',
    payments: 'payments',
    outstanding: 'outstanding',
    customers: 'customers',
    merchants: 'merchants',
    employees: 'employees',
    plans: 'plans',
    merchant_performance: 'merchant_performance',
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
    collectedYesterdayPaise: MoneyPaise;
    collectedTodayChangeBasisPoints: number | null;
    installmentsPaidMonth: number;
    installmentsDueMonth: number;
    installmentsOverdue: number;
    failedPaymentsMonth: number;
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
export type AgingBucket = typeof AgingBucket[keyof typeof AgingBucket];
export const AgingBucket = {
    current: 'current',
    '1-3': '1-3',
    '4-7': '4-7',
    '8-15': '8-15',
    '15+': '15+',
} as const;
export type MerchantPerformanceSort = typeof MerchantPerformanceSort[keyof typeof MerchantPerformanceSort];
export const MerchantPerformanceSort = {
    collected: 'collected',
    outstanding: 'outstanding',
    overdue: 'overdue',
    collection_rate: 'collection_rate',
} as const;
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
    bucket?: AgingBucket;
    search?: string;
    sort?: MerchantPerformanceSort;
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
    bucket?: AgingBucket;
    search?: string;
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
export type ListDashboardActivityParams = {
    limit?: number;
    merchantId?: string;
};
export type ListDashboardActivity200DataItemsItemType = typeof ListDashboardActivity200DataItemsItemType[keyof typeof ListDashboardActivity200DataItemsItemType];
export const ListDashboardActivity200DataItemsItemType = {
    merchant_added: 'merchant_added',
    payment_collected: 'payment_collected',
    payment_failed: 'payment_failed',
    mandate_created: 'mandate_created',
    debit_failed: 'debit_failed',
} as const;
export type ListDashboardActivity200DataItemsItem = {
    type: ListDashboardActivity200DataItemsItemType;
    occurredAt: string;
    subject: string;
    amountPaise: MoneyPaise | null;
    entityType: string;
    entityId: string;
};
export type ListDashboardActivity200Data = {
    items: ListDashboardActivity200DataItemsItem[];
};
export type ListDashboardActivity200 = {
    data: ListDashboardActivity200Data;
};
export type GetPortfolioInsightsParams = {
    merchantId?: string;
};
export type GetPortfolioInsights200DataBestCollectionRate = {
    merchantId: string;
    businessName: string;
    value: string;
} | null;
export type GetPortfolioInsights200DataHighestOutstanding = {
    merchantId: string;
    businessName: string;
    value: string;
} | null;
export type GetPortfolioInsights200DataHighestOverdue = {
    merchantId: string;
    businessName: string;
    value: string;
} | null;
export type GetPortfolioInsights200Data = {
    periodFrom: string;
    periodTo: string;
    bestCollectionRate: GetPortfolioInsights200DataBestCollectionRate;
    highestOutstanding: GetPortfolioInsights200DataHighestOutstanding;
    highestOverdue: GetPortfolioInsights200DataHighestOverdue;
};
export type GetPortfolioInsights200 = {
    data: GetPortfolioInsights200Data;
};
