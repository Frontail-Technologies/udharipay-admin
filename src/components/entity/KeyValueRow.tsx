import type { ReactNode } from "react";

export function KeyValueRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 py-1 text-[13px] leading-5">
      <span className="text-[12.5px] text-text-muted">{label}</span>
      <span className="min-w-0 truncate text-right text-[13.5px] font-medium text-text-primary">
        {value}
      </span>
    </div>
  );
}
