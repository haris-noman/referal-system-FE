import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
  RefreshCw,
} from "lucide-react";
import { cn } from "../../lib/utils";
import { Popover, PopoverItem, PortalMenu } from "../../components/ui/Popover";
import Modal from "../../components/ui/Modal";
import UploadDocumentModal from "./components/UploadDocumentModal";
import RejectDocumentModal from "./components/RejectDocumentModal";
import ViewDocumentModal from "./components/ViewDocumentModal";
import ActivityLog from "./components/ActivityLog";
import {
  CATEGORY_LABEL,
  STATUS_LABEL,
  STATUS_TONE,
  TYPE_ICON_KIND,
  TYPE_LABEL,
  TYPE_TONE,
  apiToDocument,
  formatBytes,
  type ActivityEntry,
  type DocumentCategory,
  type DocumentItem,
  type DocumentStatus,
  type IconKind,
} from "./documentsData";
import {
  documentsApi,
  extractApiError,
  type ApiDocumentSummary,
  type DocumentListParams,
} from "../../lib/documentsApi";

const TYPE_ICON: Record<IconKind, React.ComponentType<{ className?: string; strokeWidth?: number }>> = {
  pdf: FileText,
  docx: FileType2,
  image: ImageIcon,
};

const STORAGE_QUOTA_MB = 5 * 1024; // 5GB

type StatusFilter = "all" | DocumentStatus;
type CategoryFilter = "all" | DocumentCategory;
type DateFilter = "all" | "7d" | "30d" | "90d";
type SortValue =
  | "uploaded:desc"
  | "uploaded:asc"
  | "name:asc"
  | "name:desc";

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
];

const dateFromForFilter = (filter: DateFilter): string | undefined => {
  if (filter === "all") return undefined;
  const days = filter === "7d" ? 7 : filter === "30d" ? 30 : 90;
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10);
};

const formatDate = (iso: string) => {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
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

const DocumentRowActions = ({
  doc,
  busy,
  isAdmin,
  onApprove,
  onReject,
  onView,
  onDownload,
  onDelete,
}: {
  doc: DocumentItem;
  busy: boolean;
  isAdmin: boolean;
  onApprove: () => void;
  onReject: () => void;
  onView: () => void;
  onDownload: () => void;
  onDelete: () => void;
}) => {
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  return (
    <div className="inline-flex items-center justify-end gap-1">
      {isAdmin && doc.status === "pending" && (
        <>
          <button
            type="button"
            onClick={onApprove}
            disabled={busy}
            className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-semibold text-(--color-success-fg) hover:bg-(--color-success-bg) transition-colors disabled:opacity-50"
          >
            {busy ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" strokeWidth={2} />
            ) : (
              <CheckCircle2 className="w-3.5 h-3.5" strokeWidth={2} />
            )}
            Approve
          </button>
          <button
            type="button"
            onClick={onReject}
            disabled={busy}
            className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-semibold text-(--color-danger-fg) hover:bg-(--color-danger-bg) transition-colors disabled:opacity-50"
          >
            <XCircle className="w-3.5 h-3.5" strokeWidth={2} />
            Reject
          </button>
        </>
      )}
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="p-1.5 rounded-md text-muted-2 hover:text-ink hover:bg-line-soft transition-colors"
        aria-label="More actions"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <MoreHorizontal className="w-4 h-4" strokeWidth={2} />
      </button>
      <PortalMenu
        open={open}
        onClose={() => setOpen(false)}
        anchorRef={buttonRef}
        align="right"
      >
        <PopoverItem
          onClick={() => {
            setOpen(false);
            onView();
          }}
        >
          <span className="inline-flex items-center gap-2">
            <Eye className="w-3.5 h-3.5" strokeWidth={2} />
            View
          </span>
        </PopoverItem>
        <PopoverItem
          onClick={() => {
            setOpen(false);
            onDownload();
          }}
        >
          <span className="inline-flex items-center gap-2">
            <Download className="w-3.5 h-3.5" strokeWidth={2} />
            Download
          </span>
        </PopoverItem>
        <PopoverItem
          onClick={() => {
            setOpen(false);
            onDelete();
          }}
        >
          <span className="inline-flex items-center gap-2 text-red-600">
            <Trash2 className="w-3.5 h-3.5" strokeWidth={2} />
            Delete
          </span>
        </PopoverItem>
      </PortalMenu>
    </div>
  );
};

