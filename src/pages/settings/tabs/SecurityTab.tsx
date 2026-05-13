import { useMemo, useState } from "react";
import {
  Shield,
  Lock,
  Smartphone,
  Monitor,
  Tablet,
  LogOut,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Save,
} from "lucide-react";
import { cn } from "../../../lib/utils";
import { SettingCard, Field, SettingRow } from "../../../components/settings/SettingCard";
import Toggle from "../../../components/ui/Toggle";
import Modal from "../../../components/ui/Modal";

type Session = {
  id: string;
  device: "desktop" | "mobile" | "tablet";
  label: string;
  location: string;
  lastActive: string;
  current?: boolean;
};

const SESSIONS: Session[] = [
  {
    id: "s-1",
    device: "desktop",
    label: "Chrome on macOS",
    location: "San Francisco, US",
    lastActive: "Active now",
    current: true,
  },
  {
    id: "s-2",
    device: "mobile",
    label: "Safari on iPhone 15",
    location: "San Francisco, US",
    lastActive: "2 hours ago",
  },
  {
    id: "s-3",
    device: "tablet",
    label: "Chrome on iPad Air",
    location: "Oakland, US",
    lastActive: "Yesterday",
  },
  {
    id: "s-4",
    device: "desktop",
    label: "Firefox on Windows",
    location: "Austin, US",
    lastActive: "3 days ago",
  },
];

const DEVICE_ICON = {
  desktop: Monitor,
  mobile: Smartphone,
  tablet: Tablet,
} as const;

