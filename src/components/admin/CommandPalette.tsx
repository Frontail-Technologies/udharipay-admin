"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, CornerDownLeft, Loader2, Search, Store, UserCog } from "lucide-react";
import { listEmployees } from "@/api/generated/employees";
import { listMerchants } from "@/api/generated/merchants";
import { adminNavigation } from "@/config/admin-navigation";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

type Result = { key: string; group: "Pages" | "Merchants" | "Employees"; title: string; subtitle?: string; href: string; icon: typeof Store };

function useDebounced(value: string, delay = 220) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

/** Opens the palette with ⌘K / Ctrl+K anywhere in the admin, or with the search button in the top bar. */
export function useCommandPaletteShortcut(onOpen: () => void) {
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        onOpen();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onOpen]);
}

/*
 * One place to jump anywhere: pages by name, and merchants and employees by name, ID or phone (live from the API).
 * Arrow keys move, Enter opens, Esc closes.
 */
export function CommandPalette({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const term = useDebounced(query.trim());
  const searching = term.length >= 2;

  const merchants = useQuery({
    queryKey: ["command-palette", "merchants", term],
    queryFn: ({ signal }) => listMerchants({ search: term, limit: 5 }, { signal }),
    enabled: open && searching,
    staleTime: 30_000,
  });
  const employees = useQuery({
    queryKey: ["command-palette", "employees", term],
    queryFn: ({ signal }) => listEmployees({ search: term, limit: 5 }, { signal }),
    enabled: open && searching,
    staleTime: 30_000,
  });

  const results = useMemo<Result[]>(() => {
    const needle = query.trim().toLowerCase();
    const pages: Result[] = adminNavigation
      .flatMap((group) => group.items.filter((item) => !item.disabled).map((item) => ({ ...item, group: group.label })))
      .filter((item) => !needle || item.label.toLowerCase().includes(needle))
      .slice(0, needle ? 5 : 8)
      .map((item) => ({ key: `page:${item.href}`, group: "Pages", title: item.label, subtitle: item.group, href: item.href, icon: item.icon }));
    const merchantRows: Result[] = searching
      ? (merchants.data?.data.items ?? []).map((merchant) => ({
          key: `merchant:${merchant.id}`,
          group: "Merchants",
          title: merchant.businessName,
          subtitle: [merchant.publicId, merchant.city].filter(Boolean).join(" · "),
          href: `/merchants/${merchant.id}`,
          icon: Store,
        }))
      : [];
    const employeeRows: Result[] = searching
      ? (employees.data?.data.items ?? []).map((employee) => ({
          key: `employee:${employee.id}`,
          group: "Employees",
          title: employee.name,
          subtitle: [employee.publicId, employee.branch].filter(Boolean).join(" · "),
          href: `/employees/${employee.id}`,
          icon: UserCog,
        }))
      : [];
    return [...merchantRows, ...employeeRows, ...pages];
  }, [query, searching, merchants.data, employees.data]);

  const loading = searching && (merchants.isFetching || employees.isFetching);

  function close() {
    onOpenChange(false);
    setQuery("");
    setActive(0);
  }

  function go(result: Result | undefined) {
    if (!result) return;
    close();
    router.push(result.href);
  }

  const groups = (["Merchants", "Employees", "Pages"] as const)
    .map((group) => ({ group, items: results.filter((result) => result.group === group) }))
    .filter((section) => section.items.length);

  return (
    <Dialog open={open} onOpenChange={(next) => (next ? onOpenChange(true) : close())}>
      <DialogContent showCloseButton={false} className="top-[12vh] translate-y-0 gap-0 overflow-hidden rounded-2xl p-0 shadow-[var(--shadow-raised)] sm:max-w-xl">
        <DialogTitle className="sr-only">Search UdhariPay</DialogTitle>
        <div className="flex items-center gap-3 border-b border-border px-4">
          {loading ? <Loader2 className="size-4.5 shrink-0 animate-spin text-primary" /> : <Search className="size-4.5 shrink-0 text-text-muted" />}
          <input
            autoFocus
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setActive(0);
            }}
            onKeyDown={(event) => {
              if (event.key === "ArrowDown") {
                event.preventDefault();
                setActive((index) => Math.min(index + 1, results.length - 1));
              } else if (event.key === "ArrowUp") {
                event.preventDefault();
                setActive((index) => Math.max(index - 1, 0));
              } else if (event.key === "Enter") {
                event.preventDefault();
                go(results[active]);
              }
            }}
            placeholder="Search merchants, employees or pages…"
            aria-label="Search merchants, employees or pages"
            className="h-14 min-w-0 flex-1 bg-transparent text-[15px] text-text-primary outline-none placeholder:text-text-muted"
          />
          <kbd className="hidden rounded-md bg-surface-muted px-1.5 py-0.5 text-[11px] font-medium text-text-muted sm:inline">Esc</kbd>
        </div>

        <div className="max-h-[min(60vh,440px)] overflow-y-auto p-2">
          {groups.length === 0 ? (
            <p className="px-3 py-10 text-center text-[13px] text-text-muted">{loading ? "Searching…" : `Nothing matches "${query}".`}</p>
          ) : (
            groups.map((section) => (
              <div key={section.group} className="mb-1">
                <p className="px-3 pt-2 pb-1 text-[11px] font-semibold text-text-muted">{section.group}</p>
                {section.items.map((result) => {
                  const index = results.indexOf(result);
                  const Icon = result.icon;
                  const selected = index === active;
                  return (
                    <button
                      key={result.key}
                      type="button"
                      onMouseMove={() => setActive(index)}
                      onClick={() => go(result)}
                      className={cn("flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors", selected ? "bg-primary-muted" : "hover:bg-surface-hover")}
                    >
                      <span className={cn("flex size-9 shrink-0 items-center justify-center rounded-full", selected ? "bg-primary text-primary-foreground" : "bg-surface-muted text-text-secondary")}>
                        <Icon className="size-4" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[13.5px] font-medium text-text-primary">{result.title}</span>
                        {result.subtitle ? <span className="block truncate text-[12px] text-text-muted">{result.subtitle}</span> : null}
                      </span>
                      {selected ? <CornerDownLeft className="size-4 shrink-0 text-primary" /> : <ArrowRight className="size-4 shrink-0 text-text-muted opacity-0" />}
                    </button>
                  );
                })}
              </div>
            ))
          )}
        </div>
        <div className="flex items-center gap-4 border-t border-border px-4 py-2.5 text-[11.5px] text-text-muted">
          <span><kbd className="font-sans font-semibold">↑↓</kbd> move</span>
          <span><kbd className="font-sans font-semibold">Enter</kbd> open</span>
          <span className="ml-auto">{searching ? "Live results" : "Type 2 letters to search records"}</span>
        </div>
      </DialogContent>
    </Dialog>
  );
}
