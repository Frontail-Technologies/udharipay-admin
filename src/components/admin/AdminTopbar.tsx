"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, HelpCircle, Menu, Search } from "lucide-react";
import { adminNavigation } from "@/config/admin-navigation";
import { useCallback, useState } from "react";
import { CommandPalette, useCommandPaletteShortcut } from "@/components/admin/CommandPalette";
import { ThemeToggle } from "@/components/admin/ThemeToggle";
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
  const [paletteOpen, setPaletteOpen] = useState(false);
  const openPalette = useCallback(() => setPaletteOpen(true), []);
  useCommandPaletteShortcut(openPalette);

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-2 bg-background/85 px-4 backdrop-blur supports-backdrop-filter:bg-background/70 sm:gap-3 sm:px-5 lg:gap-4 lg:px-6">
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
          <li className="hidden text-text-muted md:inline">UdhariPay Admin</li>
          <li className="hidden text-text-muted md:inline">/</li>
          {/* On phones the page's own heading names the page, so the bar shows the brand instead of repeating it. */}
          <li className="truncate font-semibold text-text-primary md:hidden">UdhariPay</li>
          <li className="hidden truncate font-medium text-text-primary md:inline">{activeLabel}</li>
        </ol>
      </nav>

      {/* The search box opens the command palette (also ⌘K / Ctrl+K). */}
      <button
        type="button"
        onClick={() => setPaletteOpen(true)}
        aria-label="Search (Ctrl+K)"
        className="ml-auto hidden h-9 w-full max-w-sm min-w-0 items-center gap-2 rounded-full bg-surface px-3 text-[13px] text-text-muted shadow-[0_1px_2px_rgb(23_19_28/0.04)] transition-colors hover:text-text-secondary sm:flex"
      >
        <Search className="size-4 shrink-0" />
        <span className="truncate">Search merchants, employees, pages…</span>
        <kbd className="ml-auto rounded-md bg-surface-muted px-1.5 py-0.5 text-[11px] font-medium">⌘K</kbd>
      </button>

      <div className="ml-auto flex shrink-0 items-center gap-1 sm:ml-0">
        <Button
          variant="ghost"
          size="icon"
          aria-label="Search"
          onClick={() => setPaletteOpen(true)}
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

        <ThemeToggle />

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
            <DropdownMenuItem asChild><Link href="/settings">Settings</Link></DropdownMenuItem>
            <DropdownMenuItem onClick={() => void logout()}>Log out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <CommandPalette open={paletteOpen} onOpenChange={setPaletteOpen} />
    </header>
  );
}
