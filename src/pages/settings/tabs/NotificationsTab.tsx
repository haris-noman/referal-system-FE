import { useState } from "react";
import {
  Bell,
  Mail,
  CheckCircle2,
  UserPlus,
  DollarSign,
  BarChart3,
  Save,
  Loader2,
} from "lucide-react";
import { SettingCard, SettingRow } from "../../../components/settings/SettingCard";
import Toggle from "../../../components/ui/Toggle";

const DEFAULTS = {
  emailMaster: true,
  referralApproval: true,
  newReferral: true,
  commissionPayment: true,
  weeklySummary: false,
};

type Pref = keyof typeof DEFAULTS;

const ROWS: {
  key: Pref;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
}[] = [
  {
    key: "emailMaster",
    label: "Email Notifications",
    description: "Master switch for all transactional and marketing emails.",
    icon: Mail,
  },
  {
    key: "referralApproval",
    label: "Referral Approval Alerts",
    description: "Get notified the moment one of your referrals is approved or rejected.",
    icon: CheckCircle2,
  },
  {
    key: "newReferral",
    label: "New Referral Alerts",
    description: "Receive updates when a new referral is submitted under your account.",
    icon: UserPlus,
  },
  {
    key: "commissionPayment",
    label: "Commission Payment Alerts",
    description: "Be notified when a commission payout is initiated or completed.",
    icon: DollarSign,
  },
  {
    key: "weeklySummary",
    label: "Weekly Summary Reports",
    description: "Curated weekly digest with referral activity, conversion, and earnings.",
    icon: BarChart3,
  },
];

const NotificationsTab = () => {
  const [prefs, setPrefs] = useState(DEFAULTS);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const update = (key: Pref, value: boolean) => {
    setPrefs((p) => ({ ...p, [key]: value }));
    setSaved(false);
  };

  const onSave = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 600));
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const masterOff = !prefs.emailMaster;

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
            const isMaster = row.key === "emailMaster";
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

      <div className="flex items-center justify-end gap-3">
        {saved && (
          <span className="inline-flex items-center gap-1.5 text-[12px] text-(--color-success-fg)">
            <CheckCircle2 className="w-3.5 h-3.5" strokeWidth={2} />
            Preferences saved
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
              Save Preferences
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default NotificationsTab;
