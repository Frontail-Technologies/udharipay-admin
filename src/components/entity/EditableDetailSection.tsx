"use client";

import type { ReactNode } from "react";
import { Loader2, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function EditableDetailSection({
  title,
  description,
  editAriaLabel,
  editing,
  isSaving = false,
  onEdit,
  onCancel,
  formId,
  className,
  children,
}: {
  title: string;
  description?: string;
  editAriaLabel: string;
  editing: boolean;
  isSaving?: boolean;
  onEdit: () => void;
  onCancel: () => void;
  formId: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        "flex h-full flex-col rounded-[11px] border bg-surface p-4 transition-colors",
        editing ? "border-primary/30" : "border-border",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-[13.5px] font-semibold text-text-primary">{title}</h3>
            {editing && (
              <span className="rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium tracking-wide text-primary uppercase">
                Editing
              </span>
            )}
          </div>
          {description && <p className="mt-0.5 text-[11.5px] text-text-muted">{description}</p>}
        </div>

        {editing ? (
          <div className="flex shrink-0 items-center gap-1.5">
            <Button type="button" variant="outline" size="sm" disabled={isSaving} onClick={onCancel} className="h-8 text-[12.5px]">
              Cancel
            </Button>
            <Button type="submit" form={formId} size="sm" disabled={isSaving} className="h-8 text-[12.5px]">
              {isSaving && <Loader2 className="size-3.5 animate-spin" />}
              Save Changes
            </Button>
          </div>
        ) : (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onEdit}
            aria-label={editAriaLabel}
            className="h-8 shrink-0 gap-1.5 text-[12.5px] text-text-secondary"
          >
            <Pencil className="size-3.5" />
            Edit
          </Button>
        )}
      </div>

      <div className="mt-3 flex-1">{children}</div>
    </div>
  );
}
