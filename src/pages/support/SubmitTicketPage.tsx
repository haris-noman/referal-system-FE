import { useRef, useState } from "react";
import {
  Ticket,
  ChevronDown,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  Loader2,
  X,
  FileText,
} from "lucide-react";
import { cn } from "../../lib/utils";
import SupportPageHeader from "../../components/support/SupportPageHeader";
import { Popover, PopoverItem } from "../../components/ui/Popover";

const CATEGORIES = [
  { value: "billing", label: "Billing & Commissions" },
  { value: "referrals", label: "Referrals & Tracking" },
  { value: "technical", label: "Technical / Bug Report" },
  { value: "account", label: "Account Access" },
  { value: "other", label: "Other" },
];

const PRIORITIES = [
  { value: "low", label: "Low", tone: "bg-(--color-neutral-bg) text-(--color-neutral-fg)" },
  { value: "medium", label: "Medium", tone: "bg-(--color-info-bg) text-(--color-info-fg)" },
  { value: "high", label: "High", tone: "bg-(--color-warning-bg) text-(--color-warning-fg)" },
  { value: "urgent", label: "Urgent", tone: "bg-(--color-danger-bg) text-(--color-danger-fg)" },
];

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ACCEPTED = [".pdf", ".png", ".jpg", ".jpeg", ".docx"];

type FormState = {
  subject: string;
  category: string;
  priority: string;
  description: string;
};

type Errors = Partial<Record<keyof FormState | "attachment", string>>;

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

