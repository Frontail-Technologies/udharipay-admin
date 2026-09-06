"use client";

import { useState } from "react";
import { toast } from "sonner";
import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { resetAdminSettings } from "@/store/adminSettingsStore";

/** Resets ONLY the settings store — never entity/workflow data (Merchants, Customers, KYC, Collections follow-ups). */
export function ResetSettingsButton() {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" variant="outline" size="sm" className="h-8 gap-1.5 text-[12.5px]">
          <RotateCcw className="size-3.5" />
          Reset to Defaults
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Reset Settings to Defaults?</DialogTitle>
          <DialogDescription>
            This restores every platform setting to its shipped default. Merchants, Customers, KYC records and
            Collections follow-ups are never affected.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button type="button" variant="outline" size="sm" onClick={() => setOpen(false)} className="h-8 text-[12.5px]">
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            className="h-8 text-[12.5px]"
            onClick={() => {
              resetAdminSettings();
              toast.success("Settings reset to defaults");
              setOpen(false);
            }}
          >
            Reset Settings
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
