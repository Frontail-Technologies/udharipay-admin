/**
 * Presentation-only demo data for the admin dashboard.
 * No backend exists yet — nothing here is a real API contract.
 */

import {
  Store,
  Users,
  Wallet,
  Banknote,
  CalendarClock,
  AlertTriangle,
  ListChecks,
  CreditCard,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type TrendDirection = "up" | "down" | "flat";

export type PrimaryMetric = {
  id: string;
  label: string;
  value: string;
  trendValue: string;
  trendDirection: TrendDirection;
  trendLabel: string;
  icon: LucideIcon;
};

export const primaryMetrics: PrimaryMetric[] = [
  {
    id: "active-merchants",
    label: "Active Merchants",
    value: "1,284",
    trendValue: "4.2%",
    trendDirection: "up",
    trendLabel: "vs last 30 days",
    icon: Store,
  },
  {
    id: "active-customers",
    label: "Active Customers",
    value: "18,942",
    trendValue: "6.8%",
    trendDirection: "up",
    trendLabel: "vs last 30 days",
    icon: Users,
  },
  {
    id: "outstanding-amount",
    label: "Outstanding Amount",
    value: "₹42,18,650",
    trendValue: "1.9%",
    trendDirection: "down",
    trendLabel: "vs last 30 days",
    icon: Wallet,
  },
  {
    id: "collected-this-month",
    label: "Collected This Month",
    value: "₹31,64,200",
    trendValue: "9.3%",
    trendDirection: "up",
    trendLabel: "vs last month",
    icon: Banknote,
  },
];

export type SecondaryMetric = {
  id: string;
  label: string;
  value: string;
  icon: LucideIcon;
  tone: "neutral" | "warning" | "error";
};

export const secondaryMetrics: SecondaryMetric[] = [
  {
    id: "due-today",
    label: "Due Today",
    value: "₹3,86,400",
    icon: CalendarClock,
    tone: "neutral",
  },
  {
    id: "overdue",
    label: "Overdue",
    value: "₹1,42,900",
    icon: AlertTriangle,
    tone: "error",
  },
  {
    id: "active-plans",
    label: "Active Udhaar Plans",
    value: "6,512",
    icon: ListChecks,
    tone: "neutral",
  },
  {
    id: "mandate-issues",
    label: "Mandate Issues",
    value: "37",
    icon: CreditCard,
    tone: "warning",
  },
];

export type CollectionPeriod = "7D" | "30D" | "90D";

export type CollectionTrendPoint = {
  label: string;
  collected: number;
  due: number;
  overdue: number;
};

export const collectionTrendData: Record<CollectionPeriod, CollectionTrendPoint[]> = {
  "7D": [
    { label: "Mon", collected: 412000, due: 96000, overdue: 21000 },
    { label: "Tue", collected: 388000, due: 102000, overdue: 24000 },
    { label: "Wed", collected: 456000, due: 88000, overdue: 19000 },
    { label: "Thu", collected: 401000, due: 110000, overdue: 27000 },
    { label: "Fri", collected: 478000, due: 94000, overdue: 22000 },
    { label: "Sat", collected: 362000, due: 76000, overdue: 18000 },
    { label: "Sun", collected: 298000, due: 64000, overdue: 15000 },
  ],
  "30D": [
    { label: "W1D1", collected: 1180000, due: 320000, overdue: 68000 },
    { label: "W1D4", collected: 1240000, due: 298000, overdue: 71000 },
    { label: "W2D1", collected: 1305000, due: 312000, overdue: 74000 },
    { label: "W2D4", collected: 1268000, due: 336000, overdue: 79000 },
    { label: "W3D1", collected: 1392000, due: 288000, overdue: 66000 },
    { label: "W3D4", collected: 1421000, due: 302000, overdue: 70000 },
    { label: "W4D1", collected: 1358000, due: 344000, overdue: 82000 },
    { label: "W4D4", collected: 1487000, due: 318000, overdue: 75000 },
    { label: "W5D1", collected: 1512000, due: 296000, overdue: 69000 },
    { label: "W5D4", collected: 1456000, due: 310000, overdue: 73000 },
  ],
  "90D": [
    { label: "Wk 1", collected: 4820000, due: 1120000, overdue: 268000 },
    { label: "Wk 2", collected: 5040000, due: 1180000, overdue: 284000 },
    { label: "Wk 3", collected: 4960000, due: 1240000, overdue: 296000 },
    { label: "Wk 4", collected: 5210000, due: 1160000, overdue: 271000 },
    { label: "Wk 5", collected: 5380000, due: 1290000, overdue: 312000 },
    { label: "Wk 6", collected: 5120000, due: 1210000, overdue: 289000 },
    { label: "Wk 7", collected: 5460000, due: 1330000, overdue: 318000 },
    { label: "Wk 8", collected: 5590000, due: 1275000, overdue: 302000 },
    { label: "Wk 9", collected: 5340000, due: 1360000, overdue: 331000 },
    { label: "Wk 10", collected: 5710000, due: 1298000, overdue: 294000 },
    { label: "Wk 11", collected: 5860000, due: 1352000, overdue: 309000 },
    { label: "Wk 12", collected: 6020000, due: 1310000, overdue: 288000 },
  ],
};

export type StatusBreakdownSlice = {
  id: string;
  label: string;
  value: number;
  tone: "success" | "warning" | "error" | "neutral";
};

export const statusBreakdownData: StatusBreakdownSlice[] = [
  { id: "collected", label: "Collected", value: 68, tone: "success" },
  { id: "due", label: "Due", value: 18, tone: "warning" },
  { id: "overdue", label: "Overdue", value: 9, tone: "error" },
  { id: "failed", label: "Failed", value: 5, tone: "neutral" },
];

export const statusBreakdownTotal = {
  value: "6,512",
  label: "installments",
};

export type NeedsAttentionSeverity = "error" | "warning" | "info";

export type NeedsAttentionItem = {
  id: string;
  title: string;
  context: string;
  severity: NeedsAttentionSeverity;
  badgeLabel: string;
  timestamp: string;
};

export const needsAttentionItems: NeedsAttentionItem[] = [
  {
    id: "na-1",
    title: "12 mandates failed re-authorization",
    context: "Sunrise Traders · Bengaluru",
    severity: "error",
    badgeLabel: "Action needed",
    timestamp: "18 min ago",
  },
  {
    id: "na-2",
    title: "KYC documents pending review",
    context: "9 merchants awaiting verification",
    severity: "warning",
    badgeLabel: "Pending",
    timestamp: "1 hr ago",
  },
  {
    id: "na-3",
    title: "Collection plan overdue by 5+ days",
    context: "142 customers across 38 merchants",
    severity: "error",
    badgeLabel: "Overdue",
    timestamp: "2 hr ago",
  },
  {
    id: "na-4",
    title: "Subscription payment failed",
    context: "Kalyan General Store",
    severity: "warning",
    badgeLabel: "Retry needed",
    timestamp: "3 hr ago",
  },
  {
    id: "na-5",
    title: "Employee onboarding stuck at document upload",
    context: "4 employees · 2 branches",
    severity: "info",
    badgeLabel: "Incomplete",
    timestamp: "5 hr ago",
  },
];

export type RecentActivityRow = {
  id: string;
  entity: string;
  merchant: string;
  type: string;
  amount: string;
  status: "Collected" | "Due" | "Overdue" | "Failed";
  time: string;
};

export const recentActivityRows: RecentActivityRow[] = [
  { id: "act-1", entity: "Ramesh Kumar", merchant: "Sunrise Traders", type: "Installment", amount: "₹2,400", status: "Collected", time: "10:42 AM" },
  { id: "act-2", entity: "Priya Sharma", merchant: "Kalyan General Store", type: "Installment", amount: "₹1,800", status: "Due", time: "10:15 AM" },
  { id: "act-3", entity: "Vikram Singh", merchant: "Om Enterprises", type: "Mandate Debit", amount: "₹3,200", status: "Failed", time: "9:58 AM" },
  { id: "act-4", entity: "Anita Desai", merchant: "Sunrise Traders", type: "Installment", amount: "₹950", status: "Overdue", time: "9:30 AM" },
  { id: "act-5", entity: "Suresh Patel", merchant: "New Bharat Mart", type: "Installment", amount: "₹4,100", status: "Collected", time: "9:12 AM" },
  { id: "act-6", entity: "Meena Iyer", merchant: "Om Enterprises", type: "Mandate Debit", amount: "₹2,750", status: "Collected", time: "8:47 AM" },
];
