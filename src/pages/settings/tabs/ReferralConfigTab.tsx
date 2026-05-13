import { useEffect, useState } from "react";
import {
  Percent,
  Wallet,
  Calendar,
  Zap,
  Coins,
  Save,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Lock,
} from "lucide-react";
import { cn } from "../../../lib/utils";
import { SettingCard, Field, SettingRow } from "../../../components/settings/SettingCard";
import Toggle from "../../../components/ui/Toggle";
import {
  settingsApi,
  extractSettingsError,
  type ApiReferralConfig,
  type ReferralCurrency,
} from "../../../lib/settingsApi";

const CURRENCIES: { value: ReferralCurrency; label: string; symbol: string }[] = [
  { value: "USD", label: "US Dollar", symbol: "$" },
  { value: "AUD", label: "Australian Dollar", symbol: "A$" },
  { value: "USDT", label: "Tether (Stablecoin)", symbol: "₮" },
];

type FormState = {
  commission_rate: string;
  min_withdrawal_amount: string;
  referral_expiry_days: string;
  auto_approval: boolean;
  currency: ReferralCurrency;
};

const apiToForm = (data: ApiReferralConfig): FormState => ({
  commission_rate: data.commission_rate ?? "",
  min_withdrawal_amount: data.min_withdrawal_amount ?? "",
  referral_expiry_days:
    data.referral_expiry_days != null
      ? String(data.referral_expiry_days)
      : "",
  auto_approval: !!data.auto_approval,
  currency: data.currency ?? "USD",
});

