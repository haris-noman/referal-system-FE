import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Download,
  Plus,
  ChevronDown,
  TrendingUp,
  Clock,
  Award,
  Filter as FilterIcon,
  Loader2,
  ArrowUpDown,
  X,
} from "lucide-react";
import { cn } from "../lib/utils";
import api from "../lib/api";
import { useSearch } from "../contexts/SearchContext";
import { exportCsv } from "../lib/exportCsv";
import { Popover, PopoverItem } from "../components/ui/Popover";
import ReferralActionModal, {
  type ReferralAction,
  type ReferralActionTarget,
} from "../components/ReferralActionModal";

type Status = "pending" | "approved" | "rejected" | "draft";

const STATUS_DISPLAY: Record<Status, string> = {
  approved: "Approved",
  pending: "Pending",
  rejected: "Rejected",
  draft: "Draft",
};

const STATUS_STYLES: Record<Status, string> = {
  approved: "bg-(--color-success-bg) text-(--color-success-fg)",
  pending: "bg-(--color-warning-bg) text-(--color-warning-fg)",
  rejected: "bg-(--color-danger-bg) text-(--color-danger-fg)",
  draft: "bg-(--color-neutral-bg) text-(--color-neutral-fg)",
};

const StatusPill = ({ status }: { status: Status }) => (
  <span
    className={cn(
      "inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider",
      STATUS_STYLES[status],
    )}
  >
    {STATUS_DISPLAY[status]}
  </span>
);

type SortKey = "submitted_at" | "full_name" | "estimated_value" | "status" | "id";
type SortDir = "asc" | "desc";

const SORT_OPTIONS: { value: `${SortKey}:${SortDir}`; label: string }[] = [
  { value: "submitted_at:desc", label: "Newest first" },
  { value: "submitted_at:asc", label: "Oldest first" },
  { value: "full_name:asc", label: "Name (A–Z)" },
  { value: "full_name:desc", label: "Name (Z–A)" },
  { value: "estimated_value:desc", label: "Value (high to low)" },
  { value: "estimated_value:asc", label: "Value (low to high)" },
  { value: "id:desc", label: "ID (newest)" },
  { value: "id:asc", label: "ID (oldest)" },
];

const STATUS_FILTERS: { value: "all" | Status; label: string }[] = [
  { value: "all", label: "All Statuses" },
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
  { value: "draft", label: "Draft" },
];

type DateFilter = "all" | "7d" | "30d" | "90d" | "ytd";

const DATE_FILTERS: { value: DateFilter; label: string }[] = [
  { value: "all", label: "Any Date" },
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
  { value: "90d", label: "Last 90 days" },
  { value: "ytd", label: "Year to date" },
];

const matchesDate = (iso: string | undefined, filter: DateFilter) => {
  if (filter === "all" || !iso) return true;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return false;
  const now = new Date();
  if (filter === "ytd") return d.getFullYear() === now.getFullYear();
  const days = filter === "7d" ? 7 : filter === "30d" ? 30 : 90;
  const cutoff = new Date(now);
  cutoff.setDate(cutoff.getDate() - days);
  return d >= cutoff;
};

const SUMMARY = [
  {
    label: "Growth Rate",
    icon: TrendingUp,
    value: "+12.5%",
    desc: "Increase in referral volume compared to last quarter.",
    accent: "text-emerald-600",
  },
  {
    label: "Avg Response",
    icon: Clock,
    value: "4.2 Days",
    desc: "Mean time for institutional approval processing.",
    accent: "text-(--color-ink)",
  },
  {
    label: "Reward Pool",
    icon: Award,
    value: "$15.2k",
    desc: "Allocated rewards pending final completion payout.",
    accent: "text-(--color-ink)",
  },
];

