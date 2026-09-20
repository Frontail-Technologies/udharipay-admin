"use client";

import { usePathname } from "next/navigation";
import { Bell, HelpCircle, Menu, Search } from "lucide-react";
import { adminNavigation } from "@/config/admin-navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/features/auth/AuthProvider";

function useActiveLabel() {
  const pathname = usePathname();
  for (const group of adminNavigation) {
    const match = group.items.find((item) => pathname?.startsWith(item.href));
    if (match) return match.label;
  }
  return "Dashboard";
}

export function AdminTopbar({ onOpenMobileNav }: { onOpenMobileNav: () => void }) {
  const activeLabel = useActiveLabel();
  const { logout, session } = useAuth();

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-2 border-b border-border bg-surface/95 px-4 backdrop-blur supports-backdrop-filter:bg-surface/80 sm:gap-3 sm:px-5 lg:gap-4 lg:px-6">
      <Button
        variant="ghost"
        size="icon"
        aria-label="Open navigation"
        onClick={onOpenMobileNav}
        className="size-9 shrink-0 text-text-secondary md:hidden"
      >
        <Menu className="size-4.5" />
      </Button>

      <nav aria-label="Breadcrumb" className="min-w-0 shrink-0">
        <ol className="flex items-center gap-1.5 text-[13px]">
          <li className="hidden text-text-muted sm:inline">UdhariPay Admin</li>
          <li className="hidden text-text-muted sm:inline">/</li>
          <li className="truncate font-medium text-text-primary">{activeLabel}</li>
        </ol>
      </nav>

      <div className="ml-auto hidden min-w-0 w-full max-w-sm items-center sm:flex">
        <div className="relative w-full">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-text-muted" />
          <Input
            type="search"
            placeholder="Search merchants, customers, plans…"
            aria-label="Global search"
            className="h-9 bg-surface-muted pl-8 text-[13px]"
          />
        </div>
      </div>

      <div className="ml-auto flex shrink-0 items-center gap-1 sm:ml-0">
        <Button
          variant="ghost"
          size="icon"
          aria-label="Search"
          className="size-9 text-text-secondary sm:hidden"
        >
          <Search className="size-4.5" />
        </Button>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="Notifications" className="size-9 text-text-secondary">
              <Bell className="size-4.5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Notifications</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Help"
              className="hidden size-9 text-text-secondary sm:inline-flex"
            >
              <HelpCircle className="size-4.5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Help</TooltipContent>
        </Tooltip>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              aria-label="Admin account menu"
              className="ml-1 flex size-9 items-center justify-center rounded-full bg-primary-muted text-[12px] font-semibold text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {session?.user.role.slice(0, 2).toUpperCase() ?? "AU"}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem disabled>Profile</DropdownMenuItem>
            <DropdownMenuItem disabled>Settings</DropdownMenuItem>
            <DropdownMenuItem onClick={() => void logout()}>Log out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