const DocumentsPage = () => {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [summary, setSummary] = useState<ApiDocumentSummary | null>(null);
  const [activity, setActivity] = useState<ActivityEntry[]>([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [listError, setListError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionBusyId, setActionBusyId] = useState<number | null>(null);
  const [user, setUser] = useState<{ role?: string } | null>(null);

  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("all");
  const [dateFilter, setDateFilter] = useState<DateFilter>("all");
  const [sortValue, setSortValue] = useState<SortValue>("uploaded:desc");
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");

  const [statusOpen, setStatusOpen] = useState(false);
  const [dateOpen, setDateOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [viewing, setViewing] = useState<DocumentItem | null>(null);
  const [rejectTarget, setRejectTarget] = useState<DocumentItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<DocumentItem | null>(null);
  const [exporting, setExporting] = useState(false);

  const reqIdRef = useRef(0);
  const isAdmin = user?.role === "admin";

  useEffect(() => {
    try {
      const raw = localStorage.getItem("user");
      if (raw) setUser(JSON.parse(raw));
    } catch {
      /* ignore */
    }
  }, []);

  // 350ms debounce on the search input so we don't hammer the API.
  useEffect(() => {
    const id = window.setTimeout(() => setDebouncedQuery(query.trim()), 350);
    return () => window.clearTimeout(id);
  }, [query]);

  const fetchDocuments = useCallback(
    async (silent = false) => {
      const reqId = ++reqIdRef.current;
      if (!silent) setRefreshing(true);
      setListError(null);
      const params: DocumentListParams = {};
      if (statusFilter !== "all") params.status = statusFilter;
      if (categoryFilter !== "all") params.category = categoryFilter;
      const dateFrom = dateFromForFilter(dateFilter);
      if (dateFrom) params.date_from = dateFrom;
      if (debouncedQuery) params.search = debouncedQuery;

      try {
        const [list, sum] = await Promise.all([
          documentsApi.list(params),
          documentsApi.summary().catch(() => null),
        ]);
        if (reqId !== reqIdRef.current) return; // a newer request superseded us
        setDocuments(list.map(apiToDocument));
        if (sum) setSummary(sum);
      } catch (err) {
        if (reqId !== reqIdRef.current) return;
        setListError(extractApiError(err, "Failed to load documents."));
      } finally {
        if (reqId === reqIdRef.current) {
          setRefreshing(false);
          setLoading(false);
        }
      }
    },
    [statusFilter, categoryFilter, dateFilter, debouncedQuery],
  );

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  // Clear transient action errors after a moment so the banner doesn't linger.
  useEffect(() => {
    if (!actionError) return;
    const id = window.setTimeout(() => setActionError(null), 5000);
    return () => window.clearTimeout(id);
  }, [actionError]);

  const addActivity = (entry: Omit<ActivityEntry, "id" | "timestamp">) => {
    setActivity((prev) => [
      {
        ...entry,
        id: `a-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
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

  // Server applies status/category/search/date_from already.
  // Sorting stays client-side because the API doesn't expose an ordering param.
  const visibleDocuments = useMemo(() => {
    const [key, dir] = sortValue.split(":") as [
      "uploaded" | "name",
      "asc" | "desc",
    ];
    return [...documents].sort((a, b) => {
      let cmp = 0;
      if (key === "uploaded") {
        cmp =
          new Date(a.uploadedAt).getTime() - new Date(b.uploadedAt).getTime();
      } else {
        cmp = a.name.localeCompare(b.name);
      }
      return dir === "asc" ? cmp : -cmp;
    });
  }, [documents, sortValue]);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    documents.forEach((d) => {
      counts[d.category] = (counts[d.category] ?? 0) + 1;
    });
    return counts;
  }, [documents]);

  const CATEGORY_TABS: { value: CategoryFilter; label: string; count: number }[] = [
    { value: "all", label: "All", count: documents.length },
    ...(Object.keys(CATEGORY_LABEL) as DocumentCategory[]).map((c) => ({
      value: c,
      label: CATEGORY_LABEL[c],
      count: categoryCounts[c] ?? 0,
    })),
  ];

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

  // --- Mutations -----------------------------------------------------------

  const handleUpload = async (data: {
    file: File;
    name: string;
    category: DocumentCategory;
  }) => {
    const created = await documentsApi.upload({
      file: data.file,
      name: data.name,
      category: data.category,
    });
    const mapped = apiToDocument(created);
    setDocuments((prev) => [
      { ...mapped, size: data.file.size }, // keep size client-side for UX
      ...prev,
    ]);
    addActivity({
      actor: "You",
      action: "uploaded",
      target: mapped.name,
      tone: "info",
    });
    fetchDocuments(true);
  };

  const approveDocument = async (doc: DocumentItem) => {
    setActionBusyId(doc.id);
    try {
      const updated = await documentsApi.approve(doc.id);
      const mapped = apiToDocument(updated);
      setDocuments((prev) => prev.map((d) => (d.id === doc.id ? mapped : d)));
      addActivity({
        actor: "Admin",
        action: "approved",
        target: doc.name,
        tone: "success",
      });
      fetchDocuments(true);
    } catch (err) {
      setActionError(extractApiError(err, "Failed to approve document."));
    } finally {
      setActionBusyId(null);
    }
  };

  const rejectDocument = async (reason: string) => {
    if (!rejectTarget) return;
    try {
      const updated = await documentsApi.reject(rejectTarget.id, reason);
      const mapped = apiToDocument(updated);
      setDocuments((prev) =>
        prev.map((d) => (d.id === rejectTarget.id ? mapped : d)),
      );
      addActivity({
        actor: "Admin",
        action: "rejected",
        target: rejectTarget.name,
        tone: "danger",
      });
      setRejectTarget(null);
      fetchDocuments(true);
    } catch (err) {
      setActionError(extractApiError(err, "Failed to reject document."));
      throw err;
    }
  };

  const deleteDocument = async () => {
    if (!deleteTarget) return;
    setActionBusyId(deleteTarget.id);
    try {
      await documentsApi.remove(deleteTarget.id);
      setDocuments((prev) => prev.filter((d) => d.id !== deleteTarget.id));
      addActivity({
        actor: "You",
        action: "deleted",
        target: deleteTarget.name,
        tone: "warning",
      });
      setDeleteTarget(null);
      fetchDocuments(true);
    } catch (err) {
      setActionError(extractApiError(err, "Failed to delete document."));
    } finally {
      setActionBusyId(null);
    }
  };

  const downloadDocument = async (doc: DocumentItem) => {
    setActionBusyId(doc.id);
    try {
      await documentsApi.download(doc.id, doc.name);
    } catch (err) {
      setActionError(extractApiError(err, "Failed to download document."));
    } finally {
      setActionBusyId(null);
    }
  };

  const handleExportCsv = async () => {
    setExporting(true);
    setExportOpen(false);
    try {
      await documentsApi.exportCsv();
    } catch (err) {
      setActionError(extractApiError(err, "CSV export failed."));
    } finally {
      setExporting(false);
    }
  };

  // --- Derived display values ---------------------------------------------

  const statusLabel = STATUS_FILTERS.find((s) => s.value === statusFilter)?.label;
  const dateLabel = DATE_FILTERS.find((d) => d.value === dateFilter)?.label;
  const sortLabel = SORT_OPTIONS.find((s) => s.value === sortValue)?.label;

  const storageUsedMb = summary?.storage_used_mb ?? 0;
  const storagePct = (storageUsedMb / STORAGE_QUOTA_MB) * 100;

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
          <button
            type="button"
            onClick={() => fetchDocuments()}
            disabled={refreshing}
            className="btn-secondary"
            aria-label="Refresh"
          >
            <RefreshCw
              className={cn("w-3.5 h-3.5", refreshing && "animate-spin")}
              strokeWidth={2}
            />
            Refresh
          </button>
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                closePopovers();
                setExportOpen((v) => !v);
              }}
              disabled={exporting}
              className="btn-secondary"
            >
              {exporting ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Download className="w-3.5 h-3.5" strokeWidth={2} />
              )}
              Export
              <ChevronDown className="w-3 h-3 text-muted-2" strokeWidth={2} />
            </button>
            <Popover
              open={exportOpen}
              onClose={() => setExportOpen(false)}
              align="right"
            >
              <PopoverItem onClick={handleExportCsv}>Export CSV</PopoverItem>
              <PopoverItem
                onClick={() => {
                  setExportOpen(false);
                  window.print();
                }}
              >
                Print / Save as PDF
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

      {actionError && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-card px-4 py-2.5 flex items-start justify-between gap-3">
          <p className="flex items-center gap-2 text-[12.5px] font-medium">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" strokeWidth={2} />
            {actionError}
          </p>
          <button
            type="button"
            onClick={() => setActionError(null)}
            aria-label="Dismiss"
            className="p-1 rounded-full text-red-500 hover:bg-red-100 transition-colors"
          >
            <X className="w-3.5 h-3.5" strokeWidth={2} />
          </button>
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          label="Total Documents"
          value={(summary?.total_documents ?? documents.length).toString()}
          icon={Files}
          tone="bg-line-soft text-ink"
        />
        <StatCard
          label="Pending Verification"
          value={(summary?.pending_verification ?? 0).toString()}
          icon={Clock}
          tone={STATUS_TONE.pending}
        />
        <StatCard
          label="Approved Files"
          value={(summary?.approved_files ?? 0).toString()}
          icon={FileCheck2}
          tone={STATUS_TONE.approved}
        />
        <StatCard
          label="Storage Used"
          value={`${storageUsedMb.toFixed(1)} MB`}
          icon={HardDrive}
          tone="bg-(--color-info-bg) text-(--color-info-fg)"
          bar={storagePct}
          hint={`of ${(STORAGE_QUOTA_MB / 1024).toFixed(0)} GB (${storagePct.toFixed(1)}%)`}
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
                    active
                      ? "bg-white/15 text-white"
                      : "bg-line-soft text-muted",
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

          {refreshing && (
            <span className="inline-flex items-center gap-1.5 text-[11px] text-muted">
              <Loader2 className="w-3 h-3 animate-spin" strokeWidth={2} />
              Updating…
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-5 items-start">
        <div className="bg-white border border-line rounded-card overflow-hidden">
          {listError ? (
            <div className="py-16 text-center">
              <AlertCircle
                className="w-8 h-8 mx-auto text-red-500"
                strokeWidth={1.5}
              />
              <p className="mt-3 text-sm font-medium text-ink">
                Couldn't load documents
              </p>
              <p className="mt-1 text-[12.5px] text-muted">{listError}</p>
              <button
                type="button"
                onClick={() => fetchDocuments()}
                className="btn-secondary mt-4"
              >
                <RefreshCw className="w-3.5 h-3.5" strokeWidth={2} />
                Retry
              </button>
            </div>
          ) : (
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
                      const Icon = TYPE_ICON[TYPE_ICON_KIND[doc.type]];
                      const busy = actionBusyId === doc.id;
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
                                  {CATEGORY_LABEL[doc.category]}
                                  {doc.size !== undefined
                                    ? ` · ${formatBytes(doc.size)}`
                                    : ""}
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
                            <DocumentRowActions
                              doc={doc}
                              busy={busy}
                              isAdmin={isAdmin}
                              onApprove={() => approveDocument(doc)}
                              onReject={() => setRejectTarget(doc)}
                              onView={() => setViewing(doc)}
                              onDownload={() => downloadDocument(doc)}
                              onDelete={() => setDeleteTarget(doc)}
                            />
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <ActivityLog entries={activity.slice(0, 8)} />
      </div>

      <UploadDocumentModal
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        onSubmit={handleUpload}
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
              disabled={actionBusyId === deleteTarget?.id}
              className="inline-flex items-center justify-center gap-2 rounded-[6px] px-4 py-2.5 text-[12px] font-semibold uppercase tracking-[0.08em] transition-colors bg-red-600 hover:bg-red-700 text-white disabled:opacity-70"
            >
              {actionBusyId === deleteTarget?.id ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Trash2 className="w-3.5 h-3.5" strokeWidth={2} />
              )}
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
