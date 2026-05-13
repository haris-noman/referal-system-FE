import { useState } from "react";
import {
  MessageSquare,
  Send,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { cn } from "../../lib/utils";
import SupportPageHeader from "../../components/support/SupportPageHeader";

type FormState = {
  name: string;
  email: string;
  subject: string;
  message: string;
};

type Errors = Partial<Record<keyof FormState, string>>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const Field = ({
  label,
  required,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) => (
  <div className="space-y-1.5">
    <label className="text-[12px] font-medium text-ink-soft flex items-center gap-1">
      {label}
      {required && <span className="text-red-500">*</span>}
    </label>
    {children}
    {error && (
      <p className="flex items-center gap-1 text-[11px] text-red-600">
        <AlertCircle className="w-3 h-3" strokeWidth={2} />
        {error}
      </p>
    )}
  </div>
);

const SendMessagePage = () => {
  const [form, setForm] = useState<FormState>({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((p) => ({ ...p, [key]: value }));
    if (errors[key]) setErrors((p) => ({ ...p, [key]: undefined }));
  };

  const validate = (): boolean => {
    const next: Errors = {};
    if (!form.name.trim()) next.name = "Please enter your name.";
    if (!form.email.trim()) next.email = "Please enter your email.";
    else if (!EMAIL_RE.test(form.email.trim()))
      next.email = "Enter a valid email address.";
    if (!form.subject.trim()) next.subject = "Subject is required.";
    if (form.message.trim().length < 10)
      next.message = "Message must be at least 10 characters.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 900));
    setSubmitting(false);
    setSent(true);
    setForm({ name: "", email: "", subject: "", message: "" });
  };

  if (sent) {
    return (
      <div className="space-y-6">
        <SupportPageHeader
          icon={MessageSquare}
          title="Send Message"
          description="Drop us a quick note and our team will get back to you shortly."
        />
        <div className="bg-white border border-line rounded-card p-10 text-center max-w-xl mx-auto">
          <div className="w-14 h-14 mx-auto rounded-full bg-(--color-success-bg) text-(--color-success-fg) flex items-center justify-center">
            <CheckCircle2 className="w-7 h-7" strokeWidth={1.75} />
          </div>
          <h3 className="mt-5 text-[18px] font-bold text-ink tracking-tight">
            Message Sent
          </h3>
          <p className="mt-2 text-[13px] text-muted">
            Thanks for reaching out — we'll reply to your email within one
            business day.
          </p>
          <button
            type="button"
            onClick={() => setSent(false)}
            className="btn-secondary mt-6"
          >
            Send Another Message
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <SupportPageHeader
        icon={MessageSquare}
        title="Send Message"
        description="Drop us a quick note and our team will get back to you shortly."
      />

      <form
        onSubmit={onSubmit}
        className="bg-white border border-line rounded-card overflow-hidden max-w-3xl"
        noValidate
      >
        <div className="px-6 py-3 bg-line-soft border-b border-line">
          <h3 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted">
            Message Details
          </h3>
        </div>

        <div className="p-6 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Field label="Your Name" required error={errors.name}>
              <input
                type="text"
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
                className={cn("field", errors.name && "border-red-500")}
                placeholder="Jane Doe"
              />
            </Field>
            <Field label="Email Address" required error={errors.email}>
              <input
                type="email"
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
                className={cn("field", errors.email && "border-red-500")}
                placeholder="jane@example.com"
              />
            </Field>
          </div>

          <Field label="Subject" required error={errors.subject}>
            <input
              type="text"
              value={form.subject}
              onChange={(e) => update("subject", e.target.value)}
              className={cn("field", errors.subject && "border-red-500")}
              placeholder="How can we help?"
            />
          </Field>

          <Field label="Message" required error={errors.message}>
            <textarea
              value={form.message}
              onChange={(e) => update("message", e.target.value)}
              rows={6}
              className={cn(
                "field resize-y min-h-[140px]",
                errors.message && "border-red-500",
              )}
              placeholder="Share as much detail as you can — referral IDs, error messages, screenshots described, etc."
            />
            <p className="text-[11px] text-muted-2 mt-1">
              {form.message.trim().length} / 1000 characters
            </p>
          </Field>
        </div>

        <div className="px-6 py-4 bg-line-soft/40 border-t border-line flex items-center justify-end gap-3">
          <button
            type="submit"
            disabled={submitting}
            className="btn-primary min-w-[140px]"
          >
            {submitting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Sending…
              </>
            ) : (
              <>
                <Send className="w-3.5 h-3.5" strokeWidth={2} />
                Send Message
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SendMessagePage;