const TrackingPage = () => {
  const [referrals, setReferrals] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const { query } = useSearch();
  const [statusFilter, setStatusFilter] = useState<"all" | Status>("all");
  const [dateFilter, setDateFilter] = useState<DateFilter>("all");
  const [sortValue, setSortValue] = useState<`${SortKey}:${SortDir}`>(
    "submitted_at:desc",
  );
  const [statusOpen, setStatusOpen] = useState(false);
  const [dateOpen, setDateOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  const [actionTarget, setActionTarget] = useState<ReferralActionTarget | null>(
    null,
  );
  const [actionType, setActionType] = useState<ReferralAction | null>(null);

  const fetchReferrals = async () => {
    try {
      const [referralsRes, profileRes] = await Promise.all([
        api.get("/referrals/"),
        api.get("/auth/profile/"),
      ]);
      const results = referralsRes.data.results || referralsRes.data;
      setReferrals(results);
      setUser(profileRes.data);
    } catch (err) {
      console.error("Failed to fetch data", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReferrals();
  }, []);

  const openAction = (row: any, type: ReferralAction) => {
    setActionTarget({
      id: row.id,
      full_name: row.full_name,
      estimated_value: row.estimated_value,
      referral_type: row.referral_type,
    });
    setActionType(type);
  };

  const closeAction = () => {
    setActionTarget(null);
    setActionType(null);
  };

  const displayedReferrals = useMemo(() => {
    const [key, dir] = sortValue.split(":") as [SortKey, SortDir];
    const q = query.trim().toLowerCase();

    const filtered = referrals.filter((row) => {
      if (statusFilter !== "all" && row.status !== statusFilter) return false;
      if (!matchesDate(row.submitted_at, dateFilter)) return false;
      if (!q) return true;
      const haystack = [
        row.full_name,
        row.email,
        row.phone_number,
        row.referral_type,
        row.status,
        row.id ? `#${row.id}` : "",
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });

    const sorted = [...filtered].sort((a, b) => {
      const va = a?.[key];
      const vb = b?.[key];
      let cmp = 0;
      if (key === "submitted_at") {
        cmp = new Date(va || 0).getTime() - new Date(vb || 0).getTime();
      } else if (key === "estimated_value" || key === "id") {
        cmp = parseFloat(va || 0) - parseFloat(vb || 0);
      } else {
        cmp = String(va ?? "").localeCompare(String(vb ?? ""));
      }
      return dir === "asc" ? cmp : -cmp;
    });

    return sorted;
  }, [referrals, query, statusFilter, dateFilter, sortValue]);

  const totalValue = useMemo(
    () =>
      displayedReferrals.reduce(
        (acc, curr) => acc + parseFloat(curr.estimated_value || 0),
        0,
      ),
    [displayedReferrals],
  );

  const handleExport = () => {
    if (displayedReferrals.length === 0) {
      alert("No referrals to export for the current filters.");
      return;
    }
    const stamp = new Date().toISOString().slice(0, 10);
    exportCsv(
      `referral-tracking-${stamp}.csv`,
      [
        { key: "id", header: "ID" },
        { key: "full_name", header: "Lead Name" },
        { key: "email", header: "Email" },
        { key: "phone_number", header: "Phone" },
        { key: "referral_type", header: "Type" },
        { key: "estimated_value", header: "Estimated Value (USD)" },
        { key: "commission_amount", header: "Commission (USD)" },
        { key: "status", header: "Status" },
        { key: "submitted_at", header: "Submitted At" },
      ],
      displayedReferrals.map((r) => ({
        id: r.id,
        full_name: r.full_name,
        email: r.email ?? "",
        phone_number: r.phone_number ?? "",
        referral_type: r.referral_type,
        estimated_value: parseFloat(r.estimated_value || 0).toFixed(2),
        commission_amount:
          r.status === "approved"
            ? parseFloat(r.commission_amount || 0).toFixed(2)
            : "",
        status: r.status,
        submitted_at: r.submitted_at
          ? new Date(r.submitted_at).toISOString()
          : "",
      })),
    );
  };

  const statusLabel =
    STATUS_FILTERS.find((o) => o.value === statusFilter)?.label ??
    "All Statuses";
  const dateLabel =
    DATE_FILTERS.find((o) => o.value === dateFilter)?.label ?? "Any Date";
  const sortLabel =
    SORT_OPTIONS.find((o) => o.value === sortValue)?.label ?? "Sort";

  const closeAllPopovers = () => {
    setStatusOpen(false);
    setDateOpen(false);
    setSortOpen(false);
  };

  const filtersActive =
    statusFilter !== "all" || dateFilter !== "all" || query.trim().length > 0;

  const clearFilters = () => {
    setStatusFilter("all");
    setDateFilter("all");
  };

  if (isLoading) {
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
          <h2 className="text-[20px] sm:text-[24px] font-bold text-ink tracking-tight">
            Referral Tracking
          </h2>
          <p className="text-sm text-muted mt-1">
            Monitor and manage the status of all institutional network
            referrals.
          </p>
        </div>
        <div className="flex gap-3 flex-wrap">
          <button
            type="button"
            onClick={handleExport}
            className="btn-secondary"
          >
            <Download className="w-3.5 h-3.5" strokeWidth={2} />
            Export
          </button>
          {user?.role !== "admin" && (
            <Link to="/submit" className="btn-primary">
              <Plus className="w-3.5 h-3.5" strokeWidth={2.5} />
              New Referral
            </Link>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-stretch">
        <div className="md:col-span-2 bg-white border border-line rounded-card px-4 sm:px-5 py-3 flex items-center gap-2 flex-wrap">
          <span className="inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">
            <FilterIcon className="w-3.5 h-3.5" strokeWidth={2} />
            Filters
          </span>
          <div className="h-5 w-px bg-line" />

          <div className="relative">
            <button
              type="button"
              onClick={() => {
                closeAllPopovers();
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
            <Popover
              open={statusOpen}
              onClose={() => setStatusOpen(false)}
              align="left"
            >
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
                closeAllPopovers();
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
            <Popover
              open={dateOpen}
              onClose={() => setDateOpen(false)}
              align="left"
            >
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
                closeAllPopovers();
                setSortOpen((v) => !v);
              }}
              className="inline-flex items-center gap-1.5 text-[12px] font-medium text-ink hover:bg-line-soft px-2.5 py-1 rounded-md transition-colors"
            >
              <ArrowUpDown
                className="w-3 h-3 text-muted-2"
                strokeWidth={2}
              />
              {sortLabel}
            </button>
            <Popover
              open={sortOpen}
              onClose={() => setSortOpen(false)}
              align="left"
            >
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

          {filtersActive && (statusFilter !== "all" || dateFilter !== "all") && (
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
        <div className="bg-white border border-line rounded-card px-5 py-3.5 flex items-center justify-between">
          <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">
            Total Value
          </span>
          <span className="text-[18px] font-bold text-ink">${totalValue.toLocaleString()}</span>
        </div>
      </div>

      <div className="bg-white border border-line rounded-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-line">
                <th className="px-4 sm:px-6 py-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted text-left whitespace-nowrap">
                  ID
                </th>
                <th className="px-4 sm:px-6 py-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted text-left whitespace-nowrap">
                  Lead Name
                </th>
                <th className="px-4 sm:px-6 py-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted text-left whitespace-nowrap">
                  Date Submitted
                </th>
                <th className="px-4 sm:px-6 py-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted text-right whitespace-nowrap">
                  Value
                </th>
                <th className="px-4 sm:px-6 py-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted text-left whitespace-nowrap">
                  Status
                </th>
                {user?.role === 'admin' && (
                  <th className="px-4 sm:px-6 py-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted text-right whitespace-nowrap">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {displayedReferrals.length > 0 ? displayedReferrals.map((row) => (
                <tr
                  key={row.id}
                  className="border-b border-line-soft last:border-b-0 hover:bg-line-soft/50 transition-colors"
                >
                  <td className="px-4 sm:px-6 py-4">
                    <span className="text-[12px] font-semibold text-muted">
                      #{row.id}
                    </span>
                  </td>
                  <td className="px-4 sm:px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-full bg-line-soft flex items-center justify-center text-[10px] font-bold text-muted">
                        {row.full_name.split(' ').map((n: string) => n[0]).join('').toUpperCase()}
                      </div>
                      <span className="text-[13px] font-semibold text-ink">
                        {row.full_name}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 sm:px-6 py-4 text-[13px] text-muted whitespace-nowrap">
                    {new Date(row.submitted_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 sm:px-6 py-4 text-right text-[13px] font-semibold text-ink whitespace-nowrap">
                    ${parseFloat(row.estimated_value).toLocaleString()}
                  </td>
                  <td className="px-4 sm:px-6 py-4">
                    <StatusPill status={row.status} />
                  </td>
                  {user?.role === 'admin' && (
                    <td className="px-4 sm:px-6 py-4 text-right whitespace-nowrap">
                      {row.status === 'pending' ? (
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => openAction(row, "approve")}
                            className="text-[11px] font-bold text-emerald-600 hover:text-emerald-700 uppercase tracking-wider"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => openAction(row, "reject")}
                            className="text-[11px] font-bold text-red-600 hover:text-red-700 uppercase tracking-wider"
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <span className="text-[11px] text-muted italic">No actions</span>
                      )}
                    </td>
                  )}
                </tr>
              )) : (
                <tr>
                  <td colSpan={user?.role === 'admin' ? 6 : 5} className="px-4 sm:px-6 py-10 text-center text-muted">
                    {referrals.length === 0
                      ? "No referrals found."
                      : "No referrals match your search or filters."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="px-4 sm:px-6 py-3 border-t border-line text-[12px] text-muted">
          Showing <span className="font-semibold text-ink">{displayedReferrals.length}</span> of {referrals.length} referrals
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {SUMMARY.map((s) => (
          <div
            key={s.label}
            className="bg-white border border-line rounded-card p-5"
          >
            <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">
              <s.icon className={cn("w-3.5 h-3.5", s.accent)} strokeWidth={2} />
              {s.label}
            </div>
            <h3 className="mt-3 text-[22px] font-bold text-ink tracking-tight">
              {s.value}
            </h3>
            <p className="mt-1 text-[12px] text-muted leading-snug">{s.desc}</p>
          </div>
        ))}
      </div>

      <ReferralActionModal
        referral={actionTarget}
        action={actionType}
        onClose={closeAction}
        onSuccess={fetchReferrals}
      />
    </div>
  );
};

export default TrackingPage;
