import { useEffect, useMemo, useState } from "react";
import {
  Sun,
  Moon,
  Monitor,
  Languages,
  Palette,
  Save,
  CheckCircle2,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { cn } from "../../../lib/utils";
import { SettingCard, SettingRow } from "../../../components/settings/SettingCard";
import {
  settingsApi,
  extractSettingsError,
  type ApiAppearance,
  type AppearanceLanguage,
} from "../../../lib/settingsApi";
import { useTheme, type ThemeMode } from "../../../contexts/ThemeContext";

const THEME_OPTIONS: {
  value: ThemeMode;
  label: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  description: string;
}[] = [
  {
    value: "light",
    label: "Light",
    icon: Sun,
    description: "Always use the light interface.",
  },
  {
    value: "dark",
    label: "Dark",
    icon: Moon,
    description: "Easier on the eyes in low light.",
  },
  {
    value: "system",
    label: "System",
    icon: Monitor,
    description: "Match your operating system.",
  },
];

const LANGUAGES: { value: AppearanceLanguage; label: string; region: string }[] = [
  { value: "en", label: "English", region: "United States" },
  { value: "es", label: "Español", region: "España" },
  { value: "fr", label: "Français", region: "France" },
  { value: "ar", label: "العربية", region: "السعودية" },
];

const ACCENT_COLORS = [
  { value: "#0b1220", label: "Ink" },
  { value: "#2563eb", label: "Cobalt" },
  { value: "#7c3aed", label: "Iris" },
  { value: "#059669", label: "Emerald" },
  { value: "#d97706", label: "Amber" },
  { value: "#dc2626", label: "Crimson" },
  { value: "#0891b2", label: "Cyan" },
  { value: "#db2777", label: "Rose" },
];

type FormState = {
  mode: ThemeMode;
  language: AppearanceLanguage;
  accent: string;
};

/**
 * Reconciles the API value (`dark_mode` boolean) with the locally-persisted
 * `mode` ("light"/"dark"/"system"). If the user previously chose "system" and
 * the API stored the *resolved* dark value, we preserve that "system" intent.
 */
const reconcileMode = (api: ApiAppearance, localMode: ThemeMode): ThemeMode => {
  if (localMode === "system") {
    const isDark =
      typeof window !== "undefined" && window.matchMedia
        ? window.matchMedia("(prefers-color-scheme: dark)").matches
        : false;
    if (isDark === api.dark_mode) return "system";
  }
  return api.dark_mode ? "dark" : "light";
};

const AppearanceTab = () => {
  const theme = useTheme();

  const [form, setForm] = useState<FormState>({
    mode: theme.mode,
    language: "en",
    accent: theme.accent,
  });
  const [original, setOriginal] = useState<FormState | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await settingsApi.appearance.get();
        if (cancelled) return;
        const next: FormState = {
          mode: reconcileMode(data, theme.mode),
          language: data.language ?? "en",
          accent: data.theme_color || theme.accent,
        };
        setForm(next);
        setOriginal(next);
        // Apply server values to the live UI so saved preferences from
        // another device take effect immediately.
        theme.setPrefs({ mode: next.mode, accent: next.accent });
      } catch (err) {
        if (!cancelled)
          setLoadError(
            extractSettingsError(err, "Failed to load appearance settings."),
          );
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setMode = (mode: ThemeMode) => {
    setForm((p) => ({ ...p, mode }));
    theme.setMode(mode);
    setSaved(false);
    setSubmitError(null);
  };

  const setAccent = (accent: string) => {
    setForm((p) => ({ ...p, accent }));
    theme.setAccent(accent);
    setSaved(false);
    setSubmitError(null);
  };

  const setLanguage = (language: AppearanceLanguage) => {
    setForm((p) => ({ ...p, language }));
    setSaved(false);
    setSubmitError(null);
  };

  const isDirty = useMemo(() => {
    if (!original) return false;
    return (
      form.mode !== original.mode ||
      form.language !== original.language ||
      form.accent.toLowerCase() !== original.accent.toLowerCase()
    );
  }, [form, original]);

  const onSave = async () => {
    if (!isDirty) return;
    setSaving(true);
    setSubmitError(null);

    // The API only stores `dark_mode` as a boolean — resolve "system" against
    // the OS preference at save time.
    const darkMode =
      form.mode === "dark" ||
      (form.mode === "system" &&
        typeof window !== "undefined" &&
        window.matchMedia &&
        window.matchMedia("(prefers-color-scheme: dark)").matches);

    try {
      const updated = await settingsApi.appearance.update({
        dark_mode: darkMode,
        language: form.language,
        theme_color: form.accent,
      });
      const next: FormState = {
        mode: reconcileMode(updated, form.mode),
        language: updated.language ?? form.language,
        accent: updated.theme_color || form.accent,
      };
      setForm(next);
      setOriginal(next);
      theme.setPrefs({ mode: next.mode, accent: next.accent });
      setSaved(true);
      window.setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      setSubmitError(
        extractSettingsError(err, "Failed to save appearance settings."),
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white border border-line rounded-card p-16 flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-muted" />
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="bg-white border border-line rounded-card p-10 text-center">
        <AlertCircle className="w-8 h-8 mx-auto text-red-500" strokeWidth={1.5} />
        <p className="mt-3 text-sm font-medium text-ink">
          Couldn't load appearance settings
        </p>
        <p className="mt-1 text-[12.5px] text-muted">{loadError}</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <SettingCard
        title="Theme"
        description="Choose how the portal looks. Changes apply instantly across the app."
        icon={Sun}
      >
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {THEME_OPTIONS.map((opt) => {
            const Icon = opt.icon;
            const active = form.mode === opt.value;
            return (
              <button
                type="button"
                key={opt.value}
                onClick={() => setMode(opt.value)}
                aria-pressed={active}
                className={cn(
                  "p-4 rounded-card border text-left transition-all",
                  active
                    ? "border-transparent shadow-sm text-white"
                    : "border-line bg-white hover:border-ink-soft",
                )}
                style={
                  active
                    ? { backgroundColor: "var(--color-accent)" }
                    : undefined
                }
              >
                <div className="flex items-center justify-between">
                  <span
                    className={cn(
                      "w-9 h-9 rounded-[8px] flex items-center justify-center",
                      active
                        ? "bg-white/15 text-white"
                        : "bg-line-soft text-ink",
                    )}
                  >
                    <Icon className="w-4 h-4" strokeWidth={1.75} />
                  </span>
                  {active && (
                    <CheckCircle2 className="w-4 h-4" strokeWidth={2} />
                  )}
                </div>
                <p
                  className={cn(
                    "mt-3 text-[13px] font-semibold",
                    active ? "text-white" : "text-ink",
                  )}
                >
                  {opt.label}
                </p>
                <p
                  className={cn(
                    "text-[11px] mt-0.5",
                    active ? "text-white/80" : "text-muted",
                  )}
                >
                  {opt.description}
                </p>
              </button>
            );
          })}
        </div>
        {form.mode === "system" && (
          <p className="mt-3 text-[11px] text-muted-2">
            Currently rendering in{" "}
            <span className="font-semibold text-ink">
              {theme.resolvedDark ? "dark" : "light"}
            </span>{" "}
            mode based on your device.
          </p>
        )}
      </SettingCard>

      <SettingCard
        title="Language"
        description="The language used throughout the portal interface."
        icon={Languages}
      >
        <SettingRow
          label="Display Language"
          description="Some areas may require a refresh for translations to apply fully."
          className="pt-0"
        >
          <select
            value={form.language}
            onChange={(e) => setLanguage(e.target.value as AppearanceLanguage)}
            className="field w-56"
          >
            {LANGUAGES.map((l) => (
              <option key={l.value} value={l.value}>
                {l.label} — {l.region}
              </option>
            ))}
          </select>
        </SettingRow>
      </SettingCard>

      <SettingCard
        title="Accent Color"
        description="Pick a brand accent. Buttons, tabs, and active states pick it up immediately."
        icon={Palette}
      >
        <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
          {ACCENT_COLORS.map((c) => {
            const active = form.accent.toLowerCase() === c.value.toLowerCase();
            return (
              <button
                type="button"
                key={c.value}
                onClick={() => setAccent(c.value)}
                className="flex flex-col items-center gap-1.5 group"
                aria-label={c.label}
                aria-pressed={active}
              >
                <span
                  className={cn(
                    "w-10 h-10 rounded-full border-2 flex items-center justify-center transition-transform group-hover:scale-105",
                    active ? "border-ink" : "border-transparent",
                  )}
                >
                  <span
                    className="w-7 h-7 rounded-full"
                    style={{ backgroundColor: c.value }}
                  />
                </span>
                <span
                  className={cn(
                    "text-[10px] font-medium",
                    active ? "text-ink" : "text-muted",
                  )}
                >
                  {c.label}
                </span>
              </button>
            );
          })}
        </div>

        <div className="mt-5 pt-5 border-t border-line">
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted mb-3">
            Preview
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <button type="button" className="btn-primary">
              Primary Action
            </button>
            <button type="button" className="btn-secondary">
              Secondary
            </button>
            <span
              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold text-white"
              style={{ backgroundColor: "var(--color-accent)" }}
            >
              Active Badge
            </span>
            <a
              href="#preview"
              onClick={(e) => e.preventDefault()}
              className="text-[12px] font-semibold underline decoration-2 underline-offset-2"
              style={{ color: "var(--color-accent)" }}
            >
              Sample Link
            </a>
          </div>
        </div>
      </SettingCard>

      {submitError && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-card px-4 py-2.5 flex items-center gap-2 text-[12.5px] font-medium">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" strokeWidth={2} />
          {submitError}
        </div>
      )}

      <div className="flex items-center justify-end gap-3">
        {saved && (
          <span className="inline-flex items-center gap-1.5 text-[12px] text-(--color-success-fg)">
            <CheckCircle2 className="w-3.5 h-3.5" strokeWidth={2} />
            Appearance saved
          </span>
        )}
        <button
          onClick={onSave}
          disabled={saving || !isDirty}
          className="btn-primary min-w-[160px]"
        >
          {saving ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              Saving…
            </>
          ) : (
            <>
              <Save className="w-3.5 h-3.5" strokeWidth={2} />
              Save Appearance
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default AppearanceTab;
