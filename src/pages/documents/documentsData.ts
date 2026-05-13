import type { ApiDocument } from "../../lib/documentsApi";

export type DocumentStatus = "approved" | "pending" | "rejected";

export type DocumentCategory =
  | "identity_proof"
  | "referral_agreement"
  | "payment_proof"
  | "contracts"
  | "reports";

export type DocumentType = "pdf" | "docx" | "png" | "jpg";

export type DocumentItem = {
  id: number;
  name: string;
  fileUrl: string;
  type: DocumentType;
  category: DocumentCategory;
  uploadedBy: string;
  uploaderInitials: string;
  uploadedAt: string;
  size?: number;
  status: DocumentStatus;
  rejectionReason?: string;
  reviewedBy?: string;
  reviewedAt?: string;
};

export type ActivityEntry = {
  id: string;
  actor: string;
  action: string;
  target?: string;
  timestamp: string;
  tone: "default" | "success" | "warning" | "danger" | "info";
};

export const CATEGORY_LABEL: Record<DocumentCategory, string> = {
  identity_proof: "Identity Proof",
  referral_agreement: "Referral Agreement",
  payment_proof: "Payment Proof",
  contracts: "Contracts",
  reports: "Reports",
};

export const STATUS_LABEL: Record<DocumentStatus, string> = {
  approved: "Approved",
  pending: "Pending",
  rejected: "Rejected",
};

export const STATUS_TONE: Record<DocumentStatus, string> = {
  approved: "bg-(--color-success-bg) text-(--color-success-fg)",
  pending: "bg-(--color-warning-bg) text-(--color-warning-fg)",
  rejected: "bg-(--color-danger-bg) text-(--color-danger-fg)",
};

export const TYPE_LABEL: Record<DocumentType, string> = {
  pdf: "PDF",
  docx: "DOCX",
  png: "PNG",
  jpg: "JPG",
};

export const TYPE_TONE: Record<DocumentType, string> = {
  pdf: "bg-red-50 text-red-600",
  docx: "bg-blue-50 text-blue-600",
  png: "bg-violet-50 text-violet-600",
  jpg: "bg-violet-50 text-violet-600",
};

export type IconKind = "pdf" | "docx" | "image";

export const TYPE_ICON_KIND: Record<DocumentType, IconKind> = {
  pdf: "pdf",
  docx: "docx",
  png: "image",
  jpg: "image",
};

export const ACCEPTED_EXT: Record<DocumentType, string[]> = {
  pdf: [".pdf"],
  docx: [".docx"],
  png: [".png"],
  jpg: [".jpg", ".jpeg"],
};

export const detectType = (filename: string): DocumentType | null => {
  const ext = `.${filename.split(".").pop()?.toLowerCase() ?? ""}`;
  if (ACCEPTED_EXT.pdf.includes(ext)) return "pdf";
  if (ACCEPTED_EXT.docx.includes(ext)) return "docx";
  if (ACCEPTED_EXT.png.includes(ext)) return "png";
  if (ACCEPTED_EXT.jpg.includes(ext)) return "jpg";
  return null;
};

export const formatBytes = (bytes?: number) => {
  if (bytes === undefined || bytes === null || Number.isNaN(bytes)) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024)
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
};

const initialsFrom = (name: string): string =>
  name
    ?.split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("") || "—";

const fileTypeToType = (
  fileType: ApiDocument["file_type"],
): DocumentType => {
  switch (fileType) {
    case "PDF":
      return "pdf";
    case "DOCX":
      return "docx";
    case "PNG":
      return "png";
    case "JPG":
      return "jpg";
  }
};

/**
 * Maps the raw API document into the UI-friendly shape used throughout the page.
 * Keeping the conversion at the boundary lets the rest of the codebase stay
 * camelCase and lets us add UI-only fields (initials, icon kind) without
 * polluting the network types.
 */
export const apiToDocument = (doc: ApiDocument): DocumentItem => ({
  id: doc.id,
  name: doc.name,
  fileUrl: doc.file,
  type: fileTypeToType(doc.file_type),
  category: doc.category,
  uploadedBy: doc.uploaded_by_name || "Unknown",
  uploaderInitials: initialsFrom(doc.uploaded_by_name || "Unknown"),
  uploadedAt: doc.uploaded_at,
  status: doc.status,
  rejectionReason: doc.rejection_reason || undefined,
  reviewedBy: doc.reviewed_by_name || undefined,
  reviewedAt: doc.reviewed_at || undefined,
});
