import axios, { AxiosError } from "axios";

export type ApiErrorBody = {
  error?: {
    code?: string;
    message?: string;
    details?: unknown;
  };
};

export class ApiError extends Error {
  readonly code: string;
  readonly status: number | null;
  readonly details: unknown;
  readonly requestId: string | null;

  constructor(input: { message: string; code?: string; status?: number; details?: unknown; requestId?: string | null }) {
    super(input.message);
    this.name = "ApiError";
    this.code = input.code ?? "UNEXPECTED_ERROR";
    this.status = input.status ?? null;
    this.details = input.details;
    this.requestId = input.requestId ?? null;
  }
}

export function normalizeApiError(error: unknown): ApiError {
  if (error instanceof ApiError) return error;
  if (axios.isAxiosError<ApiErrorBody>(error)) {
    const body = error.response?.data?.error;
    return new ApiError({
      message: body?.message ?? transportMessage(error),
      code: body?.code ?? (error.code === "ECONNABORTED" ? "REQUEST_TIMEOUT" : "TRANSPORT_ERROR"),
      status: error.response?.status,
      details: body?.details,
      requestId: error.response?.headers["x-request-id"] ?? null,
    });
  }
  return new ApiError({ message: error instanceof Error ? error.message : "Something went wrong" });
}

function transportMessage(error: AxiosError) {
  if (error.code === "ECONNABORTED") return "The request timed out";
  if (!error.response) return "Unable to reach the server";
  return "The request could not be completed";
}
