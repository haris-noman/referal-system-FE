import { useEffect, useState } from "react";
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
} from "lucide-react";
import { cn } from "../lib/utils";
import api from "../lib/api";

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
  const [totalValue, setTotalValue] = useState(0);
  const [user, setUser] = useState<any>(null);

  const fetchReferrals = async () => {
    try {
      const [referralsRes, profileRes] = await Promise.all([
        api.get("/referrals/"),
        api.get("/auth/profile/"),
      ]);
      const results = referralsRes.data.results || referralsRes.data;
      setReferrals(results);
      
      const total = results.reduce((acc: number, curr: any) => acc + parseFloat(curr.estimated_value || 0), 0);
      setTotalValue(total);
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

  const handleApprove = async (id: number) => {
    const rate = window.prompt("Enter commission rate (%)", "5");
    if (rate === null) return;
    
    try {
      const formData = new FormData();
      formData.append("commission_rate", rate);
      await api.post(`/referrals/${id}/approve/`, formData);
      fetchReferrals(); // Refresh
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
      fetchReferrals(); // Refresh
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
    <div className="space-y-5">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h2 className="text-[24px] font-bold text-ink tracking-tight">
            Referral Tracking
          </h2>
          <p className="text-sm text-muted mt-1">
            Monitor and manage the status of all institutional network
            referrals.
          </p>
        </div>
        <div className="flex gap-3">
          <button className="btn-secondary">
            <Download className="w-3.5 h-3.5" strokeWidth={2} />
            Export
          </button>
          <Link to="/submit" className="btn-primary">
            <Plus className="w-3.5 h-3.5" strokeWidth={2.5} />
            New Referral
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-stretch">
        <div className="md:col-span-2 bg-white border border-line rounded-card px-5 py-3.5 flex items-center gap-3">
          <span className="inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">
            <FilterIcon className="w-3.5 h-3.5" strokeWidth={2} />
            Filters
          </span>
          <div className="h-5 w-px bg-line" />
          <button className="inline-flex items-center gap-1.5 text-[12px] font-medium text-ink hover:bg-line-soft px-2.5 py-1 rounded-md transition-colors">
            All Statuses
            <ChevronDown className="w-3 h-3 text-muted-2" strokeWidth={2} />
          </button>
          <button className="inline-flex items-center gap-1.5 text-[12px] font-medium text-ink hover:bg-line-soft px-2.5 py-1 rounded-md transition-colors">
            Any Date
            <ChevronDown className="w-3 h-3 text-muted-2" strokeWidth={2} />
          </button>
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
                <th className="px-6 py-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted text-left">
                  ID
                </th>
                <th className="px-6 py-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted text-left">
                  Lead Name
                </th>
                <th className="px-6 py-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted text-left">
                  Date Submitted
                </th>
                <th className="px-6 py-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted text-right">
                  Value
                </th>
                <th className="px-6 py-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted text-left">
                  Status
                </th>
                {user?.role === 'admin' && (
                  <th className="px-6 py-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted text-right">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {referrals.length > 0 ? referrals.map((row) => (
                <tr
                  key={row.id}
                  className="border-b border-line-soft last:border-b-0 hover:bg-line-soft/50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <span className="text-[12px] font-semibold text-muted">
                      #{row.id}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-full bg-line-soft flex items-center justify-center text-[10px] font-bold text-muted">
                        {row.full_name.split(' ').map((n: string) => n[0]).join('').toUpperCase()}
                      </div>
                      <span className="text-[13px] font-semibold text-ink">
                        {row.full_name}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-[13px] text-muted">
                    {new Date(row.submitted_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right text-[13px] font-semibold text-ink">
                    ${parseFloat(row.estimated_value).toLocaleString()}
                  </td>
                  <td className="px-6 py-4">
                    <StatusPill status={row.status} />
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
        <div className="px-6 py-3 border-t border-line text-[12px] text-muted">
          Showing <span className="font-semibold text-ink">{referrals.length}</span> referrals
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
    </div>
  );
};

export default TrackingPage;
