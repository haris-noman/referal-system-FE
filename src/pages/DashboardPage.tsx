import { useEffect, useMemo, useState } from "react";
import {
  Users,
  ClipboardList,
  CheckCircle2,
  DollarSign,
  Download,
  Plus,
  CheckCircle,
  UserPlus,
  Clock,
  FileText,
  Filter,
  ArrowUpDown,
  Loader2,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Link } from "react-router-dom";
import { cn } from "../lib/utils";
import api from "../lib/api";
import { useSearch } from "../contexts/SearchContext";
import { useTheme } from "../contexts/ThemeContext";
import { exportCsv } from "../lib/exportCsv";
import { Popover, PopoverItem } from "../components/ui/Popover";
import ReferralActionModal, {
  type ReferralAction,
  type ReferralActionTarget,
} from "../components/ReferralActionModal";

/**
 * Per-mode palette for the recharts bar chart. Recharts takes color values
 * via props, not CSS, so we resolve them from the active theme. Light values
 * mirror what the chart used before this refactor.
 */
const CHART_COLORS = {
  light: {
    grid: "#F1F2F4",
    axisTick: "#9CA3AF",
    cursor: "#F5F6F8",
    tooltipBg: "#FFFFFF",
    tooltipBorder: "#E5E7EB",
    tooltipText: "#0B1220",
    approved: "#0B1220",
    pending: "#E5E7EB",
  },
  dark: {
    grid: "#2A2F3A",
    axisTick: "#9CA3AF",
    cursor: "rgba(255,255,255,0.04)",
    tooltipBg: "#161B22",
    tooltipBorder: "#2A2F3A",
    tooltipText: "#F3F4F6",
    approved: "#F3F4F6",
    pending: "#2A2F3A",
  },
} as const;

type StatTone = "neutral" | "warning" | "info" | "success";

const TONE: Record<StatTone, string> = {
  neutral: "bg-(--color-neutral-bg) text-(--color-neutral-fg)",
  warning: "bg-(--color-warning-bg) text-(--color-warning-fg)",
  info: "bg-(--color-info-bg) text-(--color-info-fg)",
  success: "bg-(--color-success-bg) text-(--color-success-fg)",
};

const StatCard = ({
  icon: Icon,
  label,
  value,
  tag,
  tone = "neutral",
}: {
  icon: any;
  label: string;
  value: string | number;
  tag: string;
  tone?: StatTone;
}) => (
  <div className="bg-white border border-line rounded-card p-5">
    <div className="flex items-start justify-between mb-6">
      <div className="w-9 h-9 rounded-[8px] bg-line-soft flex items-center justify-center text-ink">
        <Icon className="w-4 h-4" strokeWidth={1.75} />
      </div>
      <span
        className={cn(
          "px-2 py-0.5 rounded-full text-[10px] font-semibold",
          TONE[tone],
        )}
      >
        {tag}
      </span>
    </div>
    <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted">
      {label}
    </p>
    <h3 className="mt-1.5 text-[26px] font-bold text-ink tracking-tight">
      {value}
    </h3>
  </div>
);

type Status = "pending" | "approved" | "draft" | "rejected";

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
      "inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium",
      STATUS_STYLES[status],
    )}
  >
    {STATUS_DISPLAY[status]}
  </span>
);

const ACTIVITY_ICONS: Record<string, any> = {
  referral_submitted: UserPlus,
  referral_approved: CheckCircle,
  referral_rejected: Clock,
};

type SortKey = "submitted_at" | "full_name" | "estimated_value" | "status";
type SortDir = "asc" | "desc";

const SORT_OPTIONS: { value: `${SortKey}:${SortDir}`; label: string }[] = [
  { value: "submitted_at:desc", label: "Newest first" },
  { value: "submitted_at:asc", label: "Oldest first" },
  { value: "full_name:asc", label: "Name (A–Z)" },
  { value: "full_name:desc", label: "Name (Z–A)" },
  { value: "estimated_value:desc", label: "Value (high to low)" },
  { value: "estimated_value:asc", label: "Value (low to high)" },
  { value: "status:asc", label: "Status (A–Z)" },
];

