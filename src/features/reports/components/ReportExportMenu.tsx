"use client";

import { Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ReportExportMenu({ exportingFormat, exportError, onExport }: { exportingFormat: "xlsx" | "pdf" | null; exportError: string | null; onExport: (format: "xlsx" | "pdf") => void }) {
  return <div className="flex items-center gap-2">
    <Button type="button" variant="outline" size="sm" className="h-8 gap-1.5 text-[12.5px]" disabled={exportingFormat !== null} onClick={() => onExport("xlsx")}>
      {exportingFormat === "xlsx" ? <Loader2 className="size-3.5 animate-spin" /> : <Download className="size-3.5" />}
      Export XLSX
    </Button>
    <Button type="button" variant="outline" size="sm" className="h-8 gap-1.5 text-[12.5px]" disabled={exportingFormat !== null} onClick={() => onExport("pdf")}>
      {exportingFormat === "pdf" ? <Loader2 className="size-3.5 animate-spin" /> : <Download className="size-3.5" />}
      Export PDF
    </Button>
    {exportError && <span className="text-[12px] text-error">{exportError}</span>}
  </div>;
}
