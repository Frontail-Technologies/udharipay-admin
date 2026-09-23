import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const FORBIDDEN = /useAdminEntities|admin-demo-data|adminDemoStore|adminCollectionsStore|adminKycStore|adminAuditStore|auditDiff|data\/admin\/(reports|merchants|customers|mandates|subscriptions|kycReviews|employees|payments|plans|installments|events|seededRandom)/;

function collectSourceFiles(root: string): string[] {
  const files: string[] = [];
  for (const entry of fs.readdirSync(root, { withFileTypes: true })) {
    const entryPath = path.join(root, entry.name);
    if (entry.isDirectory()) {
      files.push(...collectSourceFiles(entryPath));
      continue;
    }
    if (!/\.(ts|tsx)$/.test(entry.name)) continue;
    if (entry.name.endsWith(".test.ts") || entry.name.endsWith(".test.tsx")) continue;
    files.push(entryPath);
  }
  return files;
}

describe("real route fixture dependency audit", () => {
  it("keeps every integrated real route and feature free of legacy demo fixture imports", () => {
    const roots = ["src/app/(admin)", "src/features", "src/components"];
    const offenders: string[] = [];
    for (const root of roots) {
      for (const file of collectSourceFiles(root)) {
        const source = fs.readFileSync(file, "utf8");
        if (FORBIDDEN.test(source)) offenders.push(file);
      }
    }
    expect(offenders).toEqual([]);
  });
});
