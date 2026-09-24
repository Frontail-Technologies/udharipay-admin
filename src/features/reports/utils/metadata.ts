import { CreditCard, Landmark, ReceiptText, RefreshCcw, ShieldCheck, Store, UserCog, Users, Wallet, type LucideIcon } from "lucide-react";
import { ReportKind, type ReportKind as ReportKindType } from "@/api/generated/contracts/reports";

export const reportKindLabels: Record<ReportKindType, string> = {
  collections: "Collections",
  payments: "Payments",
  outstanding: "Outstanding",
  customers: "Customers",
  merchants: "Merchants",
  employees: "Employees",
  plans: "Plans",
  merchant_performance: "Merchant Performance",
  mandates: "Mandates",
  kyc: "KYC",
  billing: "SaaS Billing",
};

export const reportKindIcons: Record<ReportKindType, LucideIcon> = {
  collections: Landmark,
  payments: Wallet,
  outstanding: ReceiptText,
  customers: Users,
  merchants: Store,
  employees: UserCog,
  plans: ReceiptText,
  merchant_performance: Store,
  mandates: CreditCard,
  kyc: ShieldCheck,
  billing: RefreshCcw,
};

export type ReportFilterControl = "dateRange" | "merchant" | "employee" | "status" | "method" | "subjectType" | "invoiceType";

export const reportFilterControls: Record<ReportKindType, ReportFilterControl[]> = {
  collections: ["dateRange", "merchant", "employee", "status"],
  payments: ["dateRange", "merchant", "status", "method"],
  outstanding: ["merchant"],
  customers: ["dateRange", "merchant", "status"],
  merchants: ["dateRange", "employee", "status"],
  employees: ["employee"],
  plans: ["dateRange", "merchant", "status"],
  merchant_performance: ["dateRange", "merchant"],
  mandates: ["dateRange", "merchant", "status", "method"],
  kyc: ["dateRange", "subjectType", "status"],
  billing: ["dateRange", "merchant", "status", "invoiceType"],
};

export const reportStatusOptions: Partial<Record<ReportKindType, readonly string[]>> = {
  collections: ["paid", "partially_paid", "overdue", "due", "upcoming"],
  payments: ["pending", "successful", "failed", "reversed"],
  customers: ["active", "inactive", "blocked"],
  merchants: ["draft", "in_review", "active", "payment_due", "grace", "restricted", "suspended"],
  mandates: ["pending", "authorization_pending", "active", "paused", "failed", "cancelled", "expired"],
  kyc: ["pending", "in_review", "approved", "resubmission_required", "rejected"],
  billing: ["pending", "paid", "failed", "void"],
};

export const reportMethodOptions: Partial<Record<ReportKindType, readonly string[]>> = {
  payments: ["cash", "upi", "bank_transfer", "mandate", "card", "other"],
  mandates: ["upi_autopay", "enach"],
};

export const reportKindList = Object.values(ReportKind);

export const reportPageMaximum = 100;
export const reportExportMaximumRows = 5000;
export const reportMaximumRangeDays = 366;
