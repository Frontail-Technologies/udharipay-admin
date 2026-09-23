import type { ReactNode } from "react";
import fs from "node:fs";
import path from "node:path";
import { act, renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { KycDocument, KycReviewDetail } from "@/api/generated/contracts/kyc";
import type { LocalKycFile } from "@/features/kyc/utils/files";
import { kycReview, kycSummary } from "@/test/fixtures/kyc";
import { kycKeys, KycUploadBatchError, useKycReview, useKycReviews, useSaveAndSubmitKyc, useSubjectKyc, useViewKycDocument } from "./useKyc";

const api = vi.hoisted(() => ({ approveKycReview: vi.fn(), confirmKycDocument: vi.fn(), createCustomerKyc: vi.fn(), createEmployeeKyc: vi.fn(), createKycUploadUrl: vi.fn(), createKycViewUrl: vi.fn(), createMerchantKyc: vi.fn(), getCustomerKyc: vi.fn(), getEmployeeKyc: vi.fn(), getKycReview: vi.fn(), getMerchantKyc: vi.fn(), listKycReviews: vi.fn(), rejectKycReview: vi.fn(), requestResubmissionKycReview: vi.fn(), submitKycReview: vi.fn() }));
vi.mock("@/api/generated/kyc", () => api);
vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

function setup() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
  const wrapper = ({ children }: { children: ReactNode }) => <QueryClientProvider client={client}>{children}</QueryClientProvider>;
  return { client, wrapper };
}

function localFiles() {
  return (["pan", "business_registration", "shop_photo"] as const).map((documentType, index): LocalKycFile => ({ id: `local-${index}`, documentType, file: new File([`file-${index}`], `${documentType}.pdf`, { type: "application/pdf" }), previewUrl: null, status: "selected", error: null, confirmedDocument: null }));
}

beforeEach(() => {
  vi.clearAllMocks();
  api.listKycReviews.mockResolvedValue({ data: { items: [kycSummary], pagination: { nextCursor: "next-kyc" } } });
  api.getKycReview.mockResolvedValue({ data: kycReview });
  api.getMerchantKyc.mockResolvedValue({ data: kycReview });
  api.getCustomerKyc.mockResolvedValue({ data: { ...kycReview, subject: { ...kycReview.subject, type: "customer" } } });
  api.getEmployeeKyc.mockResolvedValue({ data: { ...kycReview, subject: { ...kycReview.subject, type: "employee" } } });
  api.createMerchantKyc.mockResolvedValue({ data: kycReview });
  api.createKycUploadUrl.mockImplementation((_reviewId: string, input: { filename: string; documentType: string; mimeType: string; sizeBytes: number }) => Promise.resolve({ data: { document: { id: `doc-${input.filename}`, reviewId: kycReview.id, documentType: input.documentType, maskedReference: null, originalFilename: input.filename, mimeType: input.mimeType, sizeBytes: input.sizeBytes, uploadedByUserId: null, status: "pending", confirmedAt: null, createdAt: kycReview.createdAt, updatedAt: kycReview.updatedAt }, upload: { url: `https://private-upload.test/${input.filename}`, method: "PUT", headers: { "content-type": input.mimeType }, expiresInSeconds: 300 } } }));
  api.confirmKycDocument.mockImplementation((documentId: string) => Promise.resolve({ data: { id: documentId, reviewId: kycReview.id, documentType: "pan", maskedReference: null, originalFilename: `${documentId}.pdf`, mimeType: "application/pdf", sizeBytes: 6, uploadedByUserId: null, status: "uploaded", confirmedAt: kycReview.createdAt, createdAt: kycReview.createdAt, updatedAt: kycReview.updatedAt } satisfies KycDocument }));
  api.submitKycReview.mockResolvedValue({ data: { ...kycReview, status: "in_review" } });
  api.createKycViewUrl.mockResolvedValue({ data: { url: "https://private-view.test/document", expiresInSeconds: 300 } });
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true }));
});

afterEach(() => vi.unstubAllGlobals());

