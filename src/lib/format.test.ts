import { describe, expect, it } from "vitest";
import { formatDate, formatPaiseInr, rupeesToPaise } from "./format";

describe("money and calendar formatting", () => {
  it.each([["1", "100"], ["1.01", "101"], ["999.99", "99999"], ["999999999999.99", "99999999999999"]])("converts %s rupees to exact paise", (rupees, paise) => {
    expect(rupeesToPaise(rupees)).toBe(paise);
  });

  it("rejects invalid precision and formats paise without floating point", () => {
    expect(rupeesToPaise("1.001")).toBeNull();
    expect(formatPaiseInr("100001")).toBe("₹1,000.01");
  });

  it("preserves date-only calendar values", () => {
    expect(formatDate("2026-01-31")).toContain("31");
  });
});
