import { useEffect, type RefObject } from "react";

export const useOnClickOutside = (
  ref: RefObject<HTMLElement | null>,
  handler: (e: MouseEvent | TouchEvent) => void,
  active = true,
) => {
  useEffect(() => {
    if (!active) return;
    const listener = (event: MouseEvent | TouchEvent) => {
      const el = ref.current;
      if (!el || el.contains(event.target as Node)) return;
      handler(event);
    };
    document.addEventListener("mousedown", listener);
    document.addEventListener("touchstart", listener);
    return () => {
      document.removeEventListener("mousedown", listener);
      document.removeEventListener("touchstart", listener);
    };
  }, [ref, handler, active]);
};
