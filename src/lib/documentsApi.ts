import api from "./api";

export type ApiDocumentCategory =
  | "identity_proof"
  | "referral_agreement"
  | "payment_proof"
  | "contracts"
  | "reports";

export type ApiDocumentStatus = "pending" | "approved" | "rejected";

export type ApiDocumentFileType = "PDF" | "DOCX" | "PNG" | "JPG";

export type ApiDocument = {
  id: number;
  name: string;
  file: string;
  file_type: ApiDocumentFileType;
  category: ApiDocumentCategory;
  status: ApiDocumentStatus;
  rejection_reason: string;
  uploaded_at: string;
  uploaded_by: number;
  uploaded_by_name: string;
  reviewed_by: number | null;
  reviewed_by_name: string;
  reviewed_at: string | null;
};

export type ApiDocumentSummary = {
  total_documents: number;
  pending_verification: number;
  approved_files: number;
  rejected_files: number;
  storage_used_mb: number;
};

export type DocumentListParams = {
  status?: ApiDocumentStatus;
  category?: ApiDocumentCategory;
  search?: string;
  date_from?: string;
  date_to?: string;
};

export type DocumentUploadPayload = {
  name: string;
  file: File;
  category: ApiDocumentCategory;
};

/**
 * Unwraps both paginated (`{ results: [] }`) and plain-array responses so the
 * UI can iterate without caring which shape the backend returns.
 */
const unwrapList = <T>(data: unknown): T[] => {
  if (Array.isArray(data)) return data as T[];
  if (data && typeof data === "object" && "results" in data) {
    return ((data as { results: T[] }).results ?? []) as T[];
  }
  return [];
};

/**
 * Triggers a browser download from a Blob without leaking the object URL.
 */
const downloadBlob = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const a = window.document.createElement("a");
  a.href = url;
  a.download = filename;
  a.style.display = "none";
  window.document.body.appendChild(a);
  a.click();
  window.document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export const documentsApi = {
  list: async (params: DocumentListParams = {}): Promise<ApiDocument[]> => {
    const clean = Object.fromEntries(
      Object.entries(params).filter(([, v]) => v !== undefined && v !== ""),
    );
    const res = await api.get("/documents/", { params: clean });
    return unwrapList<ApiDocument>(res.data);
  },

  summary: async (): Promise<ApiDocumentSummary> => {
    const res = await api.get<ApiDocumentSummary>("/documents/summary/");
    return res.data;
  },

  upload: async (payload: DocumentUploadPayload): Promise<ApiDocument> => {
    const fd = new FormData();
    fd.append("name", payload.name);
    fd.append("file", payload.file);
    fd.append("category", payload.category);
    const res = await api.post<ApiDocument>("/documents/", fd, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  },

  approve: async (id: number): Promise<ApiDocument> => {
    const res = await api.post<ApiDocument>(`/documents/${id}/approve/`);
    return res.data;
  },

  reject: async (id: number, reason: string): Promise<ApiDocument> => {
    const fd = new FormData();
    fd.append("rejection_reason", reason);
    const res = await api.post<ApiDocument>(`/documents/${id}/reject/`, fd);
    return res.data;
  },

  remove: async (id: number): Promise<void> => {
    await api.delete(`/documents/${id}/`);
  },

  download: async (id: number, filename: string): Promise<void> => {
    const res = await api.get(`/documents/${id}/download/`, {
      responseType: "blob",
    });
    downloadBlob(res.data as Blob, filename);
  },

  exportCsv: async (): Promise<void> => {
    const res = await api.get("/documents/export/csv/", {
      responseType: "blob",
    });
    const stamp = new Date().toISOString().slice(0, 10);
    downloadBlob(res.data as Blob, `documents-${stamp}.csv`);
  },
};

/**
 * Extracts a user-friendly error message out of an axios error response.
 * Falls back to a sensible default for transport errors / non-DRF responses.
 */
export const extractApiError = (err: unknown, fallback: string): string => {
  const e = err as {
    response?: { data?: Record<string, unknown> | string };
    message?: string;
  };
  const data = e?.response?.data;
  if (typeof data === "string") return data;
  if (data && typeof data === "object") {
    if (typeof data.detail === "string") return data.detail;
    if (typeof data.error === "string") return data.error;
    const firstField = Object.entries(data).find(([, v]) => v != null)?.[1];
    if (Array.isArray(firstField) && typeof firstField[0] === "string")
      return firstField[0];
    if (typeof firstField === "string") return firstField;
  }
  return e?.message ?? fallback;
};
