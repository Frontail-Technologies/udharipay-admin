import axios, { type AxiosError, type AxiosRequestConfig, type InternalAxiosRequestConfig } from "axios";
import { normalizeApiError } from "./errors";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000";
const refreshPath = "/api/v1/auth/admin/refresh";
const unauthenticatedPaths = ["/api/v1/auth/admin/login", refreshPath];

type RetryConfig = InternalAxiosRequestConfig & { _sessionRetry?: boolean };

export const httpClient = axios.create({
  baseURL: apiBaseUrl,
  timeout: 15_000,
  withCredentials: true,
  headers: { Accept: "application/json" },
});

let refreshPromise: Promise<void> | null = null;

httpClient.interceptors.request.use((config) => {
  config.headers.set("X-Request-ID", createRequestId());
  return config;
});

httpClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    await resolveBlobErrorData(error);
    const config = error.config as RetryConfig | undefined;
    const path = config?.url ?? "";
    const canRefresh = error.response?.status === 401 && config && !config._sessionRetry && !unauthenticatedPaths.some((entry) => path.includes(entry));

    if (!canRefresh) throw normalizeApiError(error);
    config._sessionRetry = true;

    try {
      refreshPromise ??= httpClient.post(refreshPath).then(() => undefined).finally(() => {
        refreshPromise = null;
      });
      await refreshPromise;
      return await httpClient.request(config);
    } catch (refreshError) {
      if (typeof window !== "undefined") window.dispatchEvent(new Event("udharipay:session-expired"));
      throw normalizeApiError(refreshError);
    }
  },
);

export type ApiRequestOptions = AxiosRequestConfig;

export async function apiClient<T>(config: AxiosRequestConfig, options?: ApiRequestOptions): Promise<T> {
  const response = await httpClient.request<T>({ ...config, ...options });
  return response.data;
}

function createRequestId() {
  return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

async function resolveBlobErrorData(error: AxiosError) {
  const data = error.response?.data;
  if (!(data instanceof Blob) || !data.type.includes("json")) return;
  try {
    error.response!.data = JSON.parse(await data.text());
  } catch {
    return;
  }
}
