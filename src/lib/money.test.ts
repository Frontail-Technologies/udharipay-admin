import { describe, expect, it } from "vitest";
import { formatPaise, paiseToRupees, rupeesToPaise } from "./money";

describe("money helpers", () => {
  it("keeps paise as precision-safe decimal strings", () => {
    expect(paiseToRupees("900719925474099312")).toBe("9007199254740993.12");
    expect(rupeesToPaise("9007199254740993.12")).toBe("900719925474099312");
    expect(formatPaise("123450")).toContain("1,234.50");
  });
});
