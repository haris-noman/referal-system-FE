import { useEffect, useState } from "react";
import {
  Sun,
  Moon,
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

const THEME_OPTIONS = [
  { value: false, label: "Light", icon: Sun },
  { value: true, label: "Dark", icon: Moon },
] as const;

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

const DEFAULTS: ApiAppearance = {
  dark_mode: false,
  language: "en",
  theme_color: ACCENT_COLORS[0].value,
};

const AppearanceTab = () => {
  const [form, setForm] = useState<ApiAppearance>(DEFAULTS);
  const [original, setOriginal] = useState<ApiAppearance | null>(null);
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
        setForm(data);
        setOriginal(data);
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
  }, []);

  const update = <K extends keyof ApiAppearance>(
    key: K,
    value: ApiAppearance[K],
  ) => {
    setForm((p) => ({ ...p, [key]: value }));
    setSaved(false);
    setSubmitError(null);
  };

  const isDirty =
    !!original &&
    (Object.keys(form) as (keyof ApiAppearance)[]).some(
      (k) => form[k] !== original[k],
    );

  const onSave = async () => {
    setSaving(true);
    setSubmitError(null);
    try {
      const updated = await settingsApi.appearance.update(form);
      setForm(updated);
      setOriginal(updated);
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
        description="Choose how the portal looks across the network."
        icon={Sun}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {THEME_OPTIONS.map((opt) => {
            const Icon = opt.icon;
            const active = form.dark_mode === opt.value;
            return (
              <button
                type="button"
                key={opt.label}
                onClick={() => update("dark_mode", opt.value)}
                className={cn(
                  "p-4 rounded-card border text-left transition-all",
                  active
                    ? "border-ink bg-ink text-white shadow-sm"
                    : "border-line bg-white hover:border-ink-soft",
                )}
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
              </button>
            );
          })}
        </div>
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
            onChange={(e) =>
              update("language", e.target.value as AppearanceLanguage)
            }
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
        description="Pick a brand accent. The current accent is highlighted."
        icon={Palette}
      >
        <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
          {ACCENT_COLORS.map((c) => {
            const active = form.theme_color.toLowerCase() === c.value.toLowerCase();
            return (
              <button
                type="button"
                key={c.value}
                onClick={() => update("theme_color", c.value)}
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
