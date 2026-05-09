import { useEffect, useState } from "react";
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
      <div className="w-9 h-9 rounded-[8px] bg-light-gray flex items-center justify-center text-ink">
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

const DashboardPage = () => {
  const [summary, setSummary] = useState<any>(null);
  const [stats, setStats] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [pipeline, setPipeline] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

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

  const handleApprove = async (id: number) => {
    const rate = window.prompt("Enter commission rate (%)", "5");
    if (rate === null) return;
    
    try {
      const formData = new FormData();
      formData.append("commission_rate", rate);
      await api.post(`/referrals/${id}/approve/`, formData);
      fetchData(); // Refresh
    } catch (err: any) {
      alert(err.response?.data?.error || "Approval failed");
    }
  };

  const handleReject = async (id: number) => {
    const reason = window.prompt("Enter rejection reason");
    if (reason === null) return;

    try {
      const formData = new FormData();
      formData.append("rejection_reason", reason);
      await api.post(`/referrals/${id}/reject/`, formData);
      fetchData(); // Refresh
    } catch (err: any) {
      alert(err.response?.data?.error || "Rejection failed");
    }
  };

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
          <button className="btn-secondary">
            <Download className="w-3.5 h-3.5" strokeWidth={2} />
            Download Report
          </button>
          <Link to="/submit" className="btn-primary">
            <Plus className="w-3.5 h-3.5" strokeWidth={2.5} />
            Submit New Referral
          </Link>
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
                  stroke="#F1F2F4"
                />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fill: "#9CA3AF",
                    fontSize: 10,
                    fontWeight: 600,
                    letterSpacing: 1,
                  }}
                  dy={8}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#9CA3AF", fontSize: 10, fontWeight: 500 }}
                />
                <Tooltip
                  cursor={{ fill: "#F5F6F8" }}
                  contentStyle={{
                    borderRadius: "8px",
                    border: "1px solid #E5E7EB",
                    fontSize: "12px",
                  }}
                />
                <Legend wrapperStyle={{ display: "none" }} />
                <Bar
                  dataKey="approved"
                  fill="#0B1220"
                  radius={[3, 3, 0, 0]}
                  barSize={14}
                />
                <Bar
                  dataKey="pending"
                  fill="#E5E7EB"
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
                <div className="w-7 h-7 rounded-full bg-light-gray flex items-center justify-center text-ink shrink-0">
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
        <div className="px-6 py-5 flex items-center justify-between border-b border-line">
          <h3 className="text-[15px] font-semibold text-ink">
            Referral Pipeline
          </h3>
          <div className="flex gap-2">
            <button className="btn-secondary text-[11px]! py-1.5! px-3!">
              <Filter className="w-3 h-3" strokeWidth={2} />
              Filter
            </button>
            <button className="btn-secondary text-[11px]! py-1.5! px-3!">
              <ArrowUpDown className="w-3 h-3" strokeWidth={2} />
              Sort
            </button>
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
              {pipeline.length > 0 ? pipeline.map((row) => (
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
                            onClick={() => handleApprove(row.id)}
                            className="text-[11px] font-bold text-emerald-600 hover:text-emerald-700 uppercase tracking-wider"
                          >
                            Approve
                          </button>
                          <button 
                            onClick={() => handleReject(row.id)}
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
                    No referrals found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
