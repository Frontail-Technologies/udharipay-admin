import type { ReactNode } from "react";

export function FormField({
  label,
  htmlFor,
  error,
  children,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={htmlFor} className="text-[12px] font-medium text-text-secondary">
        {label}
      </label>
      {children}
      {error && <p className="text-[11px] text-error">{error}</p>}
    </div>
  );
}
