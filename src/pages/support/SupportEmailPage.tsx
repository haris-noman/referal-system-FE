import { useState } from "react";
import {
  Mail,
  Copy,
  Check,
  ExternalLink,
  Clock,
  ShieldCheck,
} from "lucide-react";
import { cn } from "../../lib/utils";
import SupportPageHeader from "../../components/support/SupportPageHeader";

const EMAIL_CHANNELS = [
  {
    label: "General Inquiries",
    email: "support@networkportal.com",
    description: "Account questions, navigation help, and platform feedback.",
    response: "Within 24 hours",
    tone: "info" as const,
  },
  {
    label: "Technical Support",
    email: "tech@networkportal.com",
    description:
      "Bugs, integrations, performance issues, and developer questions.",
    response: "Within 12 hours",
    tone: "success" as const,
  },
  {
    label: "Partnerships & Billing",
    email: "partners@networkportal.com",
    description: "Referral payouts, commission disputes, and partner onboarding.",
    response: "Within 48 hours",
    tone: "warning" as const,
  },
];

const TONE: Record<"info" | "success" | "warning", string> = {
  info: "bg-(--color-info-bg) text-(--color-info-fg)",
  success: "bg-(--color-success-bg) text-(--color-success-fg)",
  warning: "bg-(--color-warning-bg) text-(--color-warning-fg)",
};

const TIPS = [
  "Include your account email or partner ID so we can locate your record faster.",
  "Attach screenshots or relevant referral IDs when reporting an issue.",
  "Use a clear subject line — e.g. \"Commission discrepancy — REF#1284\".",
];

const SupportEmailPage = () => {
  const [copied, setCopied] = useState<string | null>(null);

  const copy = async (email: string) => {
    try {
      await navigator.clipboard.writeText(email);
      setCopied(email);
      setTimeout(() => setCopied(null), 1600);
    } catch {
      setCopied(null);
    }
  };

  return (
    <div className="space-y-6">
      <SupportPageHeader
        icon={Mail}
        title="Support Email"
        description="Reach the right team directly. Each inbox is monitored by specialists during business hours."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {EMAIL_CHANNELS.map((channel) => {
          const isCopied = copied === channel.email;
          return (
            <div
              key={channel.email}
              className="group bg-white border border-line rounded-card p-5 flex flex-col hover:border-ink-soft hover:shadow-sm transition-all"
            >
              <div className="flex items-start justify-between gap-3">
                <span
                  className={cn(
                    "px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-[0.08em]",
                    TONE[channel.tone],
                  )}
                >
                  {channel.label}
                </span>
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-muted">
                  <Clock className="w-3 h-3" strokeWidth={2} />
                  {channel.response}
                </span>
              </div>

              <a
                href={`mailto:${channel.email}`}
                className="mt-4 text-[15px] font-semibold text-ink tracking-tight break-all hover:underline"
              >
                {channel.email}
              </a>
              <p className="mt-1.5 text-[13px] text-muted leading-relaxed">
                {channel.description}
              </p>

              <div className="mt-5 pt-4 border-t border-line flex items-center gap-2">
                <a
                  href={`mailto:${channel.email}`}
                  className="btn-primary flex-1"
                >
                  <ExternalLink className="w-3.5 h-3.5" strokeWidth={2} />
                  Compose
                </a>
                <button
                  type="button"
                  onClick={() => copy(channel.email)}
                  className="btn-secondary"
                  aria-label={`Copy ${channel.email}`}
                >
                  {isCopied ? (
                    <>
                      <Check className="w-3.5 h-3.5" strokeWidth={2.5} />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" strokeWidth={2} />
                      Copy
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-white border border-line rounded-card p-6">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-[8px] bg-(--color-info-bg) text-(--color-info-fg) flex items-center justify-center shrink-0">
            <ShieldCheck className="w-4 h-4" strokeWidth={1.75} />
          </div>
          <div className="flex-1">
            <h3 className="text-[13px] font-semibold text-ink">
              Tips for a faster response
            </h3>
            <ul className="mt-3 space-y-2">
              {TIPS.map((tip) => (
                <li
                  key={tip}
                  className="flex items-start gap-2 text-[13px] text-muted"
                >
                  <span className="mt-1.5 w-1 h-1 rounded-full bg-muted-2 shrink-0" />
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupportEmailPage;
