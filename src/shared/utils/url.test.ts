import { describe, expect, it } from "vitest";
import { readCursorState, writeCursorState } from "./url";

describe("cursor URL state", () => {
  it("round trips filters and removes cleared cursors", () => {
    const initial = new URLSearchParams("cursor=next-1&search=amit&category=Wholesale");
    expect(readCursorState(initial)).toEqual({ cursor: "next-1", search: "amit", category: "Wholesale" });
    expect(writeCursorState(initial, { cursor: undefined, status: "active", category: "Retail" })).toBe("search=amit&category=Retail&status=active");
  });
});
