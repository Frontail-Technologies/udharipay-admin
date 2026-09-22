import { describe, expect, it } from "vitest";
import { readCursorState, writeCursorState } from "./url";

describe("cursor URL state", () => {
  it("round trips filters and removes cleared cursors", () => {
    const initial = new URLSearchParams("cursor=next-1&search=amit&category=Wholesale&merchantId=merchant-1");
    expect(readCursorState(initial)).toEqual({ cursor: "next-1", search: "amit", category: "Wholesale", merchantId: "merchant-1" });
    expect(writeCursorState(initial, { cursor: undefined, status: "active", category: "Retail", merchantId: "merchant-2" })).toBe("search=amit&category=Retail&merchantId=merchant-2&status=active");
  });
});
