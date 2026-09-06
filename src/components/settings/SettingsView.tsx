"use client";

import { EntityTabs } from "@/components/entity/EntityTabs";
import { CollectionsSettingsPanel } from "@/components/settings/CollectionsSettingsPanel";
import { PlanSettingsPanel } from "@/components/settings/PlanSettingsPanel";
import { SystemInfoSection } from "@/components/settings/SystemInfoSection";
import { ResetSettingsButton } from "@/components/settings/ResetSettingsButton";

const TABS = [
  { value: "collections", label: "Collections" },
  { value: "plans", label: "Plan Defaults" },
];

/**
 * Only two functional sections remain, so this is simple compact tabs, not
 * a vertical settings sidebar — see the Settings Simplification pass.
 * System Information is informational only, shown below the tabs rather
 * than as a tab itself.
 */
export function SettingsView() {
  return (
    <div className="mx-auto flex max-w-3xl min-w-0 flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-[24px] font-semibold tracking-tight text-text-primary">Settings</h1>
          <p className="mt-1 text-[13px] leading-relaxed text-text-secondary">Platform and admin configuration.</p>
        </div>
        <ResetSettingsButton />
      </div>

      <EntityTabs
        tabs={TABS}
        defaultValue="collections"
        panels={{
          collections: <CollectionsSettingsPanel />,
          plans: <PlanSettingsPanel />,
        }}
      />

      <SystemInfoSection />
    </div>
  );
}
