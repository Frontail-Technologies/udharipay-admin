import Link from "next/link";
import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export type RowAction = {
  label: string;
  href?: string;
  disabled?: boolean;
};

/** Shared 3-dot row-actions menu. Only actions with a real `href` navigate. */
export function RowActionsMenu({ actions }: { actions: RowAction[] }) {
  return (
    // Stop propagation so opening the menu doesn't also trigger the row's
    // own onClick (used for row-click-to-navigate on management tables).
    <div onClick={(event) => event.stopPropagation()} className="flex justify-end">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon-sm" aria-label="Row actions" className="text-text-secondary">
            <MoreHorizontal className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          {actions.map((action) =>
            action.disabled || !action.href ? (
              <DropdownMenuItem key={action.label} disabled>
                {action.label}
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem key={action.label} asChild>
                <Link href={action.href}>{action.label}</Link>
              </DropdownMenuItem>
            ),
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
