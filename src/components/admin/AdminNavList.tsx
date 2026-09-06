"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { adminNavigation } from "@/config/admin-navigation";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

/**
 * Shared nav-group rendering used by both the desktop AdminSidebar (icon-rail
 * capable) and the mobile Sheet drawer (always expanded) — one source of
 * truth for the nav tree so the two surfaces can't drift apart.
 */
export function AdminNavList({
  collapsed = false,
  onNavigate,
}: {
  collapsed?: boolean;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();

  return (
    <nav className="flex-1 overflow-y-auto px-2 py-3">
      {adminNavigation.map((group) => (
        <div key={group.label} className="mb-4">
          {!collapsed && (
            <div className="px-2 pb-1.5 text-[10.5px] font-semibold uppercase tracking-wider text-text-muted">
              {group.label}
            </div>
          )}
          <ul className="flex flex-col gap-0.5">
            {group.items.map((item) => {
              const Icon = item.icon;
              const isActive = pathname?.startsWith(item.href) && !item.disabled;

              const row = (
                <span
                  className={cn(
                    "flex items-center gap-2.5 rounded-md px-2.5 py-2 text-[13px] font-medium transition-colors",
                    collapsed && "justify-center px-0",
                    isActive
                      ? "bg-sidebar-active text-primary"
                      : item.disabled
                        ? "text-text-muted/70 cursor-not-allowed"
                        : "text-text-secondary hover:bg-surface-hover hover:text-text-primary",
                  )}
                >
                  <Icon className="size-4.25 shrink-0" />
                  {!collapsed && <span className="truncate">{item.label}</span>}
                </span>
              );

              const content = item.disabled ? (
                <span aria-disabled="true" aria-label={`${item.label} (coming soon)`}>
                  {row}
                </span>
              ) : (
                <Link
                  href={item.href}
                  aria-label={item.label}
                  aria-current={isActive ? "page" : undefined}
                  onClick={onNavigate}
                >
                  {row}
                </Link>
              );

              return (
                <li key={item.label}>
                  {collapsed ? (
                    <Tooltip>
                      <TooltipTrigger asChild>{content}</TooltipTrigger>
                      <TooltipContent side="right">
                        {item.label}
                        {item.disabled ? " (coming soon)" : ""}
                      </TooltipContent>
                    </Tooltip>
                  ) : (
                    content
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}
