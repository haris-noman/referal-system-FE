import { cn } from "../../lib/utils";

export type TabItem<T extends string> = {
  value: T;
  label: string;
  icon?: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  badge?: string | number;
};

type Props<T extends string> = {
  tabs: TabItem<T>[];
  value: T;
  onChange: (next: T) => void;
  className?: string;
};

function Tabs<T extends string>({ tabs, value, onChange, className }: Props<T>) {
  return (
    <div
      role="tablist"
      className={cn(
        "flex flex-wrap items-center gap-1 bg-white border border-line rounded-card p-1",
        className,
      )}
    >
      {tabs.map((tab) => {
        const active = tab.value === value;
        const Icon = tab.icon;
        return (
          <button
            key={tab.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(tab.value)}
            className={cn(
              "inline-flex items-center gap-2 px-3.5 py-2 rounded-[6px] text-[12.5px] font-medium transition-colors",
              active
                ? "bg-ink text-white"
                : "text-muted hover:bg-line-soft hover:text-ink",
            )}
          >
            {Icon && <Icon className="w-3.5 h-3.5" strokeWidth={1.75} />}
            <span>{tab.label}</span>
            {tab.badge !== undefined && (
              <span
                className={cn(
                  "min-w-[18px] h-[18px] inline-flex items-center justify-center px-1.5 rounded-full text-[10px] font-semibold",
                  active
                    ? "bg-white/15 text-white"
                    : "bg-line-soft text-muted",
                )}
              >
                {tab.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

export default Tabs;
