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
        className="inline-flex w-fit items-center gap-1 text-[12.5px] font-medium text-text-secondary hover:text-text-primary"
      >
        <ChevronLeft className="size-3.5" />
        {backLabel}
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex min-w-0 items-start gap-3">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-primary-muted text-[14px] font-semibold text-primary">
            {avatarLabel}
          </span>
          <div className="min-w-0">
            <h1 className="truncate text-[19px] font-semibold tracking-tight text-text-primary sm:text-[21px]">
              {title}
            </h1>
            <p className="truncate text-[12.5px] text-text-muted">{meta}</p>
            {badges && <div className="mt-2 flex flex-wrap items-center gap-1.5">{badges}</div>}
          </div>
        </div>
        {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
      </div>
    </div>
  );
}
