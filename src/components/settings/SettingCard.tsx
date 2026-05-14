import { cn } from "../../lib/utils";

type Props = {
  title: string;
  description?: string;
  icon?: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
};

export const SettingCard = ({
  title,
  description,
  icon: Icon,
  actions,
  children,
  className,
}: Props) => (
  <section
    className={cn(
      "bg-white border border-line rounded-card overflow-hidden",
      className,
    )}
  >
    <header className="px-4 sm:px-6 py-4 border-b border-line flex items-start justify-between gap-4 flex-wrap">
      <div className="flex items-start gap-3 min-w-0">
        {Icon && (
          <div className="w-9 h-9 rounded-[8px] bg-line-soft text-ink flex items-center justify-center shrink-0">
            <Icon className="w-4 h-4" strokeWidth={1.75} />
          </div>
        )}
        <div className="min-w-0">
          <h3 className="text-[14px] font-semibold text-ink leading-tight">
            {title}
          </h3>
          {description && (
            <p className="mt-0.5 text-[12.5px] text-muted">{description}</p>
          )}
        </div>
      </div>
      {actions && (
        <div className="flex items-center gap-2 shrink-0 flex-wrap">{actions}</div>
      )}
    </header>
    <div className="p-4 sm:p-6">{children}</div>
  </section>
);

export const SettingRow = ({
  label,
  description,
  children,
  className,
}: {
  label: string;
  description?: string;
  children?: React.ReactNode;
  className?: string;
}) => (
  <div
    className={cn(
      "flex flex-col md:flex-row md:items-center md:justify-between gap-3 py-3.5 border-b border-line last:border-b-0",
      className,
    )}
  >
    <div className="min-w-0">
      <p className="text-[13px] font-medium text-ink">{label}</p>
      {description && (
        <p className="mt-0.5 text-[12px] text-muted">{description}</p>
      )}
    </div>
    {children && <div className="shrink-0">{children}</div>}
  </div>
);

export const Field = ({
  label,
  required,
  error,
  hint,
  children,
  className,
}: {
  label: string;
  required?: boolean;
  error?: string;
  hint?: string;
  children: React.ReactNode;
  className?: string;
}) => (
  <div className={cn("space-y-1.5", className)}>
    <label className="text-[12px] font-medium text-ink-soft flex items-center gap-1">
      {label}
      {required && <span className="text-red-500">*</span>}
    </label>
    {children}
    {error ? (
      <p className="text-[11px] text-red-600">{error}</p>
    ) : hint ? (
      <p className="text-[11px] text-muted-2">{hint}</p>
    ) : null}
  </div>
);
