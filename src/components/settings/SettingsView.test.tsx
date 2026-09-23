import fs from "node:fs";
import { describe, expect, it } from "vitest";

describe("Settings no-op structural audit", () => {
  it("never wires a Save action to a local store with no real backend consumer", () => {
    const source = fs.readFileSync("src/components/settings/SettingsView.tsx", "utf8");
    expect(source).not.toMatch(/adminSettingsStore|adminDemoStore|data\/admin\/settings/);
  });

  it("composes only the real Billing configuration and system info sections", () => {
    const source = fs.readFileSync("src/components/settings/SettingsView.tsx", "utf8");
    expect(source).toContain('import { BillingConfigurationSection } from "@/features/billing/components/BillingConfigurationSection"');
    expect(source).toContain("<BillingConfigurationSection");
  });

  it("no longer ships the removed no-op Collections/Plan-defaults panels", () => {
    expect(fs.existsSync("src/components/settings/CollectionsSettingsPanel.tsx")).toBe(false);
    expect(fs.existsSync("src/components/settings/PlanSettingsPanel.tsx")).toBe(false);
    expect(fs.existsSync("src/store/adminSettingsStore.ts")).toBe(false);
  });
});
