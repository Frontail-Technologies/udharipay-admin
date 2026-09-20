import { describe, expect, it, vi } from "vitest";
import { ApiError } from "@/api/http/errors";
import { applyApiFormErrors } from "./formErrors";

describe("form error mapping", () => {
  it("maps backend field errors into react-hook-form", () => {
    const setError = vi.fn();
    const result = applyApiFormErrors(new ApiError({ message: "Invalid", details: { fieldErrors: { email: ["Already used"] } } }), setError);
    expect(result.applied).toBe(true);
    expect(setError).toHaveBeenCalledWith("email", { type: "server", message: "Already used" });
  });
});
