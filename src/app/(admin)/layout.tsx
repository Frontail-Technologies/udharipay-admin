import type { ReactNode } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { AdminAuthGuard } from "@/features/auth/AdminAuthGuard";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return <AdminAuthGuard><AdminShell>{children}</AdminShell></AdminAuthGuard>;
}
