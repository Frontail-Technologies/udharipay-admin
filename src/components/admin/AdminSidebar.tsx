"use client";

import { ChevronsLeft, ChevronsRight, LogOut, ShieldCheck } from "lucide-react";
import { AdminNavList } from "@/components/admin/AdminNavList";
import { useAuth } from "@/features/auth/AuthProvider";
import { cn } from "@/lib/utils";

export function AdminSidebar({
  collapsed,
  onToggleCollapsed,
}: {
  collapsed: boolean;
  onToggleCollapsed: () => void;
}) {
  const { logout } = useAuth();

  return (
    <aside
      className={cn(
        "hidden md:flex h-dvh sticky top-0 shrink-0 flex-col border-r border-sidebar-border bg-sidebar transition-[width] duration-200 ease-out",
        collapsed ? "w-16" : "w-60",
      )}
    >
      <div
        className={cn(
          "flex h-16 shrink-0 items-center px-4",
          collapsed ? "justify-center px-0" : "justify-between",
        )}
      >
        {!collapsed && (
          <span className="flex items-center gap-2.5 text-[15px] font-semibold tracking-tight text-text-primary">
            <span className="flex size-8 items-center justify-center rounded-[10px] bg-[linear-gradient(135deg,#b23fe0,#7a1fa8)] text-[14px] font-bold text-white shadow-[0_4px_12px_-4px_rgb(158_43_208/0.6)]">U</span>
            <span>UdhariPay <span className="font-medium text-text-muted">Admin</span></span>
          </span>
        )}
        <button
          type="button"
          onClick={onToggleCollapsed}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="inline-flex h-7 w-7 items-center justify-center rounded-md text-text-muted hover:bg-surface-hover hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {collapsed ? <ChevronsRight className="size-4" /> : <ChevronsLeft className="size-4" />}
        </button>
      </div>

      <AdminNavList collapsed={collapsed} />

      <div className="shrink-0 p-2">
        <div
          className={cn(
            "flex items-center gap-2.5 rounded-2xl bg-surface-muted px-2.5 py-2",
            collapsed && "justify-center px-0",
          )}
        >
          <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary-muted text-primary">
            <ShieldCheck className="size-4" />
          </span>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] font-medium text-text-primary">Admin User</p>
              <p className="truncate text-[11px] text-text-muted">Platform Admin</p>
            </div>
          )}
        </div>
        {!collapsed && (
          <div className="mt-1 flex flex-col gap-0.5">
            <button
              type="button"
              aria-label="Log out"
              onClick={() => void logout()}
              className="flex items-center gap-2.5 rounded-md px-2.5 py-2 text-left text-[13px] font-medium text-text-secondary hover:bg-surface-hover hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <LogOut className="size-4.25" />
              Log out
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
