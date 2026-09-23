import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "@/api/http/errors";
import { SubjectKycSection } from "./SubjectKycSection";

const hooks = vi.hoisted(() => ({ useSubjectKyc: vi.fn(), useSaveAndSubmitKyc: vi.fn(), useViewKycDocument: vi.fn() }));
vi.mock("@/features/kyc/hooks/useKyc", () => hooks);

const mutateAsync = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();
  hooks.useSubjectKyc.mockReturnValue({ isPending: false, isError: true, error: new ApiError({ message: "Not found", status: 404 }) });
  hooks.useSaveAndSubmitKyc.mockReturnValue({ isPending: false, mutateAsync });
  hooks.useViewKycDocument.mockReturnValue({ isPending: false, mutate: vi.fn() });
  vi.stubGlobal("crypto", { randomUUID: vi.fn().mockReturnValue("local-id") });
  vi.stubGlobal("URL", { createObjectURL: vi.fn().mockReturnValue("blob:preview"), revokeObjectURL: vi.fn() });
});

afterEach(() => vi.unstubAllGlobals());

describe("SubjectKycSection", () => {
  it("keeps file selection local with zero remote persistence calls", () => {
    render(<SubjectKycSection subjectType="merchant" subjectId="merchant-id" />);
    fireEvent.change(screen.getByLabelText("Select PAN Card"), { target: { files: [new File(["pan"], "pan.pdf", { type: "application/pdf" })] } });
    expect(screen.getByText("pan.pdf")).toBeInTheDocument();
    expect(mutateAsync).not.toHaveBeenCalled();
  });

  it("replaces and removes local files without creating remote state", () => {
    render(<SubjectKycSection subjectType="merchant" subjectId="merchant-id" />);
    const input = screen.getByLabelText("Select PAN Card");
    fireEvent.change(input, { target: { files: [new File(["a"], "a.pdf", { type: "application/pdf" })] } });
    fireEvent.change(input, { target: { files: [new File(["b"], "b.pdf", { type: "application/pdf" })] } });
    expect(screen.queryByText("a.pdf")).not.toBeInTheDocument();
    expect(screen.getByText("b.pdf")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Remove PAN Card" }));
    expect(screen.queryByText("b.pdf")).not.toBeInTheDocument();
    expect(mutateAsync).not.toHaveBeenCalled();
  });

  it("rejects unsupported MIME and oversized files before Save", () => {
    render(<SubjectKycSection subjectType="merchant" subjectId="merchant-id" />);
    fireEvent.change(screen.getByLabelText("Select PAN Card"), { target: { files: [new File(["text"], "pan.txt", { type: "text/plain" })] } });
    expect(screen.getByText("Use a PDF, JPEG or PNG file")).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("Select Business Registration"), { target: { files: [new File([new Uint8Array(10 * 1024 * 1024 + 1)], "large.pdf", { type: "application/pdf" })] } });
    expect(screen.getByText("File must be 10 MiB or smaller")).toBeInTheDocument();
    expect(mutateAsync).not.toHaveBeenCalled();
  });

  it("sends all selected required documents from one Save and Submit action", () => {
    render(<SubjectKycSection subjectType="merchant" subjectId="merchant-id" />);
    for (const label of ["PAN Card", "Business Registration", "Shop Photo", "Cancelled Cheque"]) fireEvent.change(screen.getByLabelText(`Select ${label}`), { target: { files: [new File([label], `${label}.pdf`, { type: "application/pdf" })] } });
    fireEvent.click(screen.getByRole("button", { name: "Save & Submit" }));
    expect(mutateAsync).toHaveBeenCalledOnce();
    expect(mutateAsync.mock.calls[0][0].files).toHaveLength(4);
  });
});
