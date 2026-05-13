import { cn } from "../../lib/utils";

type Props = {
  checked: boolean;
  onChange: (next: boolean) => void;
  label?: string;
  description?: string;
  disabled?: boolean;
  className?: string;
  size?: "sm" | "md";
};

const SIZE = {
  sm: { track: "w-8 h-[18px]", thumb: "w-[14px] h-[14px]", translate: "translate-x-[14px]" },
  md: { track: "w-10 h-[22px]", thumb: "w-[18px] h-[18px]", translate: "translate-x-[18px]" },
} as const;

const Toggle = ({
  checked,
  onChange,
  label,
  description,
  disabled,
  className,
  size = "md",
}: Props) => {
  const dims = SIZE[size];
  return (
    <label
      className={cn(
        "flex items-start gap-3 cursor-pointer select-none",
        disabled && "cursor-not-allowed opacity-60",
        className,
      )}
    >
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        disabled={disabled}
        onClick={() => !disabled && onChange(!checked)}
        className={cn(
          "relative shrink-0 rounded-full transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-ink/40",
          dims.track,
          checked ? "bg-ink" : "bg-line",
        )}
      >
        <span
          className={cn(
            "absolute top-1/2 left-0.5 -translate-y-1/2 bg-white rounded-full shadow-sm transition-transform duration-200",
            dims.thumb,
            checked && dims.translate,
          )}
        />
      </button>
      {(label || description) && (
        <span className="min-w-0">
          {label && (
            <span className="block text-[13px] font-medium text-ink leading-tight">
              {label}
            </span>
          )}
          {description && (
            <span className="block text-[12px] text-muted mt-0.5 leading-snug">
              {description}
            </span>
          )}
        </span>
      )}
    </label>
  );
};

export default Toggle;
