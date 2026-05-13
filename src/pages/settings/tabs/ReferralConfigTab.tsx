import { useState } from "react";
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
} from "lucide-react";
import { cn } from "../../../lib/utils";
import { SettingCard, Field, SettingRow } from "../../../components/settings/SettingCard";
import Toggle from "../../../components/ui/Toggle";

const CURRENCIES = [
  { value: "USD", label: "USD · US Dollar", symbol: "$" },
  { value: "AUD", label: "AUD · Australian Dollar", symbol: "A$" },
  { value: "USDT", label: "USDT · Tether (Stablecoin)", symbol: "₮" },
];

type FormState = {
  commissionRate: string;
  minWithdrawal: string;
  expiryDays: string;
  autoApprove: boolean;
  currency: string;
};

const INITIAL: FormState = {
  commissionRate: "5",
  minWithdrawal: "100",
  expiryDays: "30",
  autoApprove: false,
  currency: "USD",
};

const ReferralConfigTab = () => {
  const [form, setForm] = useState<FormState>(INITIAL);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((p) => ({ ...p, [key]: value }));
    if (errors[key]) setErrors((p) => ({ ...p, [key]: undefined }));
    setSaved(false);
  };

  const currency = CURRENCIES.find((c) => c.value === form.currency) ?? CURRENCIES[0];

  const validate = () => {
    const next: Partial<Record<keyof FormState, string>> = {};
    const rate = Number(form.commissionRate);
    if (form.commissionRate.trim() === "" || Number.isNaN(rate))
      next.commissionRate = "Enter a numeric rate.";
    else if (rate < 0 || rate > 100)
      next.commissionRate = "Rate must be between 0 and 100.";

    const min = Number(form.minWithdrawal);
    if (form.minWithdrawal.trim() === "" || Number.isNaN(min))
      next.minWithdrawal = "Enter a numeric amount.";
    else if (min < 0) next.minWithdrawal = "Cannot be negative.";

    const days = Number(form.expiryDays);
    if (form.expiryDays.trim() === "" || Number.isNaN(days))
      next.expiryDays = "Enter a number of days.";
    else if (days < 1 || days > 365)
      next.expiryDays = "Choose between 1 and 365 days.";

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const onSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    await new Promise((r) => setTimeout(r, 700));
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <form onSubmit={onSave} className="space-y-5" noValidate>
      <SettingCard
        title="Commission & Payouts"
        description="Govern how commissions are calculated and when partners can withdraw."
        icon={Percent}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Field label="Commission Rate (%)" required error={errors.commissionRate}>
            <div className="relative">
              <input
                type="number"
                min={0}
                max={100}
                step={0.01}
                className={cn("field pr-9", errors.commissionRate && "border-red-500")}
                value={form.commissionRate}
                onChange={(e) => update("commissionRate", e.target.value)}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-2 text-sm">
                %
              </span>
            </div>
          </Field>

          <Field
            label="Minimum Withdrawal Amount"
            required
            error={errors.minWithdrawal}
            hint={`Partners must reach this amount before withdrawing in ${currency.value}.`}
          >
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted text-sm">
                {currency.symbol}
              </span>
              <input
                type="number"
                min={0}
                step={1}
                className={cn(
                  "field pl-7",
                  errors.minWithdrawal && "border-red-500",
                )}
                value={form.minWithdrawal}
                onChange={(e) => update("minWithdrawal", e.target.value)}
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
                className={cn(
                  "field w-24 text-right",
                  errors.expiryDays && "border-red-500",
                )}
                value={form.expiryDays}
                onChange={(e) => update("expiryDays", e.target.value)}
              />
              <span className="text-[12px] text-muted">days</span>
            </div>
          </SettingRow>
          {errors.expiryDays && (
            <p className="flex items-center gap-1 text-[11px] text-red-600 pl-1">
              <AlertCircle className="w-3 h-3" strokeWidth={2} />
              {errors.expiryDays}
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
                checked={form.autoApprove}
                onChange={(v) => update("autoApprove", v)}
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
                onClick={() => update("currency", c.value)}
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
                      "w-9 h-9 rounded-[8px] flex items-center justify-center text-[15px] font-bold",
                      active ? "bg-white/15 text-white" : "bg-line-soft text-ink",
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
                  {c.label.split("·")[1]?.trim() ?? ""}
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
            { label: "Commission", value: `${form.commissionRate || 0}%` },
            {
              label: "Min Withdrawal",
              value: `${currency.symbol}${Number(form.minWithdrawal || 0).toLocaleString()}`,
            },
            { label: "Expiry", value: `${form.expiryDays || 0}d` },
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

      <div className="flex items-center justify-end gap-3">
        {saved && (
          <span className="inline-flex items-center gap-1.5 text-[12px] text-(--color-success-fg)">
            <CheckCircle2 className="w-3.5 h-3.5" strokeWidth={2} />
            Configuration saved
          </span>
        )}
        <button type="submit" disabled={saving} className="btn-primary min-w-[180px]">
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
    </form>
  );
};

export default ReferralConfigTab;
