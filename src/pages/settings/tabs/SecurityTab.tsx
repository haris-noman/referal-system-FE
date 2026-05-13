import { useCallback, useEffect, useMemo, useState } from "react";
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
import {
  settingsApi,
  extractSettingsError,
  type ApiSession,
} from "../../../lib/settingsApi";

type DeviceKind = "desktop" | "mobile" | "tablet";

const DEVICE_ICON: Record<DeviceKind, React.ComponentType<{ className?: string; strokeWidth?: number }>> = {
  desktop: Monitor,
  mobile: Smartphone,
  tablet: Tablet,
};

const detectDevice = (info: string): DeviceKind => {
  const s = info.toLowerCase();
  if (/(ipad|tablet)/.test(s)) return "tablet";
  if (/(iphone|android|mobile|phone)/.test(s)) return "mobile";
  return "desktop";
};

const relativeTime = (iso: string): string => {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const diff = Date.now() - d.getTime();
  const min = Math.round(diff / 60_000);
  if (min < 1) return "Just now";
  if (min < 60) return `${min} min ago`;
  const hr = Math.round(min / 60);
  if (hr < 24) return `${hr} hour${hr === 1 ? "" : "s"} ago`;
  const day = Math.round(hr / 24);
  if (day < 30) return `${day} day${day === 1 ? "" : "s"} ago`;
  return d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const scorePassword = (
  pw: string,
): { score: 0 | 1 | 2 | 3 | 4; label: string; tone: string } => {
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

type PwState = { current: string; next: string; confirm: string };

const SecurityTab = () => {
  // Password
  const [pw, setPw] = useState<PwState>({ current: "", next: "", confirm: "" });
  const [pwErrors, setPwErrors] = useState<
    Partial<Record<keyof PwState, string>>
  >({});
  const [reveal, setReveal] = useState({
    current: false,
    next: false,
    confirm: false,
  });
  const [pwSaving, setPwSaving] = useState(false);
  const [pwSaved, setPwSaved] = useState(false);
  const [pwError, setPwError] = useState<string | null>(null);

  // 2FA
  const [twoFA, setTwoFA] = useState<boolean | null>(null);
  const [twoFASaving, setTwoFASaving] = useState(false);
  const [twoFAError, setTwoFAError] = useState<string | null>(null);

  // Sessions
  const [sessions, setSessions] = useState<ApiSession[]>([]);
  const [sessionsLoading, setSessionsLoading] = useState(true);
  const [sessionsError, setSessionsError] = useState<string | null>(null);
  const [confirmLogout, setConfirmLogout] = useState(false);
  const [logoutBusy, setLogoutBusy] = useState(false);

  const fetchSessions = useCallback(async () => {
    setSessionsLoading(true);
    setSessionsError(null);
    try {
      const page = await settingsApi.sessions.list();
      setSessions(page.results.filter((s) => s.is_active));
    } catch (err) {
      setSessionsError(
        extractSettingsError(err, "Failed to load active sessions."),
      );
    } finally {
      setSessionsLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await settingsApi.twoFactor.get();
        if (!cancelled) setTwoFA(data.two_factor_enabled);
      } catch (err) {
        if (!cancelled)
          setTwoFAError(
            extractSettingsError(err, "Failed to load 2FA status."),
          );
      }
    })();
    fetchSessions();
    return () => {
      cancelled = true;
    };
  }, [fetchSessions]);

  const strength = useMemo(() => scorePassword(pw.next), [pw.next]);

  const updatePw = (key: keyof PwState, value: string) => {
    setPw((p) => ({ ...p, [key]: value }));
    if (pwErrors[key]) setPwErrors((p) => ({ ...p, [key]: undefined }));
    setPwSaved(false);
    setPwError(null);
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
    setPwError(null);
    try {
      await settingsApi.changePassword({
        current_password: pw.current,
        new_password: pw.next,
        confirm_password: pw.confirm,
      });
      setPw({ current: "", next: "", confirm: "" });
      setPwSaved(true);
      window.setTimeout(() => setPwSaved(false), 2500);
    } catch (err) {
      setPwError(extractSettingsError(err, "Failed to change password."));
    } finally {
      setPwSaving(false);
    }
  };

  const toggleTwoFA = async (value: boolean) => {
    const previous = twoFA;
    setTwoFA(value);
    setTwoFASaving(true);
    setTwoFAError(null);
    try {
      const data = await settingsApi.twoFactor.set(value);
      setTwoFA(data.two_factor_enabled);
    } catch (err) {
      setTwoFA(previous ?? false);
      setTwoFAError(
        extractSettingsError(err, "Failed to update 2FA setting."),
      );
    } finally {
      setTwoFASaving(false);
    }
  };

  const logoutAll = async () => {
    setLogoutBusy(true);
    try {
      await settingsApi.sessions.logoutAll();
      setConfirmLogout(false);
      fetchSessions();
    } catch (err) {
      setSessionsError(
        extractSettingsError(err, "Failed to log out all devices."),
      );
    } finally {
      setLogoutBusy(false);
    }
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
                    className={cn(
                      "field pr-10",
                      pwErrors[key] && "border-red-500",
                    )}
                    value={pw[key]}
                    onChange={(e) => updatePw(key, e.target.value)}
                    autoComplete={
                      key === "current" ? "current-password" : "new-password"
                    }
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setReveal((r) => ({ ...r, [key]: !r[key] }))
                    }
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

          {pwError && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-[6px] px-3 py-2 flex items-center gap-2 text-[12px] max-w-md">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" strokeWidth={2} />
              {pwError}
            </div>
          )}

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
        description="Add an extra layer of protection by requiring a one-time code at sign-in."
        icon={Shield}
      >
        <SettingRow
          label={twoFA ? "Two-factor is enabled" : "Two-factor is disabled"}
          description={
            twoFA
              ? "We'll email a 6-digit code each time you sign in."
              : "Enable to protect your account from unauthorized access."
          }
        >
          <div className="flex items-center gap-3">
            {twoFA === null ? (
              <Loader2
                className="w-3.5 h-3.5 animate-spin text-muted"
                strokeWidth={2}
              />
            ) : (
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
            )}
            <Toggle
              checked={!!twoFA}
              onChange={toggleTwoFA}
              disabled={twoFA === null || twoFASaving}
            />
          </div>
        </SettingRow>
        {twoFAError && (
          <div className="mt-3 bg-red-50 border border-red-200 text-red-700 rounded-[6px] px-3 py-2 flex items-center gap-2 text-[12px]">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" strokeWidth={2} />
            {twoFAError}
          </div>
        )}
      </SettingCard>

      <SettingCard
        title="Login Sessions"
        description="Devices that are currently signed in to your account."
        icon={Monitor}
        actions={
          <button
            type="button"
            onClick={() => setConfirmLogout(true)}
            disabled={sessions.length === 0}
            className="btn-secondary disabled:opacity-60"
          >
            <LogOut className="w-3.5 h-3.5" strokeWidth={2} />
            Logout All Devices
          </button>
        }
      >
        {sessionsLoading ? (
          <div className="py-8 flex items-center justify-center">
            <Loader2 className="w-5 h-5 animate-spin text-muted" />
          </div>
        ) : sessionsError ? (
          <div className="py-8 text-center">
            <AlertCircle
              className="w-7 h-7 mx-auto text-red-500"
              strokeWidth={1.5}
            />
            <p className="mt-2 text-[13px] font-medium text-ink">
              Couldn't load sessions
            </p>
            <p className="text-[12px] text-muted">{sessionsError}</p>
            <button
              type="button"
              onClick={fetchSessions}
              className="btn-secondary mt-3"
            >
              Retry
            </button>
          </div>
        ) : sessions.length === 0 ? (
          <p className="py-6 text-center text-[12.5px] text-muted">
            No other active sessions.
          </p>
        ) : (
          <ul className="divide-y divide-line">
            {sessions.map((s) => {
              const kind = detectDevice(s.device_info);
              const Icon = DEVICE_ICON[kind];
              return (
                <li
                  key={s.id}
                  className="flex items-center gap-4 py-3.5 first:pt-0 last:pb-0"
                >
                  <div className="w-9 h-9 rounded-[8px] bg-line-soft text-ink flex items-center justify-center shrink-0">
                    <Icon className="w-4 h-4" strokeWidth={1.75} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-semibold text-ink truncate">
                      {s.device_info || "Unknown device"}
                    </p>
                    <p className="text-[12px] text-muted">
                      {s.ip_address ? `${s.ip_address} · ` : ""}Active{" "}
                      {relativeTime(s.last_activity)}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </SettingCard>

      <Modal
        open={confirmLogout}
        onClose={() => !logoutBusy && setConfirmLogout(false)}
        title="Logout from all devices?"
        description="All sessions will end immediately. You'll need to sign in again on this device too."
        icon={AlertCircle}
        iconTone="bg-(--color-danger-bg) text-(--color-danger-fg)"
        size="sm"
        closable={!logoutBusy}
        footer={
          <>
            <button
              type="button"
              onClick={() => setConfirmLogout(false)}
              disabled={logoutBusy}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={logoutAll}
              disabled={logoutBusy}
              className="inline-flex items-center justify-center gap-2 rounded-[6px] px-4 py-2.5 text-[12px] font-semibold uppercase tracking-[0.08em] transition-colors bg-red-600 hover:bg-red-700 text-white disabled:opacity-70"
            >
              {logoutBusy ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <LogOut className="w-3.5 h-3.5" strokeWidth={2} />
              )}
              Logout All
            </button>
          </>
        }
      >
        <p className="text-[13px] text-muted">
          {sessions.length} active session{sessions.length === 1 ? "" : "s"}{" "}
          will be revoked.
        </p>
      </Modal>
    </div>
  );
};

export default SecurityTab;
