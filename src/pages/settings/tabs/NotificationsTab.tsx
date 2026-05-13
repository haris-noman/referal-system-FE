import { useEffect, useState } from "react";
import {
  Bell,
  Mail,
  CheckCircle2,
  UserPlus,
  DollarSign,
  BarChart3,
  Save,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { SettingCard, SettingRow } from "../../../components/settings/SettingCard";
import Toggle from "../../../components/ui/Toggle";
import {
  settingsApi,
  extractSettingsError,
  type ApiNotifications,
} from "../../../lib/settingsApi";

const DEFAULTS: ApiNotifications = {
  email_notifications: true,
  referral_approval_alerts: true,
  new_referral_alerts: true,
  commission_payment_alerts: true,
  weekly_summary_reports: false,
};

type Pref = keyof ApiNotifications;

const ROWS: {
  key: Pref;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
}[] = [
  {
    key: "email_notifications",
    label: "Email Notifications",
    description: "Master switch for all transactional and marketing emails.",
    icon: Mail,
  },
  {
    key: "referral_approval_alerts",
    label: "Referral Approval Alerts",
    description:
      "Get notified the moment one of your referrals is approved or rejected.",
    icon: CheckCircle2,
  },
  {
    key: "new_referral_alerts",
    label: "New Referral Alerts",
    description: "Receive updates when a new referral is submitted under your account.",
    icon: UserPlus,
  },
  {
    key: "commission_payment_alerts",
    label: "Commission Payment Alerts",
    description: "Be notified when a commission payout is initiated or completed.",
    icon: DollarSign,
  },
  {
    key: "weekly_summary_reports",
    label: "Weekly Summary Reports",
    description:
      "Curated weekly digest with referral activity, conversion, and earnings.",
    icon: BarChart3,
  },
];

const NotificationsTab = () => {
  const [prefs, setPrefs] = useState<ApiNotifications>(DEFAULTS);
  const [original, setOriginal] = useState<ApiNotifications | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await settingsApi.notifications.get();
        if (cancelled) return;
        setPrefs(data);
        setOriginal(data);
      } catch (err) {
        if (!cancelled)
          setLoadError(
            extractSettingsError(err, "Failed to load notification settings."),
          );
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const update = (key: Pref, value: boolean) => {
    setPrefs((p) => ({ ...p, [key]: value }));
    setSaved(false);
    setSubmitError(null);
  };

  const isDirty =
    !!original &&
    (Object.keys(prefs) as Pref[]).some((k) => prefs[k] !== original[k]);

  const onSave = async () => {
    setSaving(true);
    setSubmitError(null);
    try {
      const updated = await settingsApi.notifications.update(prefs);
      setPrefs(updated);
      setOriginal(updated);
      setSaved(true);
      window.setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      setSubmitError(
        extractSettingsError(err, "Failed to save notification settings."),
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
          Couldn't load notification settings
        </p>
        <p className="mt-1 text-[12.5px] text-muted">{loadError}</p>
      </div>
    );
  }

  const masterOff = !prefs.email_notifications;

  return (
    <div className="space-y-5">
      <SettingCard
        title="Notification Preferences"
        description="Choose what we email you about. The master switch controls all email notifications."
        icon={Bell}
      >
        <div className="divide-y divide-line">
          {ROWS.map((row, idx) => {
            const Icon = row.icon;
            const isMaster = row.key === "email_notifications";
            const disabled = !isMaster && masterOff;
            return (
              <SettingRow
                key={row.key}
                label={row.label}
                description={row.description}
                className={idx === 0 ? "pt-0" : ""}
              >
                <div className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-[6px] bg-line-soft text-ink flex items-center justify-center">
                    <Icon className="w-3.5 h-3.5" strokeWidth={1.75} />
                  </span>
                  <Toggle
                    checked={!disabled && prefs[row.key]}
                    onChange={(v) => update(row.key, v)}
                    disabled={disabled}
                  />
                </div>
              </SettingRow>
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
            Preferences saved
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
              Save Preferences
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default NotificationsTab;