describe("KYC API hooks", () => {
  it("removes fixtures, storage identifiers and unrelated APIs from real KYC paths", () => {
    const files = ["src/app/(admin)/kyc/page.tsx", "src/app/(admin)/kyc/[reviewId]/page.tsx", ...fs.readdirSync("src/features/kyc/components").filter((name) => name.endsWith(".tsx") && !name.endsWith(".test.tsx")).map((name) => path.join("src/features/kyc/components", name))];
    const source = files.map((file) => fs.readFileSync(file, "utf8")).join("\n");
    expect(source).not.toMatch(/useAdminEntities|data\/admin|storageKey|bucket|aws|document\.url|api\/generated\/(payments|mandates|collections|reports|billing)/i);
  });

  it("loads one filtered cursor page and one detail request", async () => {
    const { wrapper } = setup();
    const params = { limit: 25, cursor: "cursor", status: "in_review" as const, subjectType: "merchant" as const, search: "Amit", submittedFrom: "2026-09-01", submittedTo: "2026-09-30" };
    const list = renderHook(() => useKycReviews(params), { wrapper });
    await waitFor(() => expect(list.result.current.isSuccess).toBe(true));
    expect(api.listKycReviews).toHaveBeenCalledWith(params, { signal: expect.any(AbortSignal) });
    const detail = renderHook(() => useKycReview(kycReview.id), { wrapper });
    await waitFor(() => expect(detail.result.current.isSuccess).toBe(true));
    expect(api.getKycReview).toHaveBeenCalledOnce();
  });

  it.each(["merchant", "customer", "employee"] as const)("uses the generated %s subject endpoint", async (subjectType) => {
    const { wrapper } = setup();
    const result = renderHook(() => useSubjectKyc(subjectType, kycReview.subject.id), { wrapper });
    await waitFor(() => expect(result.result.current.isSuccess).toBe(true));
    const request = subjectType === "merchant" ? api.getMerchantKyc : subjectType === "customer" ? api.getCustomerKyc : api.getEmployeeKyc;
    expect(request).toHaveBeenCalledWith(kycReview.subject.id, { signal: expect.any(AbortSignal) });
  });

  it("uploads multiple files from one action through signed PUT and confirmation", async () => {
    const { wrapper } = setup();
    let files = localFiles();
    const onFileChange = (id: string, patch: Partial<LocalKycFile>) => { files = files.map((item) => item.id === id ? { ...item, ...patch } : item); };
    const hook = renderHook(() => useSaveAndSubmitKyc("merchant", kycReview.subject.id), { wrapper });
    await act(() => hook.result.current.mutateAsync({ review: null, files, onFileChange, onProgress: vi.fn() }));
    expect(api.createMerchantKyc).toHaveBeenCalledOnce();
    expect(api.createKycUploadUrl).toHaveBeenCalledTimes(3);
    expect(fetch).toHaveBeenCalledTimes(3);
    expect(fetch).toHaveBeenCalledWith(expect.stringContaining("private-upload.test"), expect.objectContaining({ method: "PUT", credentials: "omit" }));
    expect(api.confirmKycDocument).toHaveBeenCalledTimes(3);
    expect(api.submitKycReview).toHaveBeenCalledWith(kycReview.id);
  });

  it("preserves confirmations after partial failure and retries only the failed upload session", async () => {
    const { client, wrapper } = setup();
    vi.mocked(fetch).mockReset().mockResolvedValueOnce({ ok: true } as Response).mockResolvedValueOnce({ ok: true } as Response).mockResolvedValueOnce({ ok: false } as Response).mockResolvedValueOnce({ ok: true } as Response);
    let files = localFiles();
    const onFileChange = (id: string, patch: Partial<LocalKycFile>) => { files = files.map((item) => item.id === id ? { ...item, ...patch } : item); };
    const hook = renderHook(() => useSaveAndSubmitKyc("merchant", kycReview.subject.id), { wrapper });
    await expect(act(() => hook.result.current.mutateAsync({ review: null, files, onFileChange, onProgress: vi.fn() }))).rejects.toBeInstanceOf(KycUploadBatchError);
    expect(files.filter((item) => item.status === "confirmed")).toHaveLength(2);
    expect(api.submitKycReview).not.toHaveBeenCalled();
    const cached = client.getQueryData<{ data: KycReviewDetail }>(kycKeys.subject("merchant", kycReview.subject.id));
    await act(() => hook.result.current.mutateAsync({ review: cached?.data ?? null, files, onFileChange, onProgress: vi.fn() }));
    expect(api.createKycUploadUrl).toHaveBeenCalledTimes(3);
    expect(fetch).toHaveBeenCalledTimes(4);
    expect(api.confirmKycDocument).toHaveBeenCalledTimes(3);
    expect(api.submitKycReview).toHaveBeenCalledOnce();
  });

  it("requests a fresh authorized view URL only on the view action", async () => {
    const open = vi.spyOn(window, "open").mockImplementation(() => null);
    const { wrapper } = setup();
    const hook = renderHook(() => useViewKycDocument(), { wrapper });
    expect(api.createKycViewUrl).not.toHaveBeenCalled();
    await act(() => hook.result.current.mutateAsync("document-id"));
    expect(api.createKycViewUrl).toHaveBeenCalledWith("document-id");
    expect(open).toHaveBeenCalledWith("https://private-view.test/document", "_blank", "noopener,noreferrer");
    open.mockRestore();
  });
});