const STATUS_FILTERS: { value: "all" | Status; label: string }[] = [
  { value: "all", label: "All Statuses" },
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
  { value: "draft", label: "Draft" },
];


const DashboardPage = () => {
  const [summary, setSummary] = useState<any>(null);
  const [stats, setStats] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [pipeline, setPipeline] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const { query } = useSearch();
  const { resolvedDark } = useTheme();
  const chartPalette = resolvedDark ? CHART_COLORS.dark : CHART_COLORS.light;
  const [sortValue, setSortValue] = useState<`${SortKey}:${SortDir}`>(
    "submitted_at:desc",
  );
  const [statusFilter, setStatusFilter] = useState<"all" | Status>("all");
  const [sortOpen, setSortOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [actionTarget, setActionTarget] = useState<ReferralActionTarget | null>(
    null,
  );
  const [actionType, setActionType] = useState<ReferralAction | null>(null);

  const fetchData = async () => {
    try {
      const [summaryRes, statsRes, activitiesRes, pipelineRes, profileRes] = await Promise.all([
        api.get("/dashboard/summary/"),
        api.get("/dashboard/monthly-stats/"),
        api.get("/dashboard/recent-activity/"),
        api.get("/referrals/"),
        api.get("/auth/profile/"),
      ]);

      setSummary(summaryRes.data);
      setStats(statsRes.data.map((s: any) => ({
        name: ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"][s.month - 1],
        approved: s.approved_count,
        pending: s.referral_count - s.approved_count,
      })));
      setActivities(activitiesRes.data);
      setPipeline(pipelineRes.data.results || pipelineRes.data);
      setUser(profileRes.data);
      localStorage.setItem("user", JSON.stringify(profileRes.data));
    } catch (err) {
      console.error("Failed to fetch dashboard data", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
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

  const displayedPipeline = useMemo(() => {
    const [key, dir] = sortValue.split(":") as [SortKey, SortDir];
    const q = query.trim().toLowerCase();

    const filtered = pipeline.filter((row) => {
      if (statusFilter !== "all" && row.status !== statusFilter) return false;
      if (!q) return true;
      const haystack = [
        row.full_name,
        row.email,
        row.referral_type,
        row.status,
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
      } else if (key === "estimated_value") {
        cmp = parseFloat(va || 0) - parseFloat(vb || 0);
      } else {
        cmp = String(va ?? "").localeCompare(String(vb ?? ""));
      }
      return dir === "asc" ? cmp : -cmp;
    });

    return sorted;
  }, [pipeline, query, statusFilter, sortValue]);

  const handleDownloadReport = () => {
    if (displayedPipeline.length === 0) {
      alert("No referrals to download for the current filters.");
      return;
    }
    const stamp = new Date().toISOString().slice(0, 10);
    exportCsv(
      `referral-report-${stamp}.csv`,
      [
        { key: "id", header: "ID" },
        { key: "full_name", header: "Full Name" },
        { key: "email", header: "Email" },
        { key: "phone_number", header: "Phone" },
        { key: "referral_type", header: "Type" },
        { key: "estimated_value", header: "Estimated Value (USD)" },
        { key: "commission_amount", header: "Commission (USD)" },
        { key: "status", header: "Status" },
        { key: "submitted_at", header: "Submitted At" },
      ],
      displayedPipeline.map((r) => ({
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

  const sortLabel =
    SORT_OPTIONS.find((o) => o.value === sortValue)?.label ?? "Sort";
  const filterLabel =
    STATUS_FILTERS.find((o) => o.value === statusFilter)?.label ??
    "All Statuses";

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-muted" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h2 className="text-[24px] font-bold text-ink tracking-tight">
            {user?.role === 'admin' ? 'Administrator Overview' : 'Partner Overview'}
          </h2>
          <p className="text-sm text-muted mt-1">
            Performance metrics and referral activities for {new Date().getFullYear()}
          </p>
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleDownloadReport}
            className="btn-secondary"
          >
            <Download className="w-3.5 h-3.5" strokeWidth={2} />
            Download Report
          </button>
          {user?.role !== "admin" && (
            <Link to="/submit" className="btn-primary">
              <Plus className="w-3.5 h-3.5" strokeWidth={2.5} />
              Submit New Referral
            </Link>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          icon={Users}
          label="Total Referrals"
          value={summary?.total_referrals || 0}
          tag="All Time"
          tone="neutral"
        />
        <StatCard
          icon={ClipboardList}
          label="Pending Review"
          value={summary?.pending_review || 0}
          tag="Active"
          tone="warning"
        />
        <StatCard
          icon={CheckCircle2}
          label="Approved Leads"
          value={summary?.approved_leads || 0}
          tag={`${Math.round((summary?.approved_leads / (summary?.total_referrals || 1)) * 100)}% Rate`}
          tone="info"
        />
        <StatCard
          icon={DollarSign}
          label="Total Commission"
          value={`$${parseFloat(summary?.total_commission || 0).toLocaleString()}`}
          tag="USD"
          tone="success"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 bg-white border border-line rounded-card p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-[15px] font-semibold text-ink">
              Monthly Referral Volume
            </h3>
            <div className="flex items-center gap-4 text-[11px]">
              <span className="inline-flex items-center gap-1.5 text-ink font-medium">
                <span className="w-2 h-2 rounded-full bg-ink" />
                Approved
              </span>
              <span className="inline-flex items-center gap-1.5 text-muted">
                <span className="w-2 h-2 rounded-full bg-line" />
                Pending
              </span>
            </div>
          </div>
          <div className="h-[260px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={stats}
                margin={{ top: 10, right: 4, left: -24, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke={chartPalette.grid}
                />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fill: chartPalette.axisTick,
                    fontSize: 10,
                    fontWeight: 600,
                    letterSpacing: 1,
                  }}
                  dy={8}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fill: chartPalette.axisTick,
                    fontSize: 10,
                    fontWeight: 500,
                  }}
                />
                <Tooltip
                  cursor={{ fill: chartPalette.cursor }}
                  contentStyle={{
                    borderRadius: "8px",
                    border: `1px solid ${chartPalette.tooltipBorder}`,
                    backgroundColor: chartPalette.tooltipBg,
                    color: chartPalette.tooltipText,
                    fontSize: "12px",
                  }}
                  labelStyle={{ color: chartPalette.tooltipText }}
                  itemStyle={{ color: chartPalette.tooltipText }}
                />
                <Legend wrapperStyle={{ display: "none" }} />
                <Bar
                  dataKey="approved"
                  fill={chartPalette.approved}
                  radius={[3, 3, 0, 0]}
                  barSize={14}
                />
                <Bar
                  dataKey="pending"
                  fill={chartPalette.pending}
                  radius={[3, 3, 0, 0]}
                  barSize={14}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white border border-line rounded-card p-6 flex flex-col">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-[15px] font-semibold text-ink">
              Recent Activity
            </h3>
          </div>
          <div className="space-y-5 flex-1">
            {activities.length > 0 ? activities.map((a, i) => (
              <div key={i} className="flex gap-3">
                <div className="w-7 h-7 rounded-full bg-line-soft flex items-center justify-center text-ink shrink-0">
                  {(() => {
                    const Icon = ACTIVITY_ICONS[a.action] || FileText;
                    return <Icon className="w-3.5 h-3.5" strokeWidth={1.75} />;
                  })()}
                </div>
                <div className="min-w-0">
                  <p className="text-[13px] font-semibold text-ink leading-tight">
                    {a.action.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                  </p>
                  <p className="text-[12px] text-muted leading-snug mt-0.5">
                    User {a.user_email} performed {a.action}
                  </p>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-2 mt-1.5">
                    {new Date(a.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>
            )) : (
              <p className="text-center text-muted text-sm py-10">No recent activity</p>
            )}
          </div>
          <button className="btn-secondary w-full mt-5 py-2.5">
            View All Activity
          </button>
        </div>
      </div>

      <div className="bg-white border border-line rounded-card overflow-hidden">
        <div className="px-6 py-5 flex items-center justify-between border-b border-line gap-3 flex-wrap">
          <div className="flex items-center gap-3 min-w-0">
            <h3 className="text-[15px] font-semibold text-ink">
              Referral Pipeline
            </h3>
            {(query || statusFilter !== "all") && (
              <span className="text-[11px] text-muted">
                {displayedPipeline.length} of {pipeline.length}
              </span>
            )}
          </div>
          <div className="flex gap-2">
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setFilterOpen((v) => !v);
                  setSortOpen(false);
                }}
                className={cn(
                  "btn-secondary text-[11px]! py-1.5! px-3!",
                  statusFilter !== "all" && "border-ink text-ink",
                )}
              >
                <Filter className="w-3 h-3" strokeWidth={2} />
                {filterLabel}
              </button>
              <Popover open={filterOpen} onClose={() => setFilterOpen(false)}>
                {STATUS_FILTERS.map((opt) => (
                  <PopoverItem
                    key={opt.value}
                    active={statusFilter === opt.value}
                    onClick={() => {
                      setStatusFilter(opt.value);
                      setFilterOpen(false);
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
                  setSortOpen((v) => !v);
                  setFilterOpen(false);
                }}
                className="btn-secondary text-[11px]! py-1.5! px-3!"
              >
                <ArrowUpDown className="w-3 h-3" strokeWidth={2} />
                {sortLabel}
              </button>
              <Popover open={sortOpen} onClose={() => setSortOpen(false)}>
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
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-line">
                <th className="px-6 py-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted">
                  Referral Name
                </th>
                <th className="px-6 py-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted">
                  Date Submitted
                </th>
                <th className="px-6 py-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted">
                  Value
                </th>
                <th className="px-6 py-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted">
                  Status
                </th>
                <th className="px-6 py-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted text-right">
                  Estimate/Commission
                </th>
                {user?.role === 'admin' && (
                  <th className="px-6 py-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted text-right">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {displayedPipeline.length > 0 ? displayedPipeline.map((row) => (
                <tr
                  key={row.id}
                  className="border-b border-line-soft last:border-b-0 hover:bg-line-soft/50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-[2px] bg-line-soft flex items-center justify-center text-[10px] font-bold text-muted">
                        {row.full_name.split(' ').map((n: string) => n[0]).join('').toUpperCase()}
                      </div>
                      <div>
                        <p className="text-[13px] font-semibold text-ink leading-tight">
                          {row.full_name}
                        </p>
                        <p className="text-[11px] text-muted leading-tight mt-0.5">
                          {row.referral_type.replace(/_/g, ' ')}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-[13px] text-muted">
                    {new Date(row.submitted_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-[13px] font-semibold text-ink">
                    ${parseFloat(row.estimated_value).toLocaleString()}
                  </td>
                  <td className="px-6 py-4">
                    <StatusPill status={row.status} />
                  </td>
                  <td className="px-6 py-4 text-right text-[13px] font-semibold text-ink">
                    {row.status === 'approved' ? `$${parseFloat(row.commission_amount).toLocaleString()}` : '—'}
                  </td>
                  {user?.role === 'admin' && (
                    <td className="px-6 py-4 text-right">
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
                  <td colSpan={user?.role === 'admin' ? 6 : 5} className="px-6 py-10 text-center text-muted">
                    {pipeline.length === 0
                      ? "No referrals found."
                      : "No referrals match your search or filters."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ReferralActionModal
        referral={actionTarget}
        action={actionType}
        onClose={closeAction}
        onSuccess={fetchData}
      />
    </div>
  );
};

export default DashboardPage;
