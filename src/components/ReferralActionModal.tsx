import { useEffect, useRef, useState } from "react";
import { AlertCircle, CheckCircle2, Loader2, X, XCircle } from "lucide-react";
import { cn } from "../lib/utils";
import api from "../lib/api";

export type ReferralActionTarget = {
  id: number;
  full_name: string;
  estimated_value?: string | number;
  referral_type?: string;
};

export type ReferralAction = "approve" | "reject";

type Props = {
  referral: ReferralActionTarget | null;
  action: ReferralAction | null;
  onClose: () => void;
  onSuccess: () => void;
};

const formatCurrency = (value: string | number | undefined) => {
  if (value === undefined || value === null || value === "") return "—";
  const num = typeof value === "number" ? value : parseFloat(value);
  if (Number.isNaN(num)) return "—";
  return `$${num.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
};

const ReferralActionModal = ({
  referral,
  action,
  onClose,
  onSuccess,
}: Props) => {
  const open = !!referral && !!action;
  const [commissionRate, setCommissionRate] = useState("5");
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const firstFieldRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(
    null,
  );

  // Reset state whenever a new modal target opens.
  useEffect(() => {
    if (!open) return;
    setCommissionRate("5");
    setReason("");
    setError("");
    setIsSubmitting(false);
    const id = window.setTimeout(() => firstFieldRef.current?.focus(), 30);
    return () => window.clearTimeout(id);
  }, [open, action, referral?.id]);

  // Lock background scroll + close on Escape.
  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isSubmitting) onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onClose, isSubmitting]);

  if (!open || !referral || !action) return null;

  const isApprove = action === "approve";
  const estValue =
    referral.estimated_value !== undefined
      ? parseFloat(String(referral.estimated_value))
      : NaN;
  const previewCommission =
    isApprove && !Number.isNaN(estValue) && commissionRate !== ""
      ? estValue * (Number(commissionRate) / 100)
      : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (isApprove) {
      const rate = Number(commissionRate);
      if (commissionRate.trim() === "" || Number.isNaN(rate)) {
        setError("Enter a numeric commission rate.");
        return;
      }
      if (rate < 0 || rate > 100) {
        setError("Commission rate must be between 0 and 100.");
        return;
      }
    } else if (reason.trim().length < 3) {
      setError("Please provide a brief reason (at least 3 characters).");
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      if (isApprove) {
        formData.append("commission_rate", commissionRate);
        await api.post(`/referrals/${referral.id}/approve/`, formData);
      } else {
        formData.append("rejection_reason", reason.trim());
        await api.post(`/referrals/${referral.id}/reject/`, formData);
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(
        err.response?.data?.error ||
          err.response?.data?.detail ||
          (isApprove ? "Approval failed." : "Rejection failed."),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const accentRing = isApprove
    ? "bg-emerald-50 text-emerald-600"
    : "bg-red-50 text-red-600";
  const submitClass = isApprove
    ? "bg-emerald-600 hover:bg-emerald-700 text-white"
    : "bg-red-600 hover:bg-red-700 text-white";
  const Icon = isApprove ? CheckCircle2 : XCircle;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/50 backdrop-blur-sm"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !isSubmitting) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="referral-action-title"
    >
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-card border border-line shadow-xl w-full max-w-md overflow-hidden"
      >
        <div className="flex items-start justify-between px-6 pt-5 pb-4 border-b border-line gap-3">
          <div className="flex items-start gap-3 min-w-0">
            <div
              className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center shrink-0",
                accentRing,
              )}
            >
              <Icon className="w-5 h-5" strokeWidth={2} />
            </div>
            <div className="min-w-0">
              <h2
                id="referral-action-title"
                className="text-[15px] font-semibold text-ink leading-tight"
              >
                {isApprove ? "Approve Referral" : "Reject Referral"}
              </h2>
              <p className="text-[12px] text-muted mt-0.5 truncate">
                {referral.full_name}
                {referral.referral_type
                  ? ` • ${referral.referral_type.replace(/_/g, " ")}`
                  : ""}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => !isSubmitting && onClose()}
            className="p-1 rounded-full text-muted hover:text-ink hover:bg-line-soft transition-colors disabled:opacity-50"
            aria-label="Close"
            disabled={isSubmitting}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          <div className="rounded-[8px] bg-line-soft px-4 py-3 flex items-center justify-between">
            <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">
              Estimated Value
            </span>
            <span className="text-[14px] font-bold text-ink">
              {formatCurrency(referral.estimated_value)}
            </span>
          </div>

          {isApprove ? (
            <div className="space-y-1.5">
              <label
                htmlFor="commission-rate"
                className="text-[12px] font-medium text-ink-soft flex items-center gap-1"
              >
                Commission Rate (%)
                <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  id="commission-rate"
                  ref={firstFieldRef as React.RefObject<HTMLInputElement>}
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={commissionRate}
                  onChange={(e) => {
                    setCommissionRate(e.target.value);
                    if (error) setError("");
                  }}
                  className="field pr-9 text-right"
                  placeholder="5"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-2 text-sm">
                  %
                </span>
              </div>
              {previewCommission !== null && previewCommission >= 0 && (
                <p className="text-[11px] text-muted">
                  Approving at this rate will pay out{" "}
                  <span className="font-semibold text-ink">
                    {formatCurrency(previewCommission)}
                  </span>
                  .
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-1.5">
              <label
                htmlFor="rejection-reason"
                className="text-[12px] font-medium text-ink-soft flex items-center gap-1"
              >
                Reason for Rejection
                <span className="text-red-500">*</span>
              </label>
              <textarea
                id="rejection-reason"
                ref={firstFieldRef as React.RefObject<HTMLTextAreaElement>}
                rows={4}
                value={reason}
                onChange={(e) => {
                  setReason(e.target.value);
                  if (error) setError("");
                }}
                className="field resize-none"
                placeholder="Briefly explain why this referral is being rejected..."
                maxLength={500}
              />
              <p className="text-[11px] text-muted-2 text-right">
                {reason.length}/500
              </p>
            </div>
          )}

          {error && (
            <div className="flex items-start gap-2 text-[12px] text-red-600 bg-red-50 border border-red-100 rounded-[6px] px-3 py-2">
              <AlertCircle
                className="w-3.5 h-3.5 mt-0.5 shrink-0"
                strokeWidth={2}
              />
              <span>{error}</span>
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-line flex items-center justify-end gap-2 bg-line-soft/40">
          <button
            type="button"
            onClick={() => !isSubmitting && onClose()}
            disabled={isSubmitting}
            className="btn-secondary"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className={cn(
              "inline-flex items-center justify-center gap-2 rounded-[6px] px-4 py-2.5 text-[12px] font-semibold uppercase tracking-[0.08em] transition-colors disabled:opacity-70 disabled:pointer-events-none min-w-[140px]",
              submitClass,
            )}
          >
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : isApprove ? (
              "Confirm Approval"
            ) : (
              "Confirm Rejection"
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ReferralActionModal;
