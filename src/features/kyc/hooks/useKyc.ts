"use client";

import { useDeferredValue, useMemo, useRef } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { KycSubjectType, type KycSubjectType as KycSubjectTypeValue } from "@/api/generated/common";
import { approveKycReview, confirmKycDocument, createCustomerKyc, createEmployeeKyc, createKycUploadUrl, createKycViewUrl, createMerchantKyc, getCustomerKyc, getEmployeeKyc, getKycReview, getMerchantKyc, listKycReviews, rejectKycReview, requestResubmissionKycReview, submitKycReview } from "@/api/generated/kyc";
import { KycStatus, type CreateKycUploadUrlBody, type KycReviewDetail, type ListKycReviewsParams, type RejectKycReviewBody, type RequestResubmissionKycReviewBody } from "@/api/generated/contracts/kyc";
import { normalizeApiError } from "@/api/http/errors";
import { isAcceptedKycMimeType, mapWithConcurrency, putPrivateDocument, type KycUploadSession, type LocalKycFile } from "@/features/kyc/utils/files";
import { readCursorState, writeCursorState, type CursorState } from "@/shared/utils/url";

const PAGE_SIZE = 25;

export const kycKeys = {
  all: ["kyc"] as const,
  lists: () => [...kycKeys.all, "list"] as const,
  list: (params: ListKycReviewsParams) => [...kycKeys.lists(), params] as const,
  details: () => [...kycKeys.all, "detail"] as const,
  detail: (reviewId: string) => [...kycKeys.details(), reviewId] as const,
  subjects: () => [...kycKeys.all, "subject"] as const,
  subject: (subjectType: KycSubjectTypeValue, subjectId: string) => [...kycKeys.subjects(), subjectType, subjectId] as const,
};

export function useKycReviews(params: ListKycReviewsParams) {
  return useQuery({ queryKey: kycKeys.list(params), queryFn: ({ signal }) => listKycReviews(params, { signal }) });
}

export function useKycReview(reviewId: string) {
  return useQuery({ queryKey: kycKeys.detail(reviewId), queryFn: ({ signal }) => getKycReview(reviewId, { signal }) });
}

export function useSubjectKyc(subjectType: KycSubjectTypeValue, subjectId: string) {
  return useQuery({ queryKey: kycKeys.subject(subjectType, subjectId), queryFn: ({ signal }) => getSubjectKyc(subjectType, subjectId, signal), retry: false });
}

export function useKycDirectory() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const state = readCursorState(new URLSearchParams(searchParams.toString()));
  const deferredSearch = useDeferredValue(state.search ?? "");
  const status = Object.values(KycStatus).find((value) => value === state.status);
  const subjectType = Object.values(KycSubjectType).find((value) => value === state.subjectType);
  const params = useMemo<ListKycReviewsParams>(() => ({ limit: PAGE_SIZE, cursor: state.kycCursor, search: deferredSearch || undefined, status, subjectType, submittedFrom: state.submittedFrom, submittedTo: state.submittedTo }), [deferredSearch, state.kycCursor, state.submittedFrom, state.submittedTo, status, subjectType]);
  const query = useKycReviews(params);
  const navigate = (patch: CursorState, push = false) => { const queryString = writeCursorState(new URLSearchParams(searchParams.toString()), patch); const target = queryString ? `${pathname}?${queryString}` : pathname; if (push) router.push(target, { scroll: false }); else router.replace(target, { scroll: false }); };
  const setFilters = (patch: CursorState) => navigate({ ...patch, kycCursor: undefined });
  return { query, reviews: query.data?.data.items ?? [], nextCursor: query.data?.data.pagination.nextCursor ?? null, hasPrevious: Boolean(state.kycCursor), state, status, subjectType, setFilters, goPrevious: router.back, goNext: (kycCursor: string) => navigate({ kycCursor }, true) };
}