const ReferralConfigTab = () => {
  const [form, setForm] = useState<FormState | null>(null);
  const [original, setOriginal] = useState<FormState | null>(null);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>(
    {},
  );
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [forbidden, setForbidden] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(true);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("user");
      if (raw) {
        const parsed = JSON.parse(raw);
        setIsAdmin(parsed.role === "admin");
      }
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await settingsApi.referralConfig.get();
        if (cancelled) return;
        const next = apiToForm(data);
        setForm(next);
        setOriginal(next);
      } catch (err) {
        if (cancelled) return;
        const status = (err as { response?: { status?: number } })?.response
          ?.status;
        if (status === 403) {
          setForbidden(true);
        } else {
          setLoadError(
            extractSettingsError(err, "Failed to load referral configuration."),
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((p) => (p ? { ...p, [key]: value } : p));
    if (errors[key]) setErrors((p) => ({ ...p, [key]: undefined }));
    setSaved(false);
    setSubmitError(null);
  };

  const currency =
    form && CURRENCIES.find((c) => c.value === form.currency);

  const validate = (state: FormState): boolean => {
    const next: typeof errors = {};
    const rate = Number(state.commission_rate);
    if (state.commission_rate.trim() === "" || Number.isNaN(rate))
      next.commission_rate = "Enter a numeric rate.";
    else if (rate < 0 || rate > 100)
      next.commission_rate = "Rate must be between 0 and 100.";

    const min = Number(state.min_withdrawal_amount);
    if (state.min_withdrawal_amount.trim() === "" || Number.isNaN(min))
      next.min_withdrawal_amount = "Enter a numeric amount.";
    else if (min < 0) next.min_withdrawal_amount = "Cannot be negative.";

    const days = Number(state.referral_expiry_days);
    if (state.referral_expiry_days.trim() === "" || Number.isNaN(days))
      next.referral_expiry_days = "Enter a number of days.";
    else if (days < 1 || days > 365)
      next.referral_expiry_days = "Choose between 1 and 365 days.";

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const isDirty =
    !!form &&
    !!original &&
    (Object.keys(form) as (keyof FormState)[]).some(
      (k) => form[k] !== original[k],
    );

  const onSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form) return;
    if (!validate(form)) return;
    setSaving(true);
    setSubmitError(null);
    try {
      const updated = await settingsApi.referralConfig.update({
        commission_rate: form.commission_rate,
        min_withdrawal_amount: form.min_withdrawal_amount,
        referral_expiry_days: Number(form.referral_expiry_days),
        auto_approval: form.auto_approval,
        currency: form.currency,
      });
      const next = apiToForm(updated);
      setForm(next);
      setOriginal(next);
      setSaved(true);
      window.setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      const status = (err as { response?: { status?: number } })?.response
        ?.status;
      setSubmitError(
        status === 403
          ? "Only administrators can update referral configuration."
          : extractSettingsError(err, "Failed to save configuration."),
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

  if (forbidden) {
    return (
      <div className="bg-white border border-line rounded-card p-10 text-center">
        <div className="w-12 h-12 mx-auto rounded-full bg-line-soft flex items-center justify-center">
          <Lock className="w-5 h-5 text-muted" strokeWidth={1.75} />
        </div>
        <p className="mt-3 text-sm font-semibold text-ink">
          Admins only
        </p>
        <p className="mt-1 text-[12.5px] text-muted max-w-md mx-auto">
          Referral configuration is managed by administrators. Reach out to an
          admin to request changes.
        </p>
      </div>
    );
  }

  if (loadError || !form) {
    return (
      <div className="bg-white border border-line rounded-card p-10 text-center">
        <AlertCircle className="w-8 h-8 mx-auto text-red-500" strokeWidth={1.5} />
        <p className="mt-3 text-sm font-medium text-ink">
          Couldn't load referral configuration
        </p>
        <p className="mt-1 text-[12.5px] text-muted">
          {loadError ?? "Unexpected error."}
        </p>
      </div>
    );
  }

  const readOnly = !isAdmin;

  return (
    <form onSubmit={onSave} className="space-y-5" noValidate>
      {readOnly && (
        <div className="bg-line-soft border border-line rounded-card px-4 py-2.5 flex items-center gap-2 text-[12.5px] text-muted">
          <Lock className="w-3.5 h-3.5 shrink-0" strokeWidth={2} />
          You're viewing the current configuration. Only administrators can save
          changes.
        </div>
      )}

      <SettingCard
        title="Commission & Payouts"
        description="Govern how commissions are calculated and when partners can withdraw."
        icon={Percent}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Field
            label="Commission Rate (%)"
            required
            error={errors.commission_rate}
          >
            <div className="relative">
              <input
                type="number"
                min={0}
                max={100}
                step={0.01}
                disabled={readOnly}
                className={cn(
                  "field pr-9 disabled:bg-line-soft/40 disabled:cursor-not-allowed",
                  errors.commission_rate && "border-red-500",
                )}
                value={form.commission_rate}
                onChange={(e) => update("commission_rate", e.target.value)}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-2 text-sm">
                %
              </span>
            </div>
          </Field>

          <Field
            label="Minimum Withdrawal Amount"
            required
            error={errors.min_withdrawal_amount}
            hint={`Partners must reach this amount before withdrawing in ${form.currency}.`}
          >
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted text-sm">
                {currency?.symbol}
              </span>
              <input
                type="number"
                min={0}
                step={0.01}
                disabled={readOnly}
                className={cn(
                  "field pl-7 disabled:bg-line-soft/40 disabled:cursor-not-allowed",
                  errors.min_withdrawal_amount && "border-red-500",
                )}
                value={form.min_withdrawal_amount}
                onChange={(e) =>
                  update("min_withdrawal_amount", e.target.value)
                }
              />
            </div>
          </Field>
        </div>
      </SettingCard>

      <SettingCard
        title="Referral Lifecycle"
        description="Control how long a referral stays valid and whether it auto-approves."
        icon={Calendar}
      >
        <div className="space-y-1">
          <SettingRow
            label="Referral Expiry"
            description="Number of days a pending referral remains valid before auto-expiring."
            className="pt-0"
          >
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={1}
                max={365}
                disabled={readOnly}
                className={cn(
                  "field w-24 text-right disabled:bg-line-soft/40 disabled:cursor-not-allowed",
                  errors.referral_expiry_days && "border-red-500",
                )}
                value={form.referral_expiry_days}
                onChange={(e) =>
                  update("referral_expiry_days", e.target.value)
                }
              />
              <span className="text-[12px] text-muted">days</span>
            </div>
          </SettingRow>
          {errors.referral_expiry_days && (
            <p className="flex items-center gap-1 text-[11px] text-red-600 pl-1">
              <AlertCircle className="w-3 h-3" strokeWidth={2} />
              {errors.referral_expiry_days}
            </p>
          )}

          <SettingRow
            label="Auto-Approve Verified Partners"
            description="Skip manual review for referrals submitted by partners with a clean track record."
          >
            <div className="flex items-center gap-3">
              <span className="hidden md:inline-flex items-center gap-1 text-[11px] font-semibold text-muted">
                <Zap className="w-3 h-3" strokeWidth={2} />
                Faster payouts
              </span>
              <Toggle
                checked={form.auto_approval}
                onChange={(v) => update("auto_approval", v)}
                disabled={readOnly}
              />
            </div>
          </SettingRow>
        </div>
      </SettingCard>

      <SettingCard
        title="Currency"
        description="The default currency used for displaying values and processing withdrawals."
        icon={Coins}
      >
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {CURRENCIES.map((c) => {
            const active = form.currency === c.value;
            return (
              <button
                type="button"
                key={c.value}
                onClick={() => !readOnly && update("currency", c.value)}
                disabled={readOnly}
                className={cn(
                  "p-4 rounded-card border text-left transition-all disabled:cursor-not-allowed",
                  active
                    ? "border-ink bg-ink text-white shadow-sm"
                    : "border-line bg-white hover:border-ink-soft disabled:hover:border-line",
                )}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={cn(
                      "w-9 h-9 rounded-[8px] flex items-center justify-center text-[15px] font-bold",
                      active
                        ? "bg-white/15 text-white"
                        : "bg-line-soft text-ink",
                    )}
                  >
                    {c.symbol}
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
                  {c.value}
                </p>
                <p
                  className={cn(
                    "text-[11px] mt-0.5",
                    active ? "text-white/80" : "text-muted",
                  )}
                >
                  {c.label}
                </p>
              </button>
            );
          })}
        </div>
      </SettingCard>

      <SettingCard
        title="Preview"
        description="A quick summary of how these settings will apply to new referrals."
        icon={Wallet}
      >
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Commission", value: `${form.commission_rate || 0}%` },
            {
              label: "Min Withdrawal",
              value: `${currency?.symbol ?? ""}${Number(form.min_withdrawal_amount || 0).toLocaleString()}`,
            },
            { label: "Expiry", value: `${form.referral_expiry_days || 0}d` },
            { label: "Currency", value: form.currency },
          ].map((item) => (
            <div
              key={item.label}
              className="bg-line-soft/60 border border-line rounded-[8px] px-4 py-3"
            >
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted">
                {item.label}
              </p>
              <p className="mt-1 text-[16px] font-bold text-ink tracking-tight">
                {item.value}
              </p>
            </div>
          ))}
        </div>
      </SettingCard>

      {submitError && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-card px-4 py-2.5 flex items-center gap-2 text-[12.5px] font-medium">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" strokeWidth={2} />
          {submitError}
        </div>
      )}

      {!readOnly && (
        <div className="flex items-center justify-end gap-3">
          {saved && (
            <span className="inline-flex items-center gap-1.5 text-[12px] text-(--color-success-fg)">
              <CheckCircle2 className="w-3.5 h-3.5" strokeWidth={2} />
              Configuration saved
            </span>
          )}
          <button
            type="submit"
            disabled={saving || !isDirty}
            className="btn-primary min-w-[180px]"
          >
            {saving ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Saving…
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" strokeWidth={2} />
                Save Configuration
              </>
            )}
          </button>
        </div>
      )}
    </form>
  );
};

export default ReferralConfigTab;
