import { useState } from "react";
import {
  Sun,
  Moon,
  Monitor,
  Languages,
  Palette,
  Save,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { cn } from "../../../lib/utils";
import { SettingCard, SettingRow } from "../../../components/settings/SettingCard";

const THEME_OPTIONS = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor },
] as const;

const LANGUAGES = [
  { value: "en", label: "English", region: "United States" },
  { value: "es", label: "Español", region: "España" },
  { value: "fr", label: "Français", region: "France" },
  { value: "de", label: "Deutsch", region: "Deutschland" },
  { value: "zh", label: "中文", region: "中国" },
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

const AppearanceTab = () => {
  const [theme, setTheme] = useState<(typeof THEME_OPTIONS)[number]["value"]>(
    "light",
  );
  const [language, setLanguage] = useState("en");
  const [accent, setAccent] = useState(ACCENT_COLORS[0].value);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const onSave = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 600));
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="space-y-5">
      <SettingCard
        title="Theme"
        description="Choose how the portal looks. System matches your device setting automatically."
        icon={Sun}
      >
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {THEME_OPTIONS.map((opt) => {
            const Icon = opt.icon;
            const active = theme === opt.value;
            return (
              <button
                type="button"
                key={opt.value}
                onClick={() => {
                  setTheme(opt.value);
                  setSaved(false);
                }}
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
                      active ? "bg-white/15 text-white" : "bg-line-soft text-ink",
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
          description="Restart may be required for some areas to fully translate."
          className="pt-0"
        >
          <select
            value={language}
            onChange={(e) => {
              setLanguage(e.target.value);
              setSaved(false);
            }}
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
        description="Pick a brand accent. The current accent is shown beside each option."
        icon={Palette}
      >
        <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
          {ACCENT_COLORS.map((c) => {
            const active = accent === c.value;
            return (
              <button
                type="button"
                key={c.value}
                onClick={() => {
                  setAccent(c.value);
                  setSaved(false);
                }}
                className="flex flex-col items-center gap-1.5 group"
                aria-label={c.label}
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

      <div className="flex items-center justify-end gap-3">
        {saved && (
          <span className="inline-flex items-center gap-1.5 text-[12px] text-(--color-success-fg)">
            <CheckCircle2 className="w-3.5 h-3.5" strokeWidth={2} />
            Appearance saved
          </span>
        )}
        <button onClick={onSave} disabled={saving} className="btn-primary min-w-[160px]">
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
