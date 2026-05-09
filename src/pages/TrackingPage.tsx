import { Link } from "react-router-dom";
import {
  Download,
  Plus,
  ChevronDown,
  TrendingUp,
  Clock,
  Award,
  Filter as FilterIcon,
} from "lucide-react";
import { cn } from "../lib/utils";

type Status = "Approved" | "Pending" | "Completed" | "Rejected" | "On Hold";

const STATUS_STYLES: Record<Status, string> = {
  Approved: "bg-(--color-success-bg) text-(--color-success-fg)",
  Pending: "bg-(--color-warning-bg) text-(--color-warning-fg)",
  Completed: "bg-(--color-info-bg) text-(--color-info-fg)",
  Rejected: "bg-(--color-danger-bg) text-(--color-danger-fg)",
  "On Hold": "bg-(--color-neutral-bg) text-(--color-neutral-fg)",
};

const StatusPill = ({ status }: { status: Status }) => (
  <span
    className={cn(
      "inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider",
      STATUS_STYLES[status],
    )}
  >
    {status}
  </span>
);

const referrals: Array<{
  id: string;
  initials: string;
  lead: string;
  date: string;
  value: string;
  status: Status;
}> = [
  {
    id: "REF-8842",
    initials: "JS",
    lead: "Jonathan Sterling",
    date: "Oct 12, 2023",
    value: "$45,000.00",
    status: "Approved",
  },
  {
    id: "REF-8841",
    initials: "AR",
    lead: "Amara Rodriguez",
    date: "Oct 14, 2023",
    value: "$12,400.00",
    status: "Pending",
  },
  {
    id: "REF-8839",
    initials: "MB",
    lead: "Marcus Bennett",
    date: "Oct 09, 2023",
    value: "$150,000.00",
    status: "Completed",
  },
  {
    id: "REF-8835",
    initials: "EL",
    lead: "Elena Langford",
    date: "Oct 05, 2023",
    value: "$8,500.00",
    status: "Rejected",
  },
  {
    id: "REF-8832",
    initials: "TH",
    lead: "Tobias Hoffmann",
    date: "Oct 01, 2023",
    value: "$96,250.00",
    status: "Approved",
  },
];

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
          <span className="text-[18px] font-bold text-ink">$412,850.00</span>
        </div>
      </div>

      <div className="bg-white border border-line rounded-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-line">
                {["ID", "Lead Name", "Date Submitted", "Value", "Status"].map(
                  (header, i) => (
                    <th
                      key={header}
                      className={cn(
                        "px-6 py-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted",
                        i === 3 ? "text-right" : "text-left",
                      )}
                    >
                      {header}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {referrals.map((row) => (
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
                        {row.initials}
                      </div>
                      <span className="text-[13px] font-semibold text-ink">
                        {row.lead}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-[13px] text-muted">
                    {row.date}
                  </td>
                  <td className="px-6 py-4 text-right text-[13px] font-semibold text-ink">
                    {row.value}
                  </td>
                  <td className="px-6 py-4">
                    <StatusPill status={row.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-3 border-t border-line text-[12px] text-muted">
          Showing <span className="font-semibold text-ink">1 to 5</span> of{" "}
          <span className="font-semibold text-ink">42</span> referrals
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
