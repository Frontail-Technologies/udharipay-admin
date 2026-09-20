import { describe, expect, it } from "vitest";
import { readCursorState, writeCursorState } from "./urlState";

describe("cursor URL state", () => {
  it("round trips filters and removes cleared cursors", () => {
    const initial = new URLSearchParams("cursor=next-1&search=amit");
    expect(readCursorState(initial)).toEqual({ cursor: "next-1", search: "amit" });
    expect(writeCursorState(initial, { cursor: undefined, status: "active" })).toBe("search=amit&status=active");
  });
});
