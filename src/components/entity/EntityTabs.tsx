"use client";

import type { ReactNode } from "react";

import { Clock } from "lucide-react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

export type EntityTabDef = {
  value: string;
  label: string;
};

type EntityTabsProps = {
  tabs: EntityTabDef[];
  defaultValue: string;
  panels: Record<string, ReactNode>;
  value?: string;
  onValueChange?: (value: string) => void;
};

export function EntityTabs({ tabs, defaultValue, panels, value, onValueChange }: EntityTabsProps) {
  return (
    <Tabs defaultValue={defaultValue} value={value} onValueChange={onValueChange} className="min-w-0">
      <div
        className={cn(
          "min-w-0 max-w-full",
          "overflow-x-auto overflow-y-hidden",
          "[scrollbar-width:none]",
          "[-ms-overflow-style:none]",
          "[&::-webkit-scrollbar]:hidden",
        )}
      >
        <TabsList
          className={cn(
            "inline-flex h-10 min-w-max items-center gap-1",
            "rounded-lg border border-border",
            "bg-surface-muted p-1",
          )}
        >
          {tabs.map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className={cn(
                "h-8 shrink-0 whitespace-nowrap",
                "rounded-md border border-transparent",
                "px-3.5",
                "text-[13px] font-medium text-text-secondary",
                "transition-colors duration-150",

                "hover:bg-surface-hover",
                "hover:text-text-primary",

                "data-[state=active]:border-primary/20",
                "data-[state=active]:bg-primary/10",
                "data-[state=active]:font-semibold",
                "data-[state=active]:text-primary",
                "data-[state=active]:shadow-xs",

                "focus-visible:outline-none",
                "focus-visible:ring-2",
                "focus-visible:ring-primary/30",
                "focus-visible:ring-offset-1",
              )}
            >
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </div>

      {tabs.map((tab) => (
        <TabsContent
          key={tab.value}
          value={tab.value}
          className={cn("mt-4 min-w-0", "focus-visible:outline-none")}
        >
          {panels[tab.value]}
        </TabsContent>
      ))}
    </Tabs>
  );
}

/**
 * Honest placeholder for a workflow that has not been implemented yet.
 */
export function ComingSoonPanel({ label }: { label: string }) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-2",
        "rounded-lg border border-dashed border-border-strong",
        "bg-surface-muted/40",
        "px-6 py-14 text-center",
      )}
    >
      <div
        className={cn(
          "flex size-9 items-center justify-center",
          "rounded-lg bg-primary/10 text-primary",
        )}
      >
        <Clock className="size-4.5" />
      </div>

      <p className="text-[13.5px] font-medium text-text-primary">{label}</p>

      <p className="text-[12px] text-text-muted">Coming in a future phase.</p>
    </div>
  );
}
