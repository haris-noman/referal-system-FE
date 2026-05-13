import { useEffect, useMemo, useState } from "react";
import {
  Files,
  FileCheck2,
  Clock,
  HardDrive,
  Upload,
  Search,
  X,
  Filter as FilterIcon,
  ChevronDown,
  ArrowUpDown,
  MoreHorizontal,
  Eye,
  Download,
  Trash2,
  CheckCircle2,
  XCircle,
  Loader2,
  FileText,
  Image as ImageIcon,
  FileType2,
  AlertCircle,
} from "lucide-react";
import { cn } from "../../lib/utils";
import { Popover, PopoverItem } from "../../components/ui/Popover";
import Modal from "../../components/ui/Modal";
import { exportCsv } from "../../lib/exportCsv";
import UploadDocumentModal from "./components/UploadDocumentModal";
import RejectDocumentModal from "./components/RejectDocumentModal";
import ViewDocumentModal from "./components/ViewDocumentModal";
import ActivityLog from "./components/ActivityLog";
import {
  CATEGORY_LABEL,
  INITIAL_ACTIVITY,
  INITIAL_DOCUMENTS,
  STATUS_LABEL,
  STATUS_TONE,
  TYPE_LABEL,
  TYPE_TONE,
  detectType,
  formatBytes,
  type ActivityEntry,
  type DocumentCategory,
  type DocumentItem,
  type DocumentStatus,
  type DocumentType,
} from "./documentsData";

const TYPE_ICON: Record<DocumentType, React.ComponentType<{ className?: string; strokeWidth?: number }>> = {
  pdf: FileText,
  docx: FileType2,
  image: ImageIcon,
};

const STORAGE_QUOTA = 1024 * 1024 * 1024 * 5; // 5GB

type StatusFilter = "all" | DocumentStatus;
type CategoryFilter = "all" | DocumentCategory;
type DateFilter = "all" | "7d" | "30d" | "90d";
type SortValue =
  | "uploaded:desc"
  | "uploaded:asc"
  | "name:asc"
  | "name:desc"
  | "size:desc"
  | "size:asc";

const STATUS_FILTERS: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "All Statuses" },
  { value: "approved", label: "Approved" },
  { value: "pending", label: "Pending" },
  { value: "rejected", label: "Rejected" },
];

const DATE_FILTERS: { value: DateFilter; label: string }[] = [
  { value: "all", label: "Any Date" },
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
  { value: "90d", label: "Last 90 days" },
];

const SORT_OPTIONS: { value: SortValue; label: string }[] = [
  { value: "uploaded:desc", label: "Newest first" },
  { value: "uploaded:asc", label: "Oldest first" },
  { value: "name:asc", label: "Name (A–Z)" },
  { value: "name:desc", label: "Name (Z–A)" },
  { value: "size:desc", label: "Size (large to small)" },
  { value: "size:asc", label: "Size (small to large)" },
];

const matchesDate = (iso: string, filter: DateFilter) => {
  if (filter === "all") return true;
  const d = new Date(iso);
  const now = new Date();
  const days = filter === "7d" ? 7 : filter === "30d" ? 30 : 90;
  const cutoff = new Date(now);
  cutoff.setDate(cutoff.getDate() - days);
  return d >= cutoff;
};

const formatDate = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const StatCard = ({
  label,
  value,
  icon: Icon,
  tone,
  hint,
  bar,
}: {
  label: string;
  value: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  tone: string;
  hint?: string;
  bar?: number;
}) => (
  <div className="bg-white border border-line rounded-card p-5">
    <div className="flex items-start justify-between">
      <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted">
        {label}
      </p>
      <span
        className={cn(
          "w-8 h-8 rounded-[8px] flex items-center justify-center",
          tone,
        )}
      >
        <Icon className="w-4 h-4" strokeWidth={1.75} />
      </span>
    </div>
    <h3 className="mt-3 text-[24px] font-bold text-ink tracking-tight">
      {value}
    </h3>
    {bar !== undefined && (
      <div className="mt-3 h-1.5 rounded-full bg-line overflow-hidden">
        <div
          className="h-full bg-ink rounded-full transition-all"
          style={{ width: `${Math.min(100, Math.max(0, bar))}%` }}
        />
      </div>
    )}
    {hint && <p className="mt-2 text-[11px] text-muted">{hint}</p>}
  </div>
);

