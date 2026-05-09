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

const chartData = [
  { name: "JAN", approved: 45, pending: 20 },
  { name: "FEB", approved: 52, pending: 25 },
  { name: "MAR", approved: 48, pending: 18 },
  { name: "APR", approved: 61, pending: 30 },
  { name: "MAY", approved: 55, pending: 22 },
  { name: "JUN", approved: 67, pending: 28 },
];

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
  value: string;
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

type Status = "Pending" | "Approved" | "Draft" | "In Review" | "Rejected";

const STATUS_STYLES: Record<Status, string> = {
  Approved: "bg-(--color-success-bg) text-(--color-success-fg)",
  Pending: "bg-(--color-warning-bg) text-(--color-warning-fg)",
  "In Review": "bg-(--color-info-bg) text-(--color-info-fg)",
  Rejected: "bg-(--color-danger-bg) text-(--color-danger-fg)",
  Draft: "bg-(--color-neutral-bg) text-(--color-neutral-fg)",
};

const StatusPill = ({ status }: { status: Status }) => (
  <span
    className={cn(
      "inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium",
      STATUS_STYLES[status],
    )}
  >
    {status}
  </span>
);

const ACTIVITY = [
  {
    icon: CheckCircle,
    title: "Referral Approved",
    desc: "Lead: Sarah Jenkins — $1,200 commission pending.",
    time: "2 hours ago",
  },
  {
    icon: UserPlus,
    title: "New Referral Submitted",
    desc: "Lead: Vertex Dynamics — Tier 1 Enterprise opportunity.",
    time: "5 hours ago",
  },
  {
    icon: Clock,
    title: "Status Update",
    desc: "Lead: Michael Chen moved to 'Documentation' stage.",
    time: "Yesterday",
  },
  {
    icon: FileText,
    title: "Documents Uploaded",
    desc: "Signed NDA received for lead: Quantum Logistics.",
    time: "Aug 12, 2024",
  },
];

const PIPELINE: Array<{
  initials: string;
  name: string;
  service: string;
  date: string;
  value: string;
  status: Status;
  est: string;
}> = [
  {
    initials: "VD",
    name: "Vertex Dynamics",
    service: "Enterprise Cloud",
    date: "Aug 14, 2024",
    value: "$12,400",
    status: "Pending",
    est: "$1,240",
  },
  {
    initials: "QL",
    name: "Quantum Logistics",
    service: "Fleet Management",
    date: "Aug 12, 2024",
    value: "$8,500",
    status: "Approved",
    est: "$850",
  },
  {
    initials: "SJ",
    name: "Sarah Jenkins",
    service: "SME Consulting",
    date: "Aug 10, 2024",
    value: "$2,200",
    status: "Draft",
    est: "$220",
  },
];

const DashboardPage = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h2 className="text-[24px] font-bold text-ink tracking-tight">
            Partner Overview
          </h2>
          <p className="text-sm text-muted mt-1">
            Performance metrics and referral activities for Q3 2024
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
          value="1,284"
          tag="+12%"
          tone="success"
        />
        <StatCard
          icon={ClipboardList}
          label="Pending Review"
          value="42"
          tag="Active"
          tone="warning"
        />
        <StatCard
          icon={CheckCircle2}
          label="Approved Leads"
          value="1,130"
          tag="88% Rate"
          tone="info"
        />
        <StatCard
          icon={DollarSign}
          label="Total Commission"
          value="$48,250"
          tag="USD"
          tone="neutral"
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
                data={chartData}
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
            {ACTIVITY.map((a, i) => (
              <div key={i} className="flex gap-3">
                <div className="w-7 h-7 rounded-full bg-light-gray flex items-center justify-center text-ink shrink-0">
                  <a.icon className="w-3.5 h-3.5" strokeWidth={1.75} />
                </div>
                <div className="min-w-0">
                  <p className="text-[13px] font-semibold text-ink leading-tight">
                    {a.title}
                  </p>
                  <p className="text-[12px] text-muted leading-snug mt-0.5">
                    {a.desc}
                  </p>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-2 mt-1.5">
                    {a.time}
                  </p>
                </div>
              </div>
            ))}
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
                  Estimate
                </th>
              </tr>
            </thead>
            <tbody>
              {PIPELINE.map((row) => (
                <tr
                  key={row.name}
                  className="border-b border-line-soft last:border-b-0 hover:bg-line-soft/50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-full bg-line-soft flex items-center justify-center text-[10px] font-bold text-muted">
                        {row.initials}
                      </div>
                      <div>
                        <p className="text-[13px] font-semibold text-ink leading-tight">
                          {row.name}
                        </p>
                        <p className="text-[11px] text-muted leading-tight mt-0.5">
                          {row.service}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-[13px] text-muted">
                    {row.date}
                  </td>
                  <td className="px-6 py-4 text-[13px] font-semibold text-ink">
                    {row.value}
                  </td>
                  <td className="px-6 py-4">
                    <StatusPill status={row.status} />
                  </td>
                  <td className="px-6 py-4 text-right text-[13px] font-semibold text-ink">
                    {row.est}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
