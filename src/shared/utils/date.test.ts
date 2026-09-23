import { describe, expect, it } from "vitest";
import { formatIndiaDateFromTimestamp, formatTimestamp } from "./date";

describe("formatTimestamp", () => {
  it("renders a real ISO timestamp instead of Invalid Date", () => {
    const result = formatTimestamp("2026-09-22T08:30:00.000Z");
    expect(result).not.toContain("Invalid Date");
    expect(result).toContain("2026");
  });

  it("renders a placeholder for a missing timestamp", () => {
    expect(formatTimestamp(null)).toBe("Not available");
    expect(formatTimestamp(undefined)).toBe("Not available");
  });
});

describe("formatIndiaDateFromTimestamp", () => {
  it("renders a real ISO timestamp instead of Invalid Date", () => {
    const result = formatIndiaDateFromTimestamp("2026-09-22T08:30:00.000Z");
    expect(result).not.toContain("Invalid Date");
    expect(result).toContain("2026");
  });
});
