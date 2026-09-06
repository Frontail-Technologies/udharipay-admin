import { cn } from "@/lib/utils";

export type StatusBadgeTone =
  | "success"
  | "warning"
  | "error"
  | "info"
  | "neutral"
  | "primary";

const toneClasses: Record<StatusBadgeTone, string> = {
  success: "bg-success/10 text-success",
  warning: "bg-warning/10 text-warning",
  error: "bg-error/10 text-error",
  info: "bg-info/10 text-info",
  neutral: "bg-surface-muted text-text-secondary",
  primary: "bg-primary-muted text-primary",
};

export function StatusBadge({
  tone = "neutral",
  children,
  className,
}: {
  tone?: StatusBadgeTone;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium leading-4 whitespace-nowrap",
        toneClasses[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
