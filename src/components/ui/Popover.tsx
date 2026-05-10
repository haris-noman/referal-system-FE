import { useRef } from "react";
import { Check } from "lucide-react";
import { cn } from "../../lib/utils";
import { useOnClickOutside } from "../../lib/useOnClickOutside";

export const Popover = ({
  open,
  onClose,
  children,
  align = "right",
}: {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  align?: "left" | "right";
}) => {
  const ref = useRef<HTMLDivElement>(null);
  useOnClickOutside(ref, onClose, open);
  if (!open) return null;
  return (
    <div
      ref={ref}
      className={cn(
        "absolute top-full mt-1 z-30 min-w-[200px] bg-white border border-line rounded-[8px] shadow-lg py-1.5",
        align === "right" ? "right-0" : "left-0",
      )}
    >
      {children}
    </div>
  );
};

export const PopoverItem = ({
  active,
  onClick,
  children,
}: {
  active?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) => (
  <button
    type="button"
    onClick={onClick}
    className={cn(
      "w-full flex items-center justify-between gap-3 px-3 py-1.5 text-[12px] text-left transition-colors hover:bg-line-soft",
      active ? "text-ink font-semibold" : "text-muted",
    )}
  >
    <span>{children}</span>
    {active && <Check className="w-3.5 h-3.5" strokeWidth={2.5} />}
  </button>
);
