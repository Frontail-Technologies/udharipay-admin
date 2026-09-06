"use client";

import { FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { StatusBadge } from "@/components/admin/StatusBadge";
import type { KycDocument } from "@/data/admin";
import { kycDocumentCheckTone } from "@/data/admin/statusTones";
import { formatDate, humanizeSnakeCase } from "@/lib/format";

/**
 * Shared document preview — this demo phase never has a real file to show,
 * so it renders a safe metadata placeholder. A real `fileUrl` on
 * `KycDocument` would render here (image/PDF viewer) once uploads exist.
 */
export function DocumentPreviewDialog({ document }: { document: KycDocument }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="h-7 text-[11.5px]">
          View
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>{document.type}</DialogTitle>
          <DialogDescription>{document.referenceMasked}</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border-strong bg-surface-muted/40 py-10">
          <FileText className="size-8 text-text-muted" />
          <p className="text-[12px] text-text-muted">No file preview available in this demo.</p>
        </div>
        <div className="flex flex-col gap-1.5 text-[12.5px]">
          <div className="flex items-center justify-between">
            <span className="text-text-muted">Uploaded</span>
            <span className="text-text-primary">{formatDate(document.uploadedAt)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-text-muted">Check Status</span>
            <StatusBadge tone={kycDocumentCheckTone[document.checkStatus]}>
              {humanizeSnakeCase(document.checkStatus)}
            </StatusBadge>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
