import { useMemo, useState } from "react";
import {
  Activity,
  ChevronDown,
  Inbox,
  CheckCircle2,
  Clock,
  Loader2,
  MessageSquare,
} from "lucide-react";
import { cn } from "../../lib/utils";
import SupportPageHeader from "../../components/support/SupportPageHeader";
import { Popover, PopoverItem } from "../../components/ui/Popover";

type TicketStatus = "open" | "in_progress" | "awaiting_you" | "resolved";

const STATUS_LABEL: Record<TicketStatus, string> = {
  open: "Open",
  in_progress: "In Progress",
  awaiting_you: "Awaiting Reply",
  resolved: "Resolved",
};

const STATUS_TONE: Record<TicketStatus, string> = {
  open: "bg-(--color-info-bg) text-(--color-info-fg)",
  in_progress: "bg-(--color-warning-bg) text-(--color-warning-fg)",
  awaiting_you: "bg-(--color-danger-bg) text-(--color-danger-fg)",
  resolved: "bg-(--color-success-bg) text-(--color-success-fg)",
};

const STATUS_ICON: Record<TicketStatus, React.ComponentType<{ className?: string; strokeWidth?: number }>> = {
  open: Inbox,
  in_progress: Loader2,
  awaiting_you: MessageSquare,
  resolved: CheckCircle2,
};

type Ticket = {
  id: string;
  subject: string;
  category: string;
  priority: "low" | "medium" | "high" | "urgent";
  status: TicketStatus;
  updated: string;
  lastReply: string;
  messages: number;
};

const TICKETS: Ticket[] = [
  {
    id: "TCK-48201",
    subject: "Commission missing for referral REF-1142",
    category: "Billing & Commissions",
    priority: "high",
    status: "in_progress",
    updated: "2 hours ago",
    lastReply: "Accounts team is reviewing the payout schedule.",
    messages: 4,
  },
  {
    id: "TCK-48177",
    subject: "Cannot upload PDF on submit referral page",
    category: "Technical / Bug Report",
    priority: "medium",
    status: "awaiting_you",
    updated: "Yesterday",
    lastReply: "Could you share the file size and browser version?",
    messages: 3,
  },
  {
    id: "TCK-48109",
    subject: "Add team member to my workspace",
    category: "Account Access",
    priority: "low",
    status: "open",
    updated: "2 days ago",
    lastReply: "Ticket received — assignment pending.",
    messages: 1,
  },
  {
    id: "TCK-47982",
    subject: "Clarify approval timeline for mortgage referrals",
    category: "Referrals & Tracking",
    priority: "low",
    status: "resolved",
    updated: "Last week",
    lastReply: "Closed — full timeline shared via email.",
    messages: 6,
  },
  {
    id: "TCK-47844",
    subject: "2FA setup not sending SMS",
    category: "Account Access",
    priority: "urgent",
    status: "resolved",
    updated: "Last week",
    lastReply: "Resolved by switching to authenticator app.",
    messages: 5,
  },
];

const PRIORITY_TONE: Record<Ticket["priority"], string> = {
  low: "bg-(--color-neutral-bg) text-(--color-neutral-fg)",
  medium: "bg-(--color-info-bg) text-(--color-info-fg)",
  high: "bg-(--color-warning-bg) text-(--color-warning-fg)",
  urgent: "bg-(--color-danger-bg) text-(--color-danger-fg)",
};

const FILTERS: { value: "all" | TicketStatus; label: string }[] = [
  { value: "all", label: "All Tickets" },
  { value: "open", label: "Open" },
  { value: "in_progress", label: "In Progress" },
  { value: "awaiting_you", label: "Awaiting Reply" },
  { value: "resolved", label: "Resolved" },
];

const StatCard = ({
  label,
  value,
  tone,
  icon: Icon,
}: {
  label: string;
  value: number;
  tone: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
}) => (
  <div className="bg-white border border-line rounded-card p-5">
    <div className="flex items-center justify-between">
      <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted">
        {label}
      </p>
      <span
        className={cn(
          "w-7 h-7 rounded-[6px] flex items-center justify-center",
          tone,
        )}
      >
        <Icon className="w-3.5 h-3.5" strokeWidth={2} />
      </span>
    </div>
    <h3 className="mt-3 text-[26px] font-bold text-ink tracking-tight">
      {value}
    </h3>
  </div>
);

