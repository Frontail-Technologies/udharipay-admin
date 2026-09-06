"use client";

import { AdminNavList } from "@/components/admin/AdminNavList";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

export function MobileSidebar({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="gap-0 p-0">
        <SheetHeader className="border-b border-border px-4 py-4">
          <SheetTitle className="text-[15px] font-semibold tracking-tight text-text-primary">
            UdhariPay <span className="text-primary">Admin</span>
          </SheetTitle>
        </SheetHeader>
        <AdminNavList onNavigate={() => onOpenChange(false)} />
      </SheetContent>
    </Sheet>
  );
}
