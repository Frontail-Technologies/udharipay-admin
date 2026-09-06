"use client";

import { useState } from "react";
import { Button, type buttonVariants } from "@/components/ui/button";
import type { VariantProps } from "class-variance-authority";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

type ButtonVariant = VariantProps<typeof buttonVariants>["variant"];

/**
 * Shared confirmation dialog for all three KYC decisions — never change a
 * review's status directly from a click, always confirm first (and require
 * a reason for anything that blocks the entity).
 */
export function KycDecisionDialog({
  open,
  onOpenChange,
  title,
  description,
  reasonRequired,
  reasonLabel = "Reason",
  confirmLabel,
  confirmVariant = "default",
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  reasonRequired: boolean;
  reasonLabel?: string;
  confirmLabel: string;
  confirmVariant?: ButtonVariant;
  onConfirm: (reason: string) => void;
}) {
  const [reason, setReason] = useState("");
  const canConfirm = !reasonRequired || reason.trim().length >= 5;

  const handleConfirm = () => {
    onConfirm(reason.trim());
    setReason("");
    onOpenChange(false);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) setReason("");
        onOpenChange(next);
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        {reasonRequired ? (
          <div className="flex flex-col gap-1.5">
            <label htmlFor="kyc-decision-reason" className="text-[12px] font-medium text-text-secondary">
              {reasonLabel}
            </label>
            <Textarea
              id="kyc-decision-reason"
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              placeholder="Explain what needs to change or why this is being rejected…"
              className="min-h-20 text-[13px]"
            />
            {!canConfirm && reason.length > 0 && (
              <p className="text-[11px] text-error">Please provide a bit more detail (at least 5 characters).</p>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-1.5">
            <label htmlFor="kyc-decision-note" className="text-[12px] font-medium text-text-secondary">
              Note (optional)
            </label>
            <Textarea
              id="kyc-decision-note"
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              placeholder="Add an optional note for the record…"
              className="min-h-16 text-[13px]"
            />
          </div>
        )}
        <DialogFooter>
          <Button type="button" variant="outline" size="sm" onClick={() => onOpenChange(false)} className="h-8 text-[12.5px]">
            Cancel
          </Button>
          <Button
            type="button"
            variant={confirmVariant}
            size="sm"
            disabled={!canConfirm}
            onClick={handleConfirm}
            className="h-8 text-[12.5px]"
          >
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
