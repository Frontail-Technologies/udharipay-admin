import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import type { ReactNode } from "react";

/**
 * Shared detail-page header: back link, an entity identity block (avatar
 * tile + name + meta line), a status badge row, and right-side actions.
 * Reused by Merchant Detail and Customer Detail so future entity detail
 * pages (Employees, Udhaar Plans, ...) don't re-implement this chrome.
 */
export function EntityPageHeader({
  backHref,
  backLabel = "Back",
  avatarLabel,
  title,
  meta,
  badges,
  actions,
}: {
  backHref: string;
  backLabel?: string;
  avatarLabel: string;
  title: string;
  meta: string;
  badges?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3">
      <Link
        href={backHref}
        className="inline-flex w-fit items-center gap-1 rounded-full px-2 py-1 -ml-2 text-[12.5px] font-medium text-text-secondary transition-colors hover:bg-surface hover:text-text-primary"
      >
        <ChevronLeft className="size-3.5" />
        {backLabel}
      </Link>

      {/* Hero card: a soft brand band, the entity's initials, name, meta and status, with actions on the right. */}
      <div className="relative overflow-hidden card-surface">
        <div aria-hidden className="absolute inset-x-0 top-0 h-20 bg-[linear-gradient(120deg,color-mix(in_oklch,var(--primary),transparent_86%),color-mix(in_oklch,var(--primary),transparent_94%)_55%,transparent)]" />
        <div className="relative flex flex-wrap items-end justify-between gap-4 px-5 pt-6 pb-5 sm:px-6">
          <div className="flex min-w-0 items-end gap-4">
            <span className="flex size-16 shrink-0 items-center justify-center rounded-[20px] bg-[linear-gradient(135deg,#b23fe0,#7a1fa8)] text-[20px] font-bold text-white shadow-[0_10px_24px_-10px_rgb(158_43_208/0.7)] ring-4 ring-surface">
              {avatarLabel}
            </span>
            <div className="min-w-0 pb-0.5">
              <h1 className="truncate text-[22px] font-bold tracking-[-0.02em] text-text-primary sm:text-[26px]">
                {title}
              </h1>
              <p className="truncate text-[12.5px] text-text-muted">{meta}</p>
              {badges && <div className="mt-2 flex flex-wrap items-center gap-1.5">{badges}</div>}
            </div>
          </div>
          {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
        </div>
      </div>
    </div>
  );
}
