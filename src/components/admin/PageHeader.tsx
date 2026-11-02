"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { adminNavigation } from "@/config/admin-navigation";

/*
 * The top of every list page: the page's own icon in a soft badge, a large title, one line of description and the
 * main action on the right. The icon comes from the navigation, so the page and its menu item always match.
 */
export function PageHeader({ title, description, actions }: { title: string; description?: string; actions?: ReactNode }) {
  const pathname = usePathname();
  const Icon = adminNavigation.flatMap((group) => group.items).find((item) => pathname?.startsWith(item.href))?.icon;

  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div className="flex min-w-0 items-center gap-3.5">
        {Icon ? (
          <span className="hidden size-12 shrink-0 items-center justify-center rounded-2xl bg-[linear-gradient(140deg,var(--primary-muted),color-mix(in_oklch,var(--primary-muted),var(--primary)_14%))] text-primary shadow-[inset_0_0_0_1px_color-mix(in_oklch,var(--primary),transparent_88%)] sm:flex">
            <Icon className="size-5.5" />
          </span>
        ) : null}
        <div className="min-w-0">
          <h1 className="text-[24px] font-bold tracking-[-0.02em] text-text-primary sm:text-[28px]">{title}</h1>
          {description ? <p className="mt-0.5 text-[13px] leading-relaxed text-text-secondary">{description}</p> : null}
        </div>
      </div>
      {actions ? <div className="flex shrink-0 items-center gap-2">{actions}</div> : null}
    </div>
  );
}
