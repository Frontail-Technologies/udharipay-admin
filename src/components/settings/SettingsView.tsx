"use client";

import { BillingConfigurationSection } from "@/features/billing/components/BillingConfigurationSection";
import { SystemInfoSection } from "@/components/settings/SystemInfoSection";

export function SettingsView() {
  return (
    <div className="mx-auto flex max-w-3xl min-w-0 flex-col gap-5">
      <div className="min-w-0">
        <h1 className="text-[24px] font-semibold tracking-tight text-text-primary">Settings</h1>
        <p className="mt-1 text-[13px] leading-relaxed text-text-secondary">Platform and admin configuration.</p>
      </div>

      <div>
        <h2 className="text-[15px] font-semibold text-text-primary">Billing &amp; Subscription</h2>
        <p className="mt-0.5 text-[12.5px] text-text-muted">Configure SaaS subscription pricing and activation fee.</p>
        <div className="mt-3"><BillingConfigurationSection /></div>
      </div>

      <SystemInfoSection />
    </div>
  );
}