const scorePassword = (pw: string): { score: 0 | 1 | 2 | 3 | 4; label: string; tone: string } => {
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
  if (/\d/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  const map = [
    { label: "Too weak", tone: "bg-red-500" },
    { label: "Weak", tone: "bg-orange-500" },
    { label: "Fair", tone: "bg-amber-500" },
    { label: "Strong", tone: "bg-emerald-500" },
    { label: "Excellent", tone: "bg-emerald-600" },
  ] as const;
  return { score: score as 0 | 1 | 2 | 3 | 4, ...map[score] };
};

const SecurityTab = () => {
  const [pw, setPw] = useState({ current: "", next: "", confirm: "" });
  const [pwErrors, setPwErrors] = useState<Partial<Record<keyof typeof pw, string>>>({});
  const [reveal, setReveal] = useState({ current: false, next: false, confirm: false });
  const [pwSaving, setPwSaving] = useState(false);
  const [pwSaved, setPwSaved] = useState(false);

  const [twoFA, setTwoFA] = useState(true);
  const [sessions, setSessions] = useState(SESSIONS);
  const [confirmLogout, setConfirmLogout] = useState(false);

  const strength = useMemo(() => scorePassword(pw.next), [pw.next]);

  const updatePw = <K extends keyof typeof pw>(key: K, value: string) => {
    setPw((p) => ({ ...p, [key]: value }));
    if (pwErrors[key]) setPwErrors((p) => ({ ...p, [key]: undefined }));
    setPwSaved(false);
  };

  const onChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const next: typeof pwErrors = {};
    if (!pw.current) next.current = "Enter your current password.";
    if (pw.next.length < 8) next.next = "Use at least 8 characters.";
    if (pw.next !== pw.confirm) next.confirm = "Passwords don't match.";
    setPwErrors(next);
    if (Object.keys(next).length) return;

    setPwSaving(true);
    await new Promise((r) => setTimeout(r, 700));
    setPwSaving(false);
    setPw({ current: "", next: "", confirm: "" });
    setPwSaved(true);
    setTimeout(() => setPwSaved(false), 2500);
  };

  const revokeSession = (id: string) => {
    setSessions((s) => s.filter((sess) => sess.id !== id));
  };

  const logoutAll = () => {
    setSessions((s) => s.filter((sess) => sess.current));
    setConfirmLogout(false);
  };

  return (
    <div className="space-y-5">
      <SettingCard
        title="Change Password"
        description="Use a strong, unique password that you don't use elsewhere."
        icon={Lock}
      >
        <form onSubmit={onChangePassword} className="space-y-4" noValidate>
          {(["current", "next", "confirm"] as const).map((key) => {
            const label =
              key === "current"
                ? "Current Password"
                : key === "next"
                  ? "New Password"
                  : "Confirm New Password";
            return (
              <Field
                key={key}
                label={label}
                required
                error={pwErrors[key]}
                className="max-w-md"
              >
                <div className="relative">
                  <input
                    type={reveal[key] ? "text" : "password"}
                    className={cn("field pr-10", pwErrors[key] && "border-red-500")}
                    value={pw[key]}
                    onChange={(e) => updatePw(key, e.target.value)}
                    autoComplete={key === "current" ? "current-password" : "new-password"}
                  />
                  <button
                    type="button"
                    onClick={() => setReveal((r) => ({ ...r, [key]: !r[key] }))}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-full text-muted-2 hover:text-ink hover:bg-line-soft transition-colors"
                    aria-label={reveal[key] ? "Hide password" : "Show password"}
                  >
                    {reveal[key] ? (
                      <EyeOff className="w-3.5 h-3.5" strokeWidth={2} />
                    ) : (
                      <Eye className="w-3.5 h-3.5" strokeWidth={2} />
                    )}
                  </button>
                </div>
                {key === "next" && pw.next && (
                  <div className="space-y-1">
                    <div className="flex gap-1">
                      {[0, 1, 2, 3].map((i) => (
                        <span
                          key={i}
                          className={cn(
                            "h-1 flex-1 rounded-full transition-colors",
                            i < strength.score ? strength.tone : "bg-line",
                          )}
                        />
                      ))}
                    </div>
                    <p className="text-[11px] text-muted">{strength.label}</p>
                  </div>
                )}
              </Field>
            );
          })}

          <div className="flex items-center gap-3 pt-1">
            {pwSaved && (
              <span className="inline-flex items-center gap-1.5 text-[12px] text-(--color-success-fg)">
                <CheckCircle2 className="w-3.5 h-3.5" strokeWidth={2} />
                Password updated
              </span>
            )}
            <button
              type="submit"
              disabled={pwSaving}
              className="btn-primary min-w-[160px] ml-auto"
            >
              {pwSaving ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Updating…
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" strokeWidth={2} />
                  Update Password
                </>
              )}
            </button>
          </div>
        </form>
      </SettingCard>

      <SettingCard
        title="Two-Factor Authentication"
        description="Add an extra layer of protection by requiring a code at sign-in."
        icon={Shield}
      >
        <SettingRow
          label={twoFA ? "Two-factor is enabled" : "Two-factor is disabled"}
          description={
            twoFA
              ? "Codes are delivered through your authenticator app."
              : "Enable to protect your account from unauthorized access."
          }
        >
          <div className="flex items-center gap-3">
            <span
              className={cn(
                "px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-[0.08em]",
                twoFA
                  ? "bg-(--color-success-bg) text-(--color-success-fg)"
                  : "bg-(--color-neutral-bg) text-(--color-neutral-fg)",
              )}
            >
              {twoFA ? "On" : "Off"}
            </span>
            <Toggle checked={twoFA} onChange={setTwoFA} />
          </div>
        </SettingRow>
      </SettingCard>

      <SettingCard
        title="Login Sessions"
        description="Devices that are currently signed in to your account."
        icon={Monitor}
        actions={
          <button
            type="button"
            onClick={() => setConfirmLogout(true)}
            className="btn-secondary"
          >
            <LogOut className="w-3.5 h-3.5" strokeWidth={2} />
            Logout All Devices
          </button>
        }
      >
        <ul className="divide-y divide-line">
          {sessions.map((s) => {
            const Icon = DEVICE_ICON[s.device];
            return (
              <li key={s.id} className="flex items-center gap-4 py-3.5 first:pt-0 last:pb-0">
                <div className="w-9 h-9 rounded-[8px] bg-line-soft text-ink flex items-center justify-center shrink-0">
                  <Icon className="w-4 h-4" strokeWidth={1.75} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-[13px] font-semibold text-ink truncate">
                      {s.label}
                    </p>
                    {s.current && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-[0.08em] bg-(--color-success-bg) text-(--color-success-fg)">
                        Current
                      </span>
                    )}
                  </div>
                  <p className="text-[12px] text-muted">
                    {s.location} · {s.lastActive}
                  </p>
                </div>
                {!s.current && (
                  <button
                    type="button"
                    onClick={() => revokeSession(s.id)}
                    className="text-[12px] font-medium text-muted hover:text-red-600 transition-colors"
                  >
                    Revoke
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      </SettingCard>

      <Modal
        open={confirmLogout}
        onClose={() => setConfirmLogout(false)}
        title="Logout from all devices?"
        description="You'll stay signed in on this device. All other sessions will end immediately."
        icon={AlertCircle}
        iconTone="bg-(--color-danger-bg) text-(--color-danger-fg)"
        size="sm"
        footer={
          <>
            <button
              type="button"
              onClick={() => setConfirmLogout(false)}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={logoutAll}
              className="inline-flex items-center justify-center gap-2 rounded-[6px] px-4 py-2.5 text-[12px] font-semibold uppercase tracking-[0.08em] transition-colors bg-red-600 hover:bg-red-700 text-white"
            >
              <LogOut className="w-3.5 h-3.5" strokeWidth={2} />
              Logout All
            </button>
          </>
        }
      >
        <p className="text-[13px] text-muted">
          {sessions.filter((s) => !s.current).length} other session
          {sessions.filter((s) => !s.current).length === 1 ? "" : "s"} will be
          revoked.
        </p>
      </Modal>
    </div>
  );
};

export default SecurityTab;
