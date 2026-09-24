import type { KycDocument, KycDocumentType, CreateKycUploadUrl201DataUpload, CreateKycUploadUrlBodyMimeType } from "@/api/generated/contracts/kyc";

export const acceptedKycMimeTypes = ["application/pdf", "image/jpeg", "image/png"] as const;
export const maxKycFileSizeBytes = 10 * 1024 * 1024;

export type LocalKycFile = {
  id: string;
  documentType: KycDocumentType;
  file: File;
  previewUrl: string | null;
  status: "selected" | "uploading" | "confirming" | "confirmed" | "error";
  error: string | null;
  confirmedDocument: KycDocument | null;
};

export type KycUploadSession = { documentId: string; upload: CreateKycUploadUrl201DataUpload };

export function validateKycFile(file: File) {
  if (!acceptedKycMimeTypes.includes(file.type as CreateKycUploadUrlBodyMimeType)) return "Use a PDF, JPEG or PNG file";
  if (file.size > maxKycFileSizeBytes) return "File must be 10 MiB or smaller";
  if (file.size < 1) return "File is empty";
  return null;
}

export function isAcceptedKycMimeType(value: string): value is CreateKycUploadUrlBodyMimeType {
  return acceptedKycMimeTypes.includes(value as CreateKycUploadUrlBodyMimeType);
}

export function buildUploadBody(session: KycUploadSession, file: File): BodyInit {
  if (session.upload.method !== "POST") return file;
  const form = new FormData();
  for (const [key, value] of Object.entries(session.upload.fields ?? {})) form.append(key, value);
  form.append("file", file);
  return form;
}

export async function putPrivateDocument(session: KycUploadSession, file: File) {
  const response = await fetch(session.upload.url, { method: session.upload.method, headers: session.upload.headers, body: buildUploadBody(session, file), credentials: "omit" });
  if (!response.ok) throw new Error("Private document upload failed");
}

export async function mapWithConcurrency<T>(items: T[], limit: number, task: (item: T) => Promise<void>) {
  let index = 0;
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (index < items.length) {
      const item = items[index];
      index += 1;
      await task(item);
    }
  });
  await Promise.all(workers);
}
