import { useEffect } from "react";
import { X } from "lucide-react";
import { cn } from "../../lib/utils";

type Size = "sm" | "md" | "lg";

const SIZE: Record<Size, string> = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-2xl",
};

type Props = {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  icon?: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  iconTone?: string;
  size?: Size;
  closable?: boolean;
  footer?: React.ReactNode;
  children: React.ReactNode;
};

const Modal = ({
  open,
  onClose,
  title,
  description,
  icon: Icon,
  iconTone = "bg-line-soft text-ink",
  size = "md",
  closable = true,
  footer,
  children,
}: Props) => {
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && closable) onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onClose, closable]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/50 backdrop-blur-sm"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && closable) onClose();
      }}
      role="dialog"
      aria-modal="true"
    >
      <div
        className={cn(
          "bg-white rounded-card border border-line shadow-xl w-full overflow-hidden max-h-[90vh] flex flex-col",
          SIZE[size],
        )}
      >
        {(title || closable || Icon) && (
          <div className="flex items-start justify-between gap-3 px-6 pt-5 pb-4 border-b border-line shrink-0">
            <div className="flex items-start gap-3 min-w-0">
              {Icon && (
                <div
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center shrink-0",
                    iconTone,
                  )}
                >
                  <Icon className="w-5 h-5" strokeWidth={1.75} />
                </div>
              )}
              {(title || description) && (
                <div className="min-w-0">
                  {title && (
                    <h2 className="text-[15px] font-semibold text-ink leading-tight">
                      {title}
                    </h2>
                  )}
                  {description && (
                    <p className="text-[12px] text-muted mt-0.5">
                      {description}
                    </p>
                  )}
                </div>
              )}
            </div>
            {closable && (
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="p-1 rounded-full text-muted hover:text-ink hover:bg-line-soft transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        )}

        <div className="px-6 py-5 overflow-y-auto flex-1">{children}</div>

        {footer && (
          <div className="px-6 py-4 border-t border-line flex items-center justify-end gap-2 bg-line-soft/40 shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;