export function useSaveAndSubmitKyc(subjectType: KycSubjectTypeValue, subjectId: string) {
  const queryClient = useQueryClient();
  const sessions = useRef(new Map<string, KycUploadSession>());
  return useMutation({
    mutationFn: async ({ review, files, onFileChange, onProgress }: { review: KycReviewDetail | null; files: LocalKycFile[]; onFileChange: (id: string, patch: Partial<LocalKycFile>) => void; onProgress: (message: string) => void }) => {
      let activeReview = review;
      if (!activeReview) {
        const created = await createSubjectKyc(subjectType, subjectId);
        activeReview = created.data;
        queryClient.setQueryData(kycKeys.subject(subjectType, subjectId), created);
      }
      const pending = files.filter((item) => !item.confirmedDocument);
      const failed: string[] = [];
      let completed = 0;
      await mapWithConcurrency(pending, 3, async (item) => {
        try {
          onFileChange(item.id, { status: "uploading", error: null });
          onProgress(`Uploading ${completed + 1} of ${pending.length}`);
          let session = sessions.current.get(item.id);
          if (!session) {
            if (!isAcceptedKycMimeType(item.file.type)) throw new Error("Unsupported file type");
            const input: CreateKycUploadUrlBody = { documentType: item.documentType, filename: item.file.name, mimeType: item.file.type, sizeBytes: item.file.size };
            const response = await createKycUploadUrl(activeReview.id, input);
            session = { documentId: response.data.document.id, upload: response.data.upload };
            sessions.current.set(item.id, session);
          }
          await putPrivateDocument(session, item.file);
          onFileChange(item.id, { status: "confirming" });
          onProgress("Confirming documents");
          const confirmed = await confirmKycDocument(session.documentId);
          sessions.current.delete(item.id);
          completed += 1;
          onFileChange(item.id, { status: "confirmed", confirmedDocument: confirmed.data, error: null });
        } catch (error) {
          const message = error instanceof Error && error.message === "Private document upload failed" ? error.message : normalizeApiError(error).message;
          failed.push(item.id);
          onFileChange(item.id, { status: "error", error: message });
        }
      });
      if (failed.length) throw new KycUploadBatchError(failed);
      onProgress("Submitting review");
      return submitKycReview(activeReview.id);
    },
    onSuccess: async (response) => {
      queryClient.setQueryData(kycKeys.detail(response.data.id), response);
      queryClient.setQueryData(kycKeys.subject(subjectType, subjectId), response);
      await queryClient.invalidateQueries({ queryKey: kycKeys.lists() });
      toast.success("KYC review submitted");
    },
  });
}

export function useApproveKyc() {
  return useKycDecision((reviewId) => approveKycReview(reviewId), "KYC review approved");
}

export function useRejectKyc() {
  return useKycDecision((reviewId, input: RejectKycReviewBody) => rejectKycReview(reviewId, input), "KYC review rejected");
}

export function useRequestKycResubmission() {
  return useKycDecision((reviewId, input: RequestResubmissionKycReviewBody) => requestResubmissionKycReview(reviewId, input), "Resubmission requested");
}

export function useViewKycDocument() {
  return useMutation({
    mutationFn: (documentId: string) => createKycViewUrl(documentId),
    onSuccess: (response) => { window.open(response.data.url, "_blank", "noopener,noreferrer"); },
    onError: (error) => toast.error(normalizeApiError(error).message),
  });
}

export class KycUploadBatchError extends Error {
  constructor(readonly failedIds: string[]) { super("Some documents could not be uploaded"); this.name = "KycUploadBatchError"; }
}

function useKycDecision<TInput = undefined>(request: (reviewId: string, input: TInput) => Promise<{ data: KycReviewDetail }>, successMessage: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ reviewId, input }: { reviewId: string; input: TInput }) => request(reviewId, input),
    onSuccess: async (response) => {
      queryClient.setQueryData(kycKeys.detail(response.data.id), response);
      queryClient.setQueryData(kycKeys.subject(response.data.subject.type, response.data.subject.id), response);
      await queryClient.invalidateQueries({ queryKey: kycKeys.lists() });
      toast.success(successMessage);
    },
  });
}

function getSubjectKyc(subjectType: KycSubjectTypeValue, subjectId: string, signal: AbortSignal) {
  if (subjectType === "merchant") return getMerchantKyc(subjectId, { signal });
  if (subjectType === "customer") return getCustomerKyc(subjectId, { signal });
  return getEmployeeKyc(subjectId, { signal });
}

function createSubjectKyc(subjectType: KycSubjectTypeValue, subjectId: string) {
  if (subjectType === "merchant") return createMerchantKyc(subjectId);
  if (subjectType === "customer") return createCustomerKyc(subjectId);
  return createEmployeeKyc(subjectId);
}
