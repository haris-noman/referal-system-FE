export type DocumentStatus = "approved" | "pending" | "rejected";

export type DocumentCategory =
  | "identity"
  | "agreement"
  | "payment"
  | "contract"
  | "report";

export type DocumentType = "pdf" | "docx" | "image";

export type DocumentItem = {
  id: string;
  name: string;
  type: DocumentType;
  category: DocumentCategory;
  uploadedBy: string;
  uploaderInitials: string;
  uploadedAt: string; // ISO
  size: number; // bytes
  status: DocumentStatus;
  rejectionReason?: string;
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
  identity: "Identity Proof",
  agreement: "Referral Agreement",
  payment: "Payment Proof",
  contract: "Contracts",
  report: "Reports",
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
  image: "Image",
};

export const TYPE_TONE: Record<DocumentType, string> = {
  pdf: "bg-red-50 text-red-600",
  docx: "bg-blue-50 text-blue-600",
  image: "bg-violet-50 text-violet-600",
};

export const ACCEPTED_EXT: Record<DocumentType, string[]> = {
  pdf: [".pdf"],
  docx: [".doc", ".docx"],
  image: [".png", ".jpg", ".jpeg"],
};

export const detectType = (filename: string): DocumentType | null => {
  const ext = `.${filename.split(".").pop()?.toLowerCase() ?? ""}`;
  if (ACCEPTED_EXT.pdf.includes(ext)) return "pdf";
  if (ACCEPTED_EXT.docx.includes(ext)) return "docx";
  if (ACCEPTED_EXT.image.includes(ext)) return "image";
  return null;
};

export const formatBytes = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
};

const today = new Date();
const daysAgo = (n: number) => {
  const d = new Date(today);
  d.setDate(d.getDate() - n);
  return d.toISOString();
};

export const INITIAL_DOCUMENTS: DocumentItem[] = [
  {
    id: "doc-001",
    name: "Passport_Pedro_Alvarez.pdf",
    type: "pdf",
    category: "identity",
    uploadedBy: "Pedro Alvarez",
    uploaderInitials: "PA",
    uploadedAt: daysAgo(0),
    size: 2_344_201,
    status: "approved",
  },
  {
    id: "doc-002",
    name: "Referral_Agreement_Q1.docx",
    type: "docx",
    category: "agreement",
    uploadedBy: "Mia Chen",
    uploaderInitials: "MC",
    uploadedAt: daysAgo(1),
    size: 489_213,
    status: "pending",
  },
  {
    id: "doc-003",
    name: "Bank_Confirmation_Letter.pdf",
    type: "pdf",
    category: "payment",
    uploadedBy: "Pedro Alvarez",
    uploaderInitials: "PA",
    uploadedAt: daysAgo(2),
    size: 812_004,
    status: "pending",
  },
  {
    id: "doc-004",
    name: "Network_Contract_v3.pdf",
    type: "pdf",
    category: "contract",
    uploadedBy: "Admin",
    uploaderInitials: "AD",
    uploadedAt: daysAgo(5),
    size: 3_115_300,
    status: "approved",
  },
  {
    id: "doc-005",
    name: "ID_Selfie.jpg",
    type: "image",
    category: "identity",
    uploadedBy: "Jane Park",
    uploaderInitials: "JP",
    uploadedAt: daysAgo(6),
    size: 1_204_889,
    status: "rejected",
    rejectionReason: "Image is blurry — please upload a clearer photograph.",
  },
  {
    id: "doc-006",
    name: "Quarterly_Performance_Report.pdf",
    type: "pdf",
    category: "report",
    uploadedBy: "Mia Chen",
    uploaderInitials: "MC",
    uploadedAt: daysAgo(8),
    size: 5_980_443,
    status: "approved",
  },
  {
    id: "doc-007",
    name: "Commission_Statement_March.pdf",
    type: "pdf",
    category: "payment",
    uploadedBy: "Admin",
    uploaderInitials: "AD",
    uploadedAt: daysAgo(12),
    size: 1_502_120,
    status: "approved",
  },
  {
    id: "doc-008",
    name: "Partner_Onboarding.docx",
    type: "docx",
    category: "agreement",
    uploadedBy: "Jane Park",
    uploaderInitials: "JP",
    uploadedAt: daysAgo(15),
    size: 287_113,
    status: "pending",
  },
];

export const INITIAL_ACTIVITY: ActivityEntry[] = [
  {
    id: "a-1",
    actor: "Pedro",
    action: "uploaded",
    target: "Passport_Pedro_Alvarez.pdf",
    timestamp: "Just now",
    tone: "info",
  },
  {
    id: "a-2",
    actor: "Admin",
    action: "approved",
    target: "Network_Contract_v3.pdf",
    timestamp: "2 hours ago",
    tone: "success",
  },
  {
    id: "a-3",
    actor: "Admin",
    action: "rejected",
    target: "ID_Selfie.jpg",
    timestamp: "Yesterday",
    tone: "danger",
  },
  {
    id: "a-4",
    actor: "Mia",
    action: "uploaded",
    target: "Quarterly_Performance_Report.pdf",
    timestamp: "Last week",
    tone: "info",
  },
  {
    id: "a-5",
    actor: "Admin",
    action: "approved commission for",
    target: "REF-1142",
    timestamp: "2 weeks ago",
    tone: "success",
  },
];