const ResponseStatusPage = () => {
  const [filter, setFilter] = useState<"all" | TicketStatus>("all");
  const [filterOpen, setFilterOpen] = useState(false);

  const counts = useMemo(() => {
    return TICKETS.reduce(
      (acc, t) => {
        acc[t.status] = (acc[t.status] ?? 0) + 1;
        return acc;
      },
      {} as Record<TicketStatus, number>,
    );
  }, []);

  const filtered = useMemo(
    () => (filter === "all" ? TICKETS : TICKETS.filter((t) => t.status === filter)),
    [filter],
  );

  const filterLabel =
    FILTERS.find((f) => f.value === filter)?.label ?? "All Tickets";

  return (
    <div className="space-y-6">
      <SupportPageHeader
        icon={Activity}
        title="Response Status"
        description="Track the status of every ticket you've submitted and review the latest reply from our team."
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
        <StatCard
          label="Open"
          value={counts.open ?? 0}
          tone={STATUS_TONE.open}
          icon={Inbox}
        />
        <StatCard
          label="In Progress"
          value={counts.in_progress ?? 0}
          tone={STATUS_TONE.in_progress}
          icon={Loader2}
        />
        <StatCard
          label="Awaiting Reply"
          value={counts.awaiting_you ?? 0}
          tone={STATUS_TONE.awaiting_you}
          icon={MessageSquare}
        />
        <StatCard
          label="Resolved"
          value={counts.resolved ?? 0}
          tone={STATUS_TONE.resolved}
          icon={CheckCircle2}
        />
      </div>

      <div className="bg-white border border-line rounded-card overflow-hidden">
        <div className="px-5 py-3 border-b border-line flex items-center justify-between gap-3 flex-wrap">
          <h3 className="text-[13px] font-semibold text-ink">Recent Tickets</h3>
          <div className="relative">
            <button
              type="button"
              onClick={() => setFilterOpen((v) => !v)}
              className={cn(
                "inline-flex items-center gap-1.5 text-[12px] font-medium px-2.5 py-1 rounded-md transition-colors",
                filter !== "all"
                  ? "bg-line-soft text-ink"
                  : "text-ink hover:bg-line-soft",
              )}
            >
              {filterLabel}
              <ChevronDown className="w-3 h-3 text-muted-2" strokeWidth={2} />
            </button>
            <Popover
              open={filterOpen}
              onClose={() => setFilterOpen(false)}
              align="right"
            >
              {FILTERS.map((opt) => (
                <PopoverItem
                  key={opt.value}
                  active={filter === opt.value}
                  onClick={() => {
                    setFilter(opt.value);
                    setFilterOpen(false);
                  }}
                >
                  {opt.label}
                </PopoverItem>
              ))}
            </Popover>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="py-16 text-center">
            <Inbox className="w-8 h-8 mx-auto text-muted-2" strokeWidth={1.5} />
            <p className="mt-3 text-sm font-medium text-ink">
              No tickets in this view
            </p>
            <p className="mt-1 text-[12.5px] text-muted">
              Try a different filter.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-line">
            {filtered.map((t) => {
              const Icon = STATUS_ICON[t.status];
              return (
                <li
                  key={t.id}
                  className="px-5 py-4 hover:bg-line-soft/40 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={cn(
                        "w-9 h-9 rounded-[8px] flex items-center justify-center shrink-0",
                        STATUS_TONE[t.status],
                      )}
                    >
                      <Icon
                        className={cn(
                          "w-4 h-4",
                          t.status === "in_progress" && "animate-spin",
                        )}
                        strokeWidth={2}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3 flex-wrap">
                        <div className="min-w-0">
                          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-2">
                            {t.id} · {t.category}
                          </p>
                          <h4 className="mt-1 text-[14px] font-semibold text-ink truncate">
                            {t.subject}
                          </h4>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span
                            className={cn(
                              "px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-[0.08em]",
                              PRIORITY_TONE[t.priority],
                            )}
                          >
                            {t.priority}
                          </span>
                          <span
                            className={cn(
                              "px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-[0.08em]",
                              STATUS_TONE[t.status],
                            )}
                          >
                            {STATUS_LABEL[t.status]}
                          </span>
                        </div>
                      </div>
                      <p className="mt-2 text-[13px] text-muted line-clamp-2">
                        {t.lastReply}
                      </p>
                      <div className="mt-2 flex items-center gap-4 text-[11px] text-muted-2">
                        <span className="inline-flex items-center gap-1">
                          <Clock className="w-3 h-3" strokeWidth={2} />
                          Updated {t.updated}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <MessageSquare className="w-3 h-3" strokeWidth={2} />
                          {t.messages} message{t.messages === 1 ? "" : "s"}
                        </span>
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
};

export default ResponseStatusPage;
