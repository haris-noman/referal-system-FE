import { cn } from "../../lib/utils";

type Props = {
  eyebrow?: string;
  title: string;
  description?: string;
  icon?: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  actions?: React.ReactNode;
  className?: string;
};

const SupportPageHeader = ({
  eyebrow = "Support",
  title,
  description,
  icon: Icon,
  actions,
  className,
}: Props) => (
  <div
    className={cn(
      "flex flex-col md:flex-row md:items-end md:justify-between gap-4",
      className,
    )}
  >
    <div className="flex items-start gap-4">
      {Icon && (
        <div className="w-11 h-11 rounded-[10px] bg-white border border-line flex items-center justify-center text-ink shrink-0">
          <Icon className="w-5 h-5" strokeWidth={1.75} />
        </div>
      )}
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-2">
          {eyebrow}
        </p>
        <h2 className="mt-1 text-[20px] sm:text-[24px] font-bold text-ink tracking-tight leading-tight">
          {title}
        </h2>
        {description && (
          <p className="mt-1 text-sm text-muted max-w-2xl">{description}</p>
        )}
      </div>
    </div>
    {actions && <div className="flex flex-wrap gap-3">{actions}</div>}
  </div>
);

export default SupportPageHeader;
