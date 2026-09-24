import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  Store,
  Users,
  UserCog,
  Wallet,
  Landmark,
  CreditCard,
  RefreshCcw,
  ShieldCheck,
  BarChart3,
  Activity,
  Settings,
  Megaphone,
} from "lucide-react";

export type AdminNavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  disabled?: boolean;
};

export type AdminNavGroup = {
  label: string;
  items: AdminNavItem[];
};

export const adminNavigation: AdminNavGroup[] = [
  {
    label: "Overview",
    items: [{ label: "Dashboard", href: "/dashboard", icon: LayoutDashboard }],
  },
  {
    label: "Operations",
    items: [
      { label: "Merchants", href: "/merchants", icon: Store },
      { label: "Customers", href: "/customers", icon: Users },
      { label: "Employees", href: "/employees", icon: UserCog },
      { label: "Udhaar Plans", href: "/plans", icon: Wallet },
      { label: "Collections", href: "/collections", icon: Landmark },
    ],
  },
  {
    label: "Payments",
    items: [
      { label: "Mandates", href: "/mandates", icon: CreditCard },
      { label: "Subscriptions", href: "/subscriptions", icon: RefreshCcw },
    ],
  },
  {
    label: "Compliance",
    items: [
      { label: "KYC & Verification", href: "/kyc", icon: ShieldCheck },
    ],
  },
  {
    label: "Insights",
    items: [{ label: "Reports", href: "/reports", icon: BarChart3 }],
  },
  {
    label: "System",
    items: [
      { label: "Communications", href: "/communications", icon: Megaphone },
      { label: "Events", href: "/events", icon: Activity },
      { label: "Settings", href: "/settings", icon: Settings },
    ],
  },
];
