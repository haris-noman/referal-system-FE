import { Activity } from "lucide-react";
import { cn } from "../../../lib/utils";
import type { ActivityEntry } from "../documentsData";

const TONE: Record<ActivityEntry["tone"], string> = {
  default: "bg-line-soft text-ink",
  success: "bg-(--color-success-bg) text-(--color-success-fg)",
  warning: "bg-(--color-warning-bg) text-(--color-warning-fg)",
  danger: "bg-(--color-danger-bg) text-(--color-danger-fg)",
  info: "bg-(--color-info-bg) text-(--color-info-fg)",
};

const ActivityLog = ({ entries }: { entries: ActivityEntry[] }) => (
  <div className="bg-white border border-line rounded-card overflow-hidden">
    <header className="px-5 py-3 border-b border-line flex items-center gap-2">
      <Activity className="w-3.5 h-3.5 text-muted" strokeWidth={2} />
      <h3 className="text-[13px] font-semibold text-ink">Activity Log</h3>
    </header>
    {entries.length === 0 ? (
      <div className="py-10 text-center text-[12.5px] text-muted">
        No recent activity.
      </div>
    ) : (
      <ol className="divide-y divide-line">
        {entries.map((entry) => (
          <li key={entry.id} className="px-5 py-3.5 flex items-start gap-3">
            <span
              className={cn(
                "w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0",
                TONE[entry.tone],
              )}
            >
              {entry.actor.slice(0, 1)}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[12.5px] text-ink leading-snug">
                <span className="font-semibold">{entry.actor}</span>{" "}
                <span className="text-muted">{entry.action}</span>
                {entry.target && (
                  <>
                    {" "}
                    <span className="font-medium text-ink-soft break-words">
                      {entry.target}
                    </span>
                  </>
                )}
              </p>
              <p className="mt-0.5 text-[11px] text-muted-2">
                {entry.timestamp}
              </p>
            </div>
          </li>
        ))}
      </ol>
    )}
  </div>
);

export default ActivityLog;
