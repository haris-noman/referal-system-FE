import { Phone, PhoneCall, Globe2, Clock, MapPin } from "lucide-react";
import { cn } from "../../lib/utils";
import SupportPageHeader from "../../components/support/SupportPageHeader";

const LINES = [
  {
    region: "North America",
    flag: "🇺🇸",
    number: "+1 (800) 555-0142",
    hours: "Mon – Fri · 8:00am – 8:00pm EST",
    timezone: "EST · UTC −5",
  },
  {
    region: "United Kingdom",
    flag: "🇬🇧",
    number: "+44 20 4538 9923",
    hours: "Mon – Fri · 9:00am – 6:00pm GMT",
    timezone: "GMT · UTC ±0",
  },
  {
    region: "Asia Pacific",
    flag: "🇸🇬",
    number: "+65 3158 7720",
    hours: "Mon – Fri · 9:00am – 7:00pm SGT",
    timezone: "SGT · UTC +8",
  },
];

const QUICK_LINKS = [
  {
    label: "Priority Partner Line",
    number: "+1 (800) 555-0900",
    note: "Verified partners only — keep your partner ID handy.",
    tone: "warning" as const,
  },
  {
    label: "Emergency / Account Lockout",
    number: "+1 (800) 555-0911",
    note: "Available 24/7 for security incidents.",
    tone: "danger" as const,
  },
];

const TONE: Record<"warning" | "danger", string> = {
  warning: "bg-(--color-warning-bg) text-(--color-warning-fg)",
  danger: "bg-(--color-danger-bg) text-(--color-danger-fg)",
};

const ContactNumberPage = () => {
  return (
    <div className="space-y-6">
      <SupportPageHeader
        icon={Phone}
        title="Contact Numbers"
        description="Speak with a live agent across regions. Save the line that matches your timezone."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {LINES.map((line) => (
          <div
            key={line.region}
            className="bg-white border border-line rounded-card p-5 hover:border-ink-soft hover:shadow-sm transition-all"
          >
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted">
                <Globe2 className="w-3.5 h-3.5" strokeWidth={2} />
                {line.region}
              </span>
              <span className="text-lg" aria-hidden>
                {line.flag}
              </span>
            </div>

            <a
              href={`tel:${line.number.replace(/[^+\d]/g, "")}`}
              className="mt-4 block text-[22px] font-bold text-ink tracking-tight hover:text-ink-soft transition-colors"
            >
              {line.number}
            </a>

            <div className="mt-4 space-y-1.5 text-[12.5px] text-muted">
              <p className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-muted-2" strokeWidth={2} />
                {line.hours}
              </p>
              <p className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-muted-2" strokeWidth={2} />
                {line.timezone}
              </p>
            </div>

            <a
              href={`tel:${line.number.replace(/[^+\d]/g, "")}`}
              className="btn-primary mt-5 w-full"
            >
              <PhoneCall className="w-3.5 h-3.5" strokeWidth={2} />
              Call Now
            </a>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {QUICK_LINKS.map((link) => (
          <div
            key={link.label}
            className="bg-white border border-line rounded-card p-5 flex items-center justify-between gap-4"
          >
            <div>
              <span
                className={cn(
                  "inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-[0.08em]",
                  TONE[link.tone],
                )}
              >
                {link.label}
              </span>
              <a
                href={`tel:${link.number.replace(/[^+\d]/g, "")}`}
                className="mt-2 block text-[18px] font-bold text-ink tracking-tight hover:text-ink-soft"
              >
                {link.number}
              </a>
              <p className="mt-1 text-[12.5px] text-muted">{link.note}</p>
            </div>
            <a
              href={`tel:${link.number.replace(/[^+\d]/g, "")}`}
              className="btn-secondary shrink-0"
            >
              <PhoneCall className="w-3.5 h-3.5" strokeWidth={2} />
              Call
            </a>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ContactNumberPage;
