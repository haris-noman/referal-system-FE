import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
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

/**
 * Portal-rendered menu anchored to a trigger element. Use this when the menu
 * lives inside a container with `overflow` (e.g. a scrollable table) where a
 * regular `absolute`-positioned Popover would be clipped.
 *
 * Position is recomputed on scroll/resize so the menu stays glued to the
 * trigger button as the user interacts with the page.
 */
export const PortalMenu = ({
  open,
  onClose,
  anchorRef,
  align = "right",
  width = 200,
  children,
}: {
  open: boolean;
  onClose: () => void;
  anchorRef: React.RefObject<HTMLElement | null>;
  align?: "left" | "right";
  width?: number;
  children: React.ReactNode;
}) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);

  useLayoutEffect(() => {
    if (!open) return;
    const compute = () => {
      const anchor = anchorRef.current;
      if (!anchor) return;
      const rect = anchor.getBoundingClientRect();
      const top = rect.bottom + 4;
      const rawLeft = align === "right" ? rect.right - width : rect.left;
      const left = Math.max(
        8,
        Math.min(rawLeft, window.innerWidth - width - 8),
      );
      setPos({ top, left });
    };
    compute();
    window.addEventListener("scroll", compute, true);
    window.addEventListener("resize", compute);
    return () => {
      window.removeEventListener("scroll", compute, true);
      window.removeEventListener("resize", compute);
    };
  }, [open, anchorRef, align, width]);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent | TouchEvent) => {
      const target = e.target as Node;
      if (menuRef.current?.contains(target)) return;
      if (anchorRef.current?.contains(target)) return;
      onClose();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("touchstart", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("touchstart", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, anchorRef, onClose]);

  if (!open || !pos) return null;

  return createPortal(
    <div
      ref={menuRef}
      style={{ position: "fixed", top: pos.top, left: pos.left, width }}
      className="z-50 bg-white border border-line rounded-[8px] shadow-lg py-1.5"
      role="menu"
    >
      {children}
    </div>,
    document.body,
  );
};