const formatBytes = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const SubmitTicketPage = () => {
  const [form, setForm] = useState<FormState>({
    subject: "",
    category: "",
    priority: "medium",
    description: "",
  });
  const [errors, setErrors] = useState<Errors>({});
  const [file, setFile] = useState<File | null>(null);
  const [catOpen, setCatOpen] = useState(false);
  const [prioOpen, setPrioOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submittedId, setSubmittedId] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((p) => ({ ...p, [key]: value }));
    if (errors[key]) setErrors((p) => ({ ...p, [key]: undefined }));
  };

  const onFile = (f: File | null) => {
    if (!f) {
      setFile(null);
      return;
    }
    const ext = `.${f.name.split(".").pop()?.toLowerCase()}`;
    if (!ACCEPTED.includes(ext)) {
      setErrors((p) => ({
        ...p,
        attachment: `Unsupported file. Allowed: ${ACCEPTED.join(", ")}`,
      }));
      return;
    }
    if (f.size > MAX_FILE_SIZE) {
      setErrors((p) => ({ ...p, attachment: "File must be 10MB or smaller." }));
      return;
    }
    setErrors((p) => ({ ...p, attachment: undefined }));
    setFile(f);
  };

  const validate = (): boolean => {
    const next: Errors = {};
    if (!form.subject.trim()) next.subject = "Subject is required.";
    if (!form.category) next.category = "Choose a category.";
    if (form.description.trim().length < 20)
      next.description = "Describe the issue with at least 20 characters.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 1000));
    setSubmitting(false);
    setSubmittedId(`TCK-${Math.floor(10000 + Math.random() * 90000)}`);
  };

  const reset = () => {
    setForm({ subject: "", category: "", priority: "medium", description: "" });
    setFile(null);
    setErrors({});
    setSubmittedId(null);
  };

  const categoryLabel =
    CATEGORIES.find((c) => c.value === form.category)?.label ??
    "Select a category";
  const priorityLabel =
    PRIORITIES.find((p) => p.value === form.priority)?.label ?? "Medium";
  const priorityTone =
    PRIORITIES.find((p) => p.value === form.priority)?.tone ?? "";

  if (submittedId) {
    return (
      <div className="space-y-6">
        <SupportPageHeader
          icon={Ticket}
          title="Submit a Ticket"
          description="File a formal support request — we track every ticket through to resolution."
        />
        <div className="bg-white border border-line rounded-card p-10 text-center max-w-xl mx-auto">
          <div className="w-14 h-14 mx-auto rounded-full bg-(--color-success-bg) text-(--color-success-fg) flex items-center justify-center">
            <CheckCircle2 className="w-7 h-7" strokeWidth={1.75} />
          </div>
          <h3 className="mt-5 text-[18px] font-bold text-ink tracking-tight">
            Ticket Submitted
          </h3>
          <p className="mt-2 text-[13px] text-muted">
            Your reference is{" "}
            <span className="font-semibold text-ink">{submittedId}</span>. You
            can monitor progress on the Response Status page.
          </p>
          <div className="mt-6 flex items-center justify-center gap-3">
            <button type="button" onClick={reset} className="btn-secondary">
              File Another
            </button>
            <a href="/support/response-status" className="btn-primary">
              View Status
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <SupportPageHeader
        icon={Ticket}
        title="Submit a Ticket"
        description="File a formal support request — we track every ticket through to resolution."
      />

      <form
        onSubmit={onSubmit}
        className="bg-white border border-line rounded-card overflow-hidden max-w-3xl"
        noValidate
      >
        <div className="px-6 py-3 bg-line-soft border-b border-line">
          <h3 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted">
            Ticket Details
          </h3>
        </div>

        <div className="p-6 space-y-5">
          <Field label="Subject" required error={errors.subject}>
            <input
              type="text"
              value={form.subject}
              onChange={(e) => update("subject", e.target.value)}
              className={cn("field", errors.subject && "border-red-500")}
              placeholder="Brief summary of the issue"
            />
          </Field>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Field label="Category" required error={errors.category}>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setCatOpen((v) => !v);
                    setPrioOpen(false);
                  }}
                  className={cn(
                    "field text-left flex items-center justify-between",
                    errors.category && "border-red-500",
                    !form.category && "text-muted-2",
                  )}
                >
                  <span>{categoryLabel}</span>
                  <ChevronDown
                    className="w-4 h-4 text-muted-2"
                    strokeWidth={2}
                  />
                </button>
                <Popover
                  open={catOpen}
                  onClose={() => setCatOpen(false)}
                  align="left"
                >
                  {CATEGORIES.map((opt) => (
                    <PopoverItem
                      key={opt.value}
                      active={form.category === opt.value}
                      onClick={() => {
                        update("category", opt.value);
                        setCatOpen(false);
                      }}
                    >
                      {opt.label}
                    </PopoverItem>
                  ))}
                </Popover>
              </div>
            </Field>

            <Field label="Priority">
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setPrioOpen((v) => !v);
                    setCatOpen(false);
                  }}
                  className="field text-left flex items-center justify-between"
                >
                  <span className="flex items-center gap-2">
                    <span
                      className={cn(
                        "px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-[0.08em]",
                        priorityTone,
                      )}
                    >
                      {priorityLabel}
                    </span>
                  </span>
                  <ChevronDown
                    className="w-4 h-4 text-muted-2"
                    strokeWidth={2}
                  />
                </button>
                <Popover
                  open={prioOpen}
                  onClose={() => setPrioOpen(false)}
                  align="left"
                >
                  {PRIORITIES.map((opt) => (
                    <PopoverItem
                      key={opt.value}
                      active={form.priority === opt.value}
                      onClick={() => {
                        update("priority", opt.value);
                        setPrioOpen(false);
                      }}
                    >
                      {opt.label}
                    </PopoverItem>
                  ))}
                </Popover>
              </div>
            </Field>
          </div>

          <Field label="Description" required error={errors.description}>
            <textarea
              value={form.description}
              onChange={(e) => update("description", e.target.value)}
              rows={6}
              className={cn(
                "field resize-y min-h-[140px]",
                errors.description && "border-red-500",
              )}
              placeholder="Describe what happened, what you expected, and any steps to reproduce."
            />
          </Field>

          <Field label="Attachment (optional)" error={errors.attachment}>
            <input
              ref={fileRef}
              type="file"
              accept={ACCEPTED.join(",")}
              className="hidden"
              onChange={(e) => onFile(e.target.files?.[0] ?? null)}
            />
            {file ? (
              <div className="border border-line rounded-[6px] p-3 flex items-center justify-between gap-3 bg-line-soft/40">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-[6px] bg-white border border-line flex items-center justify-center shrink-0">
                    <FileText
                      className="w-4 h-4 text-muted"
                      strokeWidth={1.75}
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[13px] font-medium text-ink truncate">
                      {file.name}
                    </p>
                    <p className="text-[11px] text-muted">
                      {formatBytes(file.size)}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setFile(null);
                    if (fileRef.current) fileRef.current.value = "";
                  }}
                  className="p-1.5 rounded-full text-muted-2 hover:text-ink hover:bg-line-soft transition-colors"
                  aria-label="Remove file"
                >
                  <X className="w-3.5 h-3.5" strokeWidth={2} />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="w-full border border-dashed border-line rounded-[6px] py-6 flex flex-col items-center justify-center gap-1.5 hover:border-ink-soft hover:bg-line-soft/40 transition-colors"
              >
                <UploadCloud
                  className="w-5 h-5 text-muted-2"
                  strokeWidth={1.75}
                />
                <p className="text-[13px] font-medium text-ink">
                  Click to upload
                </p>
                <p className="text-[11px] text-muted">
                  {ACCEPTED.join(", ")} · up to 10MB
                </p>
              </button>
            )}
          </Field>
        </div>

        <div className="px-6 py-4 bg-line-soft/40 border-t border-line flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={reset}
            className="btn-secondary"
            disabled={submitting}
          >
            Reset
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="btn-primary min-w-[160px]"
          >
            {submitting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Submitting…
              </>
            ) : (
              <>
                <Ticket className="w-3.5 h-3.5" strokeWidth={2} />
                Submit Ticket
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SubmitTicketPage;
