"use client";

import type { ReactNode } from "react";
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Section-level editable panel — shares DetailSection's visual language
 * (white surface, 11px radius, compact padding) but owns the Edit/Cancel/
 * Save header affordance. It does NOT own form state: the Save button
 * submits the `<form id={formId}>` rendered by the caller's own content
 * (native HTML `form` attribute), so this stays a pure UI shell and every
 * section keeps its own react-hook-form + Zod schema instead of a shared,
 * un-typed edit implementation.
 */
export function EditableDetailSection({
  title,
  description,
  editAriaLabel,
  editing,
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
            <Button type="button" variant="outline" size="sm" onClick={onCancel} className="h-8 text-[12.5px]">
              Cancel
            </Button>
            <Button type="submit" form={formId} size="sm" className="h-8 text-[12.5px]">
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
