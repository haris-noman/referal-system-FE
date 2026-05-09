import { useState } from "react";
import {
  Info,
  UploadCloud,
  CheckCircle2,
  ChevronDown,
  ArrowRight,
  Hourglass,
} from "lucide-react";
import { cn } from "../lib/utils";

const Section = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <div className="bg-white border border-line rounded-card overflow-hidden">
    <div className="px-6 py-3 bg-light-gray border-b border-line">
      <h3 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted">
        {title}
      </h3>
    </div>
    <div className="p-6">{children}</div>
  </div>
);

const Field = ({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) => (
  <div className={cn("space-y-1.5", className)}>
    <label className="text-[12px] font-medium text-ink-soft">{label}</label>
    {children}
  </div>
);

const SubmitReferralPage = () => {
  const [dragActive, setDragActive] = useState(false);

  return (
    <div className="space-y-5">
      <div className="bg-white border border-line rounded-card px-5 py-3 flex items-center gap-3">
        <Info className="w-4 h-4 text-muted" strokeWidth={1.75} />
        <p className="text-[13px] text-muted">
          Please ensure all client information is accurate to expedite the
          vetting process. Secure handling of data is our priority.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">
        <div className="lg:col-span-2 space-y-5">
          <Section title="Client Information">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Field label="Full Name">
                <input className="field" placeholder="e.g. Jonathan Harker" />
              </Field>
              <Field label="Email Address">
                <input
                  type="email"
                  className="field"
                  placeholder="j.harker@enterprise.com"
                />
              </Field>
              <Field label="Phone Number" className="md:col-span-2">
                <input className="field" placeholder="+1 (555) 000-0000" />
              </Field>
            </div>
          </Section>

          <Section title="Referral Details">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Field label="Referral Type">
                <div className="relative">
                  <select className="field appearance-none pr-9 cursor-pointer">
                    <option>Strategic Partnership</option>
                    <option>Enterprise Cloud</option>
                    <option>Security Audit</option>
                    <option>Data Migration</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-2 pointer-events-none" />
                </div>
              </Field>
              <Field label="Estimated Value (USD)">
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-2 text-sm">
                    $
                  </span>
                  <input
                    className="field pl-7 text-right"
                    placeholder="000,00"
                  />
                </div>
              </Field>
              <Field label="Additional Notes" className="md:col-span-2">
                <textarea
                  rows={4}
                  className="field resize-none"
                  placeholder="Provide context regarding the lead's current pain points or timeline..."
                />
              </Field>
            </div>
          </Section>

          <Section title="Document Upload">
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragActive(true);
              }}
              onDragLeave={() => setDragActive(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragActive(false);
              }}
              className={cn(
                "rounded-[8px] border border-dashed flex flex-col items-center justify-center py-12 transition-colors cursor-pointer",
                dragActive
                  ? "border-ink bg-line-soft"
                  : "border-line hover:bg-line-soft/50",
              )}
            >
              <UploadCloud className="w-7 h-7 text-muted-2" strokeWidth={1.5} />
              <p className="mt-3 text-[14px] font-semibold text-ink">
                Click to upload or drag and drop
              </p>
              <p className="mt-1 text-[12px] text-muted">
                PDF, DOCX, or XLSX (Max 10MB)
              </p>
              <p className="mt-4 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-2">
                Upload signed NDAs or initial contracts here
              </p>
            </div>
          </Section>

          <div className="flex items-center justify-between pt-2">
            <button className="text-[13px] font-semibold text-muted hover:text-ink transition-colors">
              Save Draft
            </button>
            <button className="btn-primary">
              Submit Referral
              <ArrowRight className="w-3.5 h-3.5" strokeWidth={2.5} />
            </button>
          </div>
        </div>

        <aside className="space-y-5">
          <div className="bg-ink text-white rounded-card p-6">
            <h3 className="text-[15px] font-semibold mb-4">
              Referral Guidelines
            </h3>
            <ul className="space-y-3">
              {[
                "Ensure the client has expressed verbal interest before submission.",
                "Include any known project timelines in the notes section.",
                "Standard vetting time is 48 business hours.",
              ].map((g, i) => (
                <li
                  key={i}
                  className="flex gap-2.5 text-[13px] text-white/85 leading-snug"
                >
                  <CheckCircle2
                    className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5"
                    strokeWidth={1.75}
                  />
                  {g}
                </li>
              ))}
            </ul>
            <div className="border-t border-white/15 mt-6 pt-5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/55">
                Incentive Status
              </p>
              <p className="mt-2 text-[13px] text-white/85">
                Your current tier:{" "}
                <span className="font-semibold text-white">
                  Tier 2 (5% Commission)
                </span>
              </p>
            </div>
          </div>

          <div className="bg-white border border-line rounded-card p-6">
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted mb-4">
              Recent Activity
            </p>
            <ul className="space-y-4">
              <li className="flex gap-3">
                <span className="w-7 h-7 rounded-full bg-success-bg text-success-fg flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-3.5 h-3.5" strokeWidth={1.75} />
                </span>
                <div>
                  <p className="text-[13px] font-semibold text-ink leading-tight">
                    Referral Approved
                  </p>
                  <p className="text-[11px] text-muted mt-0.5">
                    Apex Dynamics Inc. • 2h ago
                  </p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="w-7 h-7 rounded-full bg-warning-bg text-warning-fg flex items-center justify-center shrink-0">
                  <Hourglass className="w-3.5 h-3.5" strokeWidth={1.75} />
                </span>
                <div>
                  <p className="text-[13px] font-semibold text-ink leading-tight">
                    Under Review
                  </p>
                  <p className="text-[11px] text-muted mt-0.5">
                    Global Logistics Ltd • 5h ago
                  </p>
                </div>
              </li>
            </ul>
          </div>

          <div className="rounded-card overflow-hidden relative bg-ink text-white p-6 min-h-[160px] flex flex-col justify-end">
            <div
              className="absolute inset-0 opacity-50"
              style={{
                backgroundImage:
                  "linear-gradient(135deg, rgba(11,18,32,0.2), rgba(11,18,32,0.95)), linear-gradient(180deg, #1e293b, #334155)",
              }}
            />
            <div className="relative z-10">
              <h4 className="text-[15px] font-semibold leading-tight">
                Need help with complex deals?
              </h4>
              <button className="mt-3 inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-white/85 hover:text-white">
                Contact Enterprise Support
                <ArrowRight className="w-3 h-3" strokeWidth={2.5} />
              </button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default SubmitReferralPage;
