"use client";

import { useEffect, useState, type ReactNode } from "react";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminTopbar } from "@/components/admin/AdminTopbar";
import { MobileSidebar } from "@/components/admin/MobileSidebar";

const COLLAPSE_STORAGE_KEY = "udharipay.admin.sidebarCollapsed";

export function AdminShell({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    let initial = false;
    try {
      const stored = window.localStorage.getItem(COLLAPSE_STORAGE_KEY);
      if (stored === "1") initial = true;
      else if (stored === "0") initial = false;
      // No stored preference yet: default to a collapsed icon-rail on
      // tablet-width screens so the sidebar doesn't crowd the content.
      else if (window.innerWidth < 1280) initial = true;
    } catch {
      // localStorage/window unavailable — keep default expanded state
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time sync from localStorage/viewport width on mount
    setCollapsed(initial);
  }, []);

  const toggleCollapsed = () => {
    setCollapsed((prev) => {
      const next = !prev;
      try {
        window.localStorage.setItem(COLLAPSE_STORAGE_KEY, next ? "1" : "0");
      } catch {
        // ignore persistence failures
      }
      return next;
    });
  };

  return (
    // `body` is the fixed h-dvh/overflow-hidden box (see app/layout.tsx); this
    // row fills it exactly and never grows past it — `<main>` below is the
    // ONLY element allowed to scroll vertically, so there's exactly one
    // page-level scrollbar. The sidebar's own nav list owns a second,
    // independent scrollbar only when its links overflow the viewport.
    <div className="flex min-h-0 w-full flex-1 overflow-hidden bg-background">
      <AdminSidebar collapsed={collapsed} onToggleCollapsed={toggleCollapsed} />
      <MobileSidebar open={mobileNavOpen} onOpenChange={setMobileNavOpen} />
      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <AdminTopbar onOpenMobileNav={() => setMobileNavOpen(true)} />
        <main className="min-h-0 min-w-0 flex-1 overflow-x-hidden overflow-y-auto px-4 py-4 sm:px-5 sm:py-5 lg:px-6 lg:py-6">
          {children}
        </main>
      </div>
    </div>
  );
}