const DocumentsPage = () => {
  const [documents, setDocuments] = useState<DocumentItem[]>(INITIAL_DOCUMENTS);
  const [activity, setActivity] = useState<ActivityEntry[]>(INITIAL_ACTIVITY);
  const [loading, setLoading] = useState(true);

  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("all");
  const [dateFilter, setDateFilter] = useState<DateFilter>("all");
  const [sortValue, setSortValue] = useState<SortValue>("uploaded:desc");
  const [query, setQuery] = useState("");

  const [statusOpen, setStatusOpen] = useState(false);
  const [dateOpen, setDateOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [rowMenuId, setRowMenuId] = useState<string | null>(null);

  const [uploadOpen, setUploadOpen] = useState(false);
  const [viewing, setViewing] = useState<DocumentItem | null>(null);
  const [rejectTarget, setRejectTarget] = useState<DocumentItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<DocumentItem | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 350);
    return () => clearTimeout(t);
  }, []);

  const addActivity = (entry: Omit<ActivityEntry, "id" | "timestamp">) => {
    setActivity((prev) => [
      {
        ...entry,
        id: `a-${Date.now()}`,
        timestamp: "Just now",
      },
      ...prev,
    ]);
  };

  const closePopovers = () => {
    setStatusOpen(false);
    setDateOpen(false);
    setSortOpen(false);
    setExportOpen(false);
  };

  const visibleDocuments = useMemo(() => {
    const [key, dir] = sortValue.split(":") as [
      "uploaded" | "name" | "size",
      "asc" | "desc",
    ];
    const q = query.trim().toLowerCase();
    const filtered = documents.filter((d) => {
      if (statusFilter !== "all" && d.status !== statusFilter) return false;
      if (categoryFilter !== "all" && d.category !== categoryFilter) return false;
      if (!matchesDate(d.uploadedAt, dateFilter)) return false;
      if (!q) return true;
      return (
        d.name.toLowerCase().includes(q) ||
        d.uploadedBy.toLowerCase().includes(q) ||
        CATEGORY_LABEL[d.category].toLowerCase().includes(q)
      );
    });
    return [...filtered].sort((a, b) => {
      let cmp = 0;
      if (key === "uploaded") {
        cmp =
          new Date(a.uploadedAt).getTime() - new Date(b.uploadedAt).getTime();
      } else if (key === "size") {
        cmp = a.size - b.size;
      } else {
        cmp = a.name.localeCompare(b.name);
      }
      return dir === "asc" ? cmp : -cmp;
    });
  }, [documents, statusFilter, categoryFilter, dateFilter, sortValue, query]);

  const summary = useMemo(() => {
    const total = documents.length;
    const pending = documents.filter((d) => d.status === "pending").length;
    const approved = documents.filter((d) => d.status === "approved").length;
    const storageBytes = documents.reduce((acc, d) => acc + d.size, 0);
    return {
      total,
      pending,
      approved,
      storageBytes,
      storagePct: (storageBytes / STORAGE_QUOTA) * 100,
    };
  }, [documents]);

  const filtersActive =
    statusFilter !== "all" ||
    categoryFilter !== "all" ||
    dateFilter !== "all" ||
    query.trim().length > 0;

  const clearFilters = () => {
    setStatusFilter("all");
    setCategoryFilter("all");
    setDateFilter("all");
    setQuery("");
  };

  const onUploadFile = async (file: File, category: DocumentCategory) => {
    await new Promise((r) => setTimeout(r, 600));
    const type = detectType(file.name);
    if (!type) return;
    const doc: DocumentItem = {
      id: `doc-${Date.now()}`,
      name: file.name,
      type,
      category,
      uploadedBy: "Pedro Alvarez",
      uploaderInitials: "PA",
      uploadedAt: new Date().toISOString(),
      size: file.size,
      status: "pending",
    };
    setDocuments((prev) => [doc, ...prev]);
    addActivity({
      actor: "Pedro",
      action: "uploaded",
      target: file.name,
      tone: "info",
    });
  };

  const approveDocument = (doc: DocumentItem) => {
    setDocuments((prev) =>
      prev.map((d) =>
        d.id === doc.id
          ? { ...d, status: "approved" as DocumentStatus, rejectionReason: undefined }
          : d,
      ),
    );
    addActivity({
      actor: "Admin",
      action: "approved",
      target: doc.name,
      tone: "success",
    });
    setRowMenuId(null);
  };

  const rejectDocument = async (reason: string) => {
    if (!rejectTarget) return;
    setDocuments((prev) =>
      prev.map((d) =>
        d.id === rejectTarget.id
          ? {
              ...d,
              status: "rejected" as DocumentStatus,
              rejectionReason: reason,
            }
          : d,
      ),
    );
    addActivity({
      actor: "Admin",
      action: "rejected",
      target: rejectTarget.name,
      tone: "danger",
    });
    setRejectTarget(null);
  };

  const deleteDocument = () => {
    if (!deleteTarget) return;
    setDocuments((prev) => prev.filter((d) => d.id !== deleteTarget.id));
    addActivity({
      actor: "Pedro",
      action: "deleted",
      target: deleteTarget.name,
      tone: "warning",
    });
    setDeleteTarget(null);
  };

  const downloadDocument = (doc: DocumentItem) => {
    const blob = new Blob(
      [`Dummy download for ${doc.name}\nUploaded by ${doc.uploadedBy}`],
      { type: "text/plain" },
    );
    const url = URL.createObjectURL(blob);
    const a = window.document.createElement("a");
    a.href = url;
    a.download = doc.name.replace(/\.[^.]+$/, ".txt");
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportCsv = () => {
    if (visibleDocuments.length === 0) return;
    const stamp = new Date().toISOString().slice(0, 10);
    exportCsv(
      `documents-${stamp}.csv`,
      [
        { key: "id", header: "ID" },
        { key: "name", header: "Name" },
        { key: "type", header: "Type" },
        { key: "category", header: "Category" },
        { key: "uploadedBy", header: "Uploaded By" },
        { key: "uploadedAt", header: "Uploaded At" },
        { key: "size", header: "Size (bytes)" },
        { key: "status", header: "Status" },
      ],
      visibleDocuments.map((d) => ({
        id: d.id,
        name: d.name,
        type: TYPE_LABEL[d.type],
        category: CATEGORY_LABEL[d.category],
        uploadedBy: d.uploadedBy,
        uploadedAt: d.uploadedAt,
        size: d.size,
        status: STATUS_LABEL[d.status],
      })),
    );
  };

  const statusLabel = STATUS_FILTERS.find((s) => s.value === statusFilter)?.label;
  const dateLabel = DATE_FILTERS.find((d) => d.value === dateFilter)?.label;
  const sortLabel = SORT_OPTIONS.find((s) => s.value === sortValue)?.label;

  const CATEGORY_TABS: { value: CategoryFilter; label: string; count: number }[] =
    useMemo(() => {
      const counts: Record<string, number> = {};
      documents.forEach((d) => {
        counts[d.category] = (counts[d.category] ?? 0) + 1;
      });
      return [
        { value: "all", label: "All", count: documents.length },
        ...(Object.keys(CATEGORY_LABEL) as DocumentCategory[]).map((c) => ({
          value: c,
          label: CATEGORY_LABEL[c],
          count: counts[c] ?? 0,
        })),
      ];
    }, [documents]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-muted" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h2 className="text-[24px] font-bold text-ink tracking-tight">
            Documents
          </h2>
          <p className="text-sm text-muted mt-1">
            Upload, verify, and manage every document in the referral network.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                closePopovers();
                setExportOpen((v) => !v);
              }}
              className="btn-secondary"
            >
              <Download className="w-3.5 h-3.5" strokeWidth={2} />
              Export
              <ChevronDown className="w-3 h-3 text-muted-2" strokeWidth={2} />
            </button>
            <Popover
              open={exportOpen}
              onClose={() => setExportOpen(false)}
              align="right"
            >
              <PopoverItem
                onClick={() => {
                  handleExportCsv();
                  setExportOpen(false);
                }}
              >
                Export CSV
              </PopoverItem>
              <PopoverItem
                onClick={() => {
                  window.print();
                  setExportOpen(false);
                }}
              >
                Export PDF (Print)
              </PopoverItem>
              <PopoverItem
                onClick={() => {
                  const stamp = new Date().toISOString().slice(0, 10);
                  exportCsv(
                    `commission-report-${stamp}.csv`,
                    [
                      { key: "id", header: "ID" },
                      { key: "name", header: "Document" },
                      { key: "uploadedBy", header: "Partner" },
                      { key: "uploadedAt", header: "Date" },
                    ],
                    documents
                      .filter(
                        (d) => d.category === "payment" && d.status === "approved",
                      )
                      .map((d) => ({
                        id: d.id,
                        name: d.name,
                        uploadedBy: d.uploadedBy,
                        uploadedAt: d.uploadedAt,
                      })),
                  );
                  setExportOpen(false);
                }}
              >
                Commission Report
              </PopoverItem>
            </Popover>
          </div>
          <button
            type="button"
            onClick={() => setUploadOpen(true)}
            className="btn-primary"
          >
            <Upload className="w-3.5 h-3.5" strokeWidth={2} />
            Upload Document
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          label="Total Documents"
          value={summary.total.toString()}
          icon={Files}
          tone="bg-line-soft text-ink"
        />
        <StatCard
          label="Pending Verification"
          value={summary.pending.toString()}
          icon={Clock}
          tone={STATUS_TONE.pending}
        />
        <StatCard
          label="Approved Files"
          value={summary.approved.toString()}
          icon={FileCheck2}
          tone={STATUS_TONE.approved}
        />
        <StatCard
          label="Storage Used"
          value={formatBytes(summary.storageBytes)}
          icon={HardDrive}
          tone="bg-(--color-info-bg) text-(--color-info-fg)"
          bar={summary.storagePct}
          hint={`of ${formatBytes(STORAGE_QUOTA)} (${summary.storagePct.toFixed(1)}%)`}
        />
      </div>

      <div className="bg-white border border-line rounded-card p-2">
        <div className="flex gap-1.5 overflow-x-auto">
          {CATEGORY_TABS.map((tab) => {
            const active = categoryFilter === tab.value;
            return (
              <button
                key={tab.value}
                type="button"
                onClick={() => setCategoryFilter(tab.value)}
                className={cn(
                  "inline-flex items-center gap-2 px-3.5 py-2 rounded-[6px] text-[12.5px] font-medium transition-colors whitespace-nowrap",
                  active
                    ? "bg-ink text-white"
                    : "text-muted hover:bg-line-soft hover:text-ink",
                )}
              >
                <span>{tab.label}</span>
                <span
                  className={cn(
                    "min-w-[18px] h-[18px] inline-flex items-center justify-center px-1.5 rounded-full text-[10px] font-semibold",
                    active ? "bg-white/15 text-white" : "bg-line-soft text-muted",
                  )}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="bg-white border border-line rounded-card px-4 py-3 flex flex-col lg:flex-row gap-3 lg:items-center">
        <div className="relative flex-1 min-w-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-2" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search documents, uploader, or category…"
            className="field pl-9 pr-9"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label="Clear search"
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-full text-muted-2 hover:text-ink hover:bg-line-soft transition-colors"
            >
              <X className="w-3.5 h-3.5" strokeWidth={2} />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">
            <FilterIcon className="w-3.5 h-3.5" strokeWidth={2} />
            Filters
          </span>

          <div className="relative">
            <button
              type="button"
              onClick={() => {
                closePopovers();
                setStatusOpen((v) => !v);
              }}
              className={cn(
                "inline-flex items-center gap-1.5 text-[12px] font-medium px-2.5 py-1 rounded-md transition-colors",
                statusFilter !== "all"
                  ? "bg-line-soft text-ink"
                  : "text-ink hover:bg-line-soft",
              )}
            >
              {statusLabel}
              <ChevronDown className="w-3 h-3 text-muted-2" strokeWidth={2} />
            </button>
            <Popover open={statusOpen} onClose={() => setStatusOpen(false)} align="left">
              {STATUS_FILTERS.map((opt) => (
                <PopoverItem
                  key={opt.value}
                  active={statusFilter === opt.value}
                  onClick={() => {
                    setStatusFilter(opt.value);
                    setStatusOpen(false);
                  }}
                >
                  {opt.label}
                </PopoverItem>
              ))}
            </Popover>
          </div>

          <div className="relative">
            <button
              type="button"
              onClick={() => {
                closePopovers();
                setDateOpen((v) => !v);
              }}
              className={cn(
                "inline-flex items-center gap-1.5 text-[12px] font-medium px-2.5 py-1 rounded-md transition-colors",
                dateFilter !== "all"
                  ? "bg-line-soft text-ink"
                  : "text-ink hover:bg-line-soft",
              )}
            >
              {dateLabel}
              <ChevronDown className="w-3 h-3 text-muted-2" strokeWidth={2} />
            </button>
            <Popover open={dateOpen} onClose={() => setDateOpen(false)} align="left">
              {DATE_FILTERS.map((opt) => (
                <PopoverItem
                  key={opt.value}
                  active={dateFilter === opt.value}
                  onClick={() => {
                    setDateFilter(opt.value);
                    setDateOpen(false);
                  }}
                >
                  {opt.label}
                </PopoverItem>
              ))}
            </Popover>
          </div>

          <div className="relative">
            <button
              type="button"
              onClick={() => {
                closePopovers();
                setSortOpen((v) => !v);
              }}
              className="inline-flex items-center gap-1.5 text-[12px] font-medium text-ink hover:bg-line-soft px-2.5 py-1 rounded-md transition-colors"
            >
              <ArrowUpDown className="w-3 h-3 text-muted-2" strokeWidth={2} />
              {sortLabel}
            </button>
            <Popover open={sortOpen} onClose={() => setSortOpen(false)} align="left">
              {SORT_OPTIONS.map((opt) => (
                <PopoverItem
                  key={opt.value}
                  active={sortValue === opt.value}
                  onClick={() => {
                    setSortValue(opt.value);
                    setSortOpen(false);
                  }}
                >
                  {opt.label}
                </PopoverItem>
              ))}
            </Popover>
          </div>

          {filtersActive && (
            <button
              type="button"
              onClick={clearFilters}
              className="inline-flex items-center gap-1 text-[11px] font-medium text-muted hover:text-ink px-2 py-1 rounded-md transition-colors"
            >
              <X className="w-3 h-3" strokeWidth={2} />
              Clear
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-5 items-start">
        <div className="bg-white border border-line rounded-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-line">
                  <th className="px-6 py-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted">
                    Document
                  </th>
                  <th className="px-6 py-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted">
                    Type
                  </th>
                  <th className="px-6 py-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted">
                    Uploaded By
                  </th>
                  <th className="px-6 py-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted">
                    Date
                  </th>
                  <th className="px-6 py-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted">
                    Status
                  </th>
                  <th className="px-6 py-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {visibleDocuments.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-16">
                      <div className="text-center">
                        <Files
                          className="w-8 h-8 mx-auto text-muted-2"
                          strokeWidth={1.5}
                        />
                        <p className="mt-3 text-sm font-medium text-ink">
                          No documents found
                        </p>
                        <p className="mt-1 text-[12.5px] text-muted">
                          {filtersActive
                            ? "Try clearing filters or adjusting your search."
                            : "Upload your first document to get started."}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  visibleDocuments.map((doc) => {
                    const Icon = TYPE_ICON[doc.type];
                    return (
                      <tr
                        key={doc.id}
                        className="border-b border-line last:border-b-0 hover:bg-line-soft/40 transition-colors"
                      >
                        <td className="px-6 py-3.5">
                          <div className="flex items-center gap-3 min-w-0">
                            <div
                              className={cn(
                                "w-9 h-9 rounded-[8px] flex items-center justify-center shrink-0",
                                TYPE_TONE[doc.type],
                              )}
                            >
                              <Icon className="w-4 h-4" strokeWidth={1.75} />
                            </div>
                            <div className="min-w-0">
                              <p className="text-[13px] font-semibold text-ink truncate max-w-[280px]">
                                {doc.name}
                              </p>
                              <p className="text-[11px] text-muted">
                                {CATEGORY_LABEL[doc.category]} ·{" "}
                                {formatBytes(doc.size)}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-3.5">
                          <span className="text-[12px] font-medium text-muted">
                            {TYPE_LABEL[doc.type]}
                          </span>
                        </td>
                        <td className="px-6 py-3.5">
                          <div className="flex items-center gap-2">
                            <span className="w-7 h-7 rounded-full bg-line-soft text-muted text-[10px] font-bold flex items-center justify-center">
                              {doc.uploaderInitials}
                            </span>
                            <span className="text-[12.5px] text-ink">
                              {doc.uploadedBy}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-3.5">
                          <span className="text-[12px] text-muted">
                            {formatDate(doc.uploadedAt)}
                          </span>
                        </td>
                        <td className="px-6 py-3.5">
                          <span
                            className={cn(
                              "px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider",
                              STATUS_TONE[doc.status],
                            )}
                          >
                            {STATUS_LABEL[doc.status]}
                          </span>
                        </td>
                        <td className="px-6 py-3.5 text-right">
                          <div className="inline-flex items-center justify-end gap-1 relative">
                            {doc.status === "pending" && (
                              <>
                                <button
                                  type="button"
                                  onClick={() => approveDocument(doc)}
                                  className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-semibold text-(--color-success-fg) hover:bg-(--color-success-bg) transition-colors"
                                >
                                  <CheckCircle2
                                    className="w-3.5 h-3.5"
                                    strokeWidth={2}
                                  />
                                  Approve
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setRejectTarget(doc)}
                                  className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-semibold text-(--color-danger-fg) hover:bg-(--color-danger-bg) transition-colors"
                                >
                                  <XCircle
                                    className="w-3.5 h-3.5"
                                    strokeWidth={2}
                                  />
                                  Reject
                                </button>
                              </>
                            )}
                            <button
                              type="button"
                              onClick={() =>
                                setRowMenuId(rowMenuId === doc.id ? null : doc.id)
                              }
                              className="p-1.5 rounded-md text-muted-2 hover:text-ink hover:bg-line-soft transition-colors"
                              aria-label="More actions"
                            >
                              <MoreHorizontal
                                className="w-4 h-4"
                                strokeWidth={2}
                              />
                            </button>
                            <Popover
                              open={rowMenuId === doc.id}
                              onClose={() => setRowMenuId(null)}
                              align="right"
                            >
                              <PopoverItem
                                onClick={() => {
                                  setViewing(doc);
                                  setRowMenuId(null);
                                }}
                              >
                                <span className="inline-flex items-center gap-2">
                                  <Eye className="w-3.5 h-3.5" strokeWidth={2} />
                                  View
                                </span>
                              </PopoverItem>
                              <PopoverItem
                                onClick={() => {
                                  downloadDocument(doc);
                                  setRowMenuId(null);
                                }}
                              >
                                <span className="inline-flex items-center gap-2">
                                  <Download
                                    className="w-3.5 h-3.5"
                                    strokeWidth={2}
                                  />
                                  Download
                                </span>
                              </PopoverItem>
                              <PopoverItem
                                onClick={() => {
                                  setDeleteTarget(doc);
                                  setRowMenuId(null);
                                }}
                              >
                                <span className="inline-flex items-center gap-2 text-red-600">
                                  <Trash2
                                    className="w-3.5 h-3.5"
                                    strokeWidth={2}
                                  />
                                  Delete
                                </span>
                              </PopoverItem>
                            </Popover>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        <ActivityLog entries={activity.slice(0, 8)} />
      </div>

      <UploadDocumentModal
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        onSubmit={onUploadFile}
      />

      <ViewDocumentModal
        document={viewing}
        onClose={() => setViewing(null)}
        onDownload={downloadDocument}
      />

      <RejectDocumentModal
        document={rejectTarget}
        onClose={() => setRejectTarget(null)}
        onConfirm={rejectDocument}
      />

      <Modal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete document?"
        description={deleteTarget?.name}
        icon={AlertCircle}
        iconTone="bg-red-50 text-red-600"
        size="sm"
        footer={
          <>
            <button
              type="button"
              onClick={() => setDeleteTarget(null)}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={deleteDocument}
              className="inline-flex items-center justify-center gap-2 rounded-[6px] px-4 py-2.5 text-[12px] font-semibold uppercase tracking-[0.08em] transition-colors bg-red-600 hover:bg-red-700 text-white"
            >
              <Trash2 className="w-3.5 h-3.5" strokeWidth={2} />
              Delete
            </button>
          </>
        }
      >
        <p className="text-[13px] text-muted">
          This action can't be undone. The file will be permanently removed.
        </p>
      </Modal>
    </div>
  );
};

export default DocumentsPage;
