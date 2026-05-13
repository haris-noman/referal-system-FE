import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

export type ThemeMode = "light" | "dark" | "system";

export type ThemePrefs = {
  mode: ThemeMode;
  accent: string;
};

type ThemeContextValue = ThemePrefs & {
  resolvedDark: boolean;
  setMode: (mode: ThemeMode) => void;
  setAccent: (accent: string) => void;
  setPrefs: (next: Partial<ThemePrefs>) => void;
};

const STORAGE_KEY = "theme.prefs";
const DEFAULT_ACCENT = "#0b1220";

const DEFAULTS: ThemePrefs = {
  mode: "system",
  accent: DEFAULT_ACCENT,
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

const readStored = (): ThemePrefs => {
  if (typeof window === "undefined") return DEFAULTS;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULTS;
    const parsed = JSON.parse(raw) as Partial<ThemePrefs>;
    return {
      mode:
        parsed.mode === "light" || parsed.mode === "dark" || parsed.mode === "system"
          ? parsed.mode
          : DEFAULTS.mode,
      accent:
        typeof parsed.accent === "string" && /^#([0-9a-f]{3}){1,2}$/i.test(parsed.accent)
          ? parsed.accent
          : DEFAULTS.accent,
    };
  } catch {
    return DEFAULTS;
  }
};

const systemPrefersDark = (): boolean => {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
};

const applyToDocument = (mode: ThemeMode, accent: string): boolean => {
  const isDark = mode === "dark" || (mode === "system" && systemPrefersDark());
  const root = document.documentElement;
  root.classList.toggle("dark", isDark);
  root.setAttribute("data-theme", isDark ? "dark" : "light");
  root.style.setProperty("--color-accent", accent);
  return isDark;
};

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [prefs, setPrefsState] = useState<ThemePrefs>(() => readStored());
  const [resolvedDark, setResolvedDark] = useState<boolean>(() => {
    const initial = readStored();
    return (
      initial.mode === "dark" || (initial.mode === "system" && systemPrefersDark())
    );
  });

  // Skip persisting on the very first commit — the values already came from
  // storage, so writing them back would just be noise.
  const firstCommit = useRef(true);

  // Apply to <html> on every prefs change and keep resolvedDark in sync.
  useEffect(() => {
    const isDark = applyToDocument(prefs.mode, prefs.accent);
    setResolvedDark(isDark);
    if (firstCommit.current) {
      firstCommit.current = false;
      return;
    }
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
    } catch {
      /* ignore */
    }
  }, [prefs]);

  // When the user picks "System", track the OS preference live.
  useEffect(() => {
    if (prefs.mode !== "system") return;
    const mql = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => {
      const isDark = applyToDocument("system", prefs.accent);
      setResolvedDark(isDark);
    };
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, [prefs.mode, prefs.accent]);

  // Sync across tabs/windows of the same browser session.
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key !== STORAGE_KEY || !e.newValue) return;
      try {
        const next = JSON.parse(e.newValue) as ThemePrefs;
        setPrefsState((prev) =>
          prev.mode === next.mode && prev.accent === next.accent ? prev : next,
        );
      } catch {
        /* ignore */
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const setMode = useCallback((mode: ThemeMode) => {
    setPrefsState((prev) => (prev.mode === mode ? prev : { ...prev, mode }));
  }, []);

  const setAccent = useCallback((accent: string) => {
    setPrefsState((prev) => (prev.accent === accent ? prev : { ...prev, accent }));
  }, []);

  const setPrefs = useCallback((next: Partial<ThemePrefs>) => {
    setPrefsState((prev) => {
      const merged = { ...prev, ...next };
      return merged.mode === prev.mode && merged.accent === prev.accent
        ? prev
        : merged;
    });
  }, []);

  const value = useMemo<ThemeContextValue>(
    () => ({
      mode: prefs.mode,
      accent: prefs.accent,
      resolvedDark,
      setMode,
      setAccent,
      setPrefs,
    }),
    [prefs.mode, prefs.accent, resolvedDark, setMode, setAccent, setPrefs],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextValue => {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return ctx;
};
