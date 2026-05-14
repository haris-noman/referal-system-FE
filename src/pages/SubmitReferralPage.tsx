import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Info,
  UploadCloud,
  CheckCircle2,
  ChevronDown,
  ArrowRight,
  Loader2,
  X,
  FileText,
  AlertCircle,
} from "lucide-react";
import { cn } from "../lib/utils";
import api from "../lib/api";

const Section = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <div className="bg-white border border-line rounded-card overflow-hidden">
    <div className="px-4 sm:px-6 py-3 bg-line-soft border-b border-line">
      <h3 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted">
        {title}
      </h3>
    </div>
    <div className="p-4 sm:p-6">{children}</div>
  </div>
);

const Field = ({
  label,
  error,
  required,
  children,
  className,
}: {
  label: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
}) => (
  <div className={cn("space-y-1.5", className)}>
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

const REFERRAL_TYPES = [
  { value: "real_estate", label: "Real Estate" },
  { value: "insurance", label: "Insurance" },
  { value: "mortgage", label: "Mortgage" },
  { value: "other", label: "Other" },
];

const ACCEPTED_EXT = [".pdf", ".docx", ".xlsx"];
const ACCEPTED_MIME = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[+()\d][\d\s().-]{6,}$/;

type FormErrors = Partial<{
  fullName: string;
  email: string;
  phoneNumber: string;
  estimatedValue: string;
  documentFile: string;
}>;

type ValidatableField =
  | "fullName"
  | "email"
  | "phoneNumber"
  | "estimatedValue";

const VALIDATORS: Record<
  ValidatableField,
  (value: string) => string | undefined
> = {
  fullName: (value) => {
    const t = value.trim();
    if (!t) return "Full name is required.";
    if (t.length < 2) return "Full name must be at least 2 characters.";
    return undefined;
  },
  email: (value) => {
    const t = value.trim();
    if (!t) return "Email is required.";
    if (!EMAIL_RE.test(t)) return "Enter a valid email address.";
    return undefined;
  },
  phoneNumber: (value) => {
    const t = value.trim();
    if (!t) return "Phone number is required.";
    if (!PHONE_RE.test(t))
      return "Enter a valid phone number (at least 7 digits, optional + and separators).";
    return undefined;
  },
  estimatedValue: (value) => {
    if (value === "") return "Estimated value is required.";
    const n = Number(value);
    if (Number.isNaN(n)) return "Estimated value is required.";
    if (n <= 0) return "Value must be greater than zero.";
    if (n > 1_000_000_000) return "Value is unrealistically large.";
    return undefined;
  },
};

const validateFile = (file: File): string | null => {
  const lowerName = file.name.toLowerCase();
  const extOk = ACCEPTED_EXT.some((ext) => lowerName.endsWith(ext));
  const mimeOk = file.type === "" || ACCEPTED_MIME.includes(file.type);
  if (!extOk || !mimeOk) {
    return "Only PDF, DOCX, or XLSX files are allowed.";
  }
  if (file.size > MAX_FILE_SIZE) {
    return "File exceeds the 10MB limit.";
  }
  if (file.size === 0) {
    return "File appears to be empty.";
  }
  return null;
};

const SubmitReferralPage = () => {
  const [dragActive, setDragActive] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [referralType, setReferralType] = useState("real_estate");
  const [estimatedValue, setEstimatedValue] = useState("");
  const [additionalNotes, setAdditionalNotes] = useState("");
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragCounter = useRef(0);
  const navigate = useNavigate();

  const validate = (action: "submit" | "draft"): FormErrors => {
    const next: FormErrors = {};
    const fields: Array<[ValidatableField, string]> = [
      ["fullName", fullName],
      ["email", email],
      ["phoneNumber", phoneNumber],
      ["estimatedValue", estimatedValue],
    ];
    // For drafts, only validate fields the user has filled.
    for (const [key, value] of fields) {
      if (action === "submit" || value.trim()) {
        const err = VALIDATORS[key](value);
        if (err) next[key] = err;
      }
    }
    if (documentFile) {
      const fileErr = validateFile(documentFile);
      if (fileErr) next.documentFile = fileErr;
    }
    return next;
  };

  const handleFieldChange =
    (key: ValidatableField, setter: (v: string) => void) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setter(value);
      setErrors((prev) => {
        if (!prev[key]) return prev;
        const nextErr = VALIDATORS[key](value);
        if (nextErr === prev[key]) return prev;
        const merged: FormErrors = { ...prev, [key]: nextErr };
        return merged;
      });
      setSubmitError("");
    };

  const acceptFile = (file: File) => {
    const err = validateFile(file);
    if (err) {
      setErrors((prev) => ({ ...prev, documentFile: err }));
      setDocumentFile(null);
      return;
    }
    setErrors((prev) => ({ ...prev, documentFile: undefined }));
    setDocumentFile(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) acceptFile(file);
    // reset so selecting the same file again still triggers onChange
    e.target.value = "";
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current = 0;
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) acceptFile(file);
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current += 1;
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setDragActive(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current = Math.max(0, dragCounter.current - 1);
    if (dragCounter.current === 0) setDragActive(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleSubmit = async (action: "submit" | "draft") => {
    setSubmitError("");
    const validation = validate(action);
    setErrors(validation);
    if (Object.keys(validation).length > 0) {
      setSubmitError(
        action === "submit"
          ? "Please fix the highlighted fields before submitting."
          : "Please fix the highlighted fields before saving the draft.",
      );
      return;
    }

    setIsLoading(true);
    const formData = new FormData();
    formData.append("full_name", fullName.trim());
    formData.append("email", email.trim());
    formData.append("phone_number", phoneNumber.trim());
    formData.append("referral_type", referralType);
    formData.append("estimated_value", estimatedValue);
    formData.append("additional_notes", additionalNotes);
    formData.append("action", action);
    if (documentFile) {
      formData.append("document", documentFile);
    }

    try {
      await api.post("/referrals/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      navigate("/dashboard");
    } catch (err: any) {
      setSubmitError(
        err.response?.data?.detail ||
          err.response?.data?.error ||
          "Failed to submit referral. Please check all fields.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const triggerFilePicker = () => fileInputRef.current?.click();

  return (
    <div className="space-y-5">
      <div className="bg-white border border-line rounded-card px-5 py-3 flex items-center gap-3">
        <Info className="w-4 h-4 text-muted shrink-0" strokeWidth={1.75} />
        <p className="text-[13px] text-muted">
          Please ensure all client information is accurate to expedite the
          vetting process. Secure handling of data is our priority.
        </p>
      </div>

      {submitError && (
        <div className="p-4 bg-red-50 border border-red-100 text-red-600 text-[14px] rounded-card flex items-start gap-2">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" strokeWidth={2} />
          <span>{submitError}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">
        <div className="lg:col-span-2 space-y-5">
          <Section title="Client Information">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Field label="Full Name" required error={errors.fullName}>
                <input
                  className={cn(
                    "field",
                    errors.fullName && "border-red-400 focus:border-red-500",
                  )}
                  placeholder="e.g. Jonathan Harker"
                  value={fullName}
                  onChange={handleFieldChange("fullName", setFullName)}
                  autoComplete="name"
                />
              </Field>
              <Field label="Email Address" required error={errors.email}>
                <input
                  type="email"
                  className={cn(
                    "field",
                    errors.email && "border-red-400 focus:border-red-500",
                  )}
                  placeholder="j.harker@enterprise.com"
                  value={email}
                  onChange={handleFieldChange("email", setEmail)}
                  autoComplete="email"
                />
              </Field>
              <Field
                label="Phone Number"
                required
                error={errors.phoneNumber}
                className="md:col-span-2"
              >
                <input
                  className={cn(
                    "field",
                    errors.phoneNumber && "border-red-400 focus:border-red-500",
                  )}
                  placeholder="+1 (555) 000-0000"
                  value={phoneNumber}
                  onChange={handleFieldChange("phoneNumber", setPhoneNumber)}
                  autoComplete="tel"
                  inputMode="tel"
                />
              </Field>
            </div>
          </Section>

          <Section title="Referral Details">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Field label="Referral Type" required>
                <div className="relative">
                  <select
                    className="field appearance-none pr-9 cursor-pointer"
                    value={referralType}
                    onChange={(e) => setReferralType(e.target.value)}
                  >
                    {REFERRAL_TYPES.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-2 pointer-events-none" />
                </div>
              </Field>
              <Field
                label="Estimated Value (USD)"
                required
                error={errors.estimatedValue}
              >
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-2 text-sm">
                    $
                  </span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    className={cn(
                      "field pl-7 text-right",
                      errors.estimatedValue &&
                        "border-red-400 focus:border-red-500",
                    )}
                    placeholder="0.00"
                    value={estimatedValue}
                    onChange={handleFieldChange(
                      "estimatedValue",
                      setEstimatedValue,
                    )}
                  />
                </div>
              </Field>
              <Field label="Additional Notes" className="md:col-span-2">
                <textarea
                  rows={4}
                  className="field resize-none"
                  placeholder="Provide context regarding the lead's current pain points or timeline..."
                  value={additionalNotes}
                  onChange={(e) => setAdditionalNotes(e.target.value)}
                  maxLength={2000}
                />
                <p className="text-[11px] text-muted-2 text-right">
                  {additionalNotes.length}/2000
                </p>
              </Field>
            </div>
          </Section>

          <Section title="Document Upload">
            <input
              ref={fileInputRef}
              type="file"
              id="file-upload"
              className="hidden"
              accept=".pdf,.docx,.xlsx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
              onChange={handleFileChange}
            />
            {!documentFile ? (
              <div
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={triggerFilePicker}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    triggerFilePicker();
                  }
                }}
                role="button"
                tabIndex={0}
                aria-label="Upload supporting document"
                className={cn(
                  "rounded-[8px] border border-dashed flex flex-col items-center justify-center py-12 px-4 transition-colors cursor-pointer text-center",
                  dragActive
                    ? "border-ink bg-line-soft"
                    : errors.documentFile
                      ? "border-red-300 bg-red-50/40 hover:bg-red-50"
                      : "border-line hover:bg-line-soft/50",
                )}
              >
                <UploadCloud
                  className={cn(
                    "w-7 h-7",
                    dragActive ? "text-ink" : "text-muted-2",
                  )}
                  strokeWidth={1.5}
                />
                <p className="mt-3 text-[14px] font-semibold text-ink">
                  {dragActive
                    ? "Release to upload"
                    : "Click to upload or drag and drop"}
                </p>
                <p className="mt-1 text-[12px] text-muted">
                  PDF, DOCX, or XLSX (Max 10MB)
                </p>
                {errors.documentFile && (
                  <p className="mt-3 flex items-center gap-1 text-[11px] text-red-600">
                    <AlertCircle className="w-3 h-3" strokeWidth={2} />
                    {errors.documentFile}
                  </p>
                )}
              </div>
            ) : (
              <div className="bg-line-soft rounded-[8px] p-4 flex items-center justify-between border border-line gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-md bg-white border border-line flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5 text-ink" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[13px] font-semibold text-ink truncate">
                      {documentFile.name}
                    </p>
                    <p className="text-[11px] text-muted">
                      {(documentFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={triggerFilePicker}
                    className="text-[11px] font-semibold uppercase tracking-wider text-muted hover:text-ink transition-colors"
                  >
                    Replace
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setDocumentFile(null);
                      setErrors((p) => ({ ...p, documentFile: undefined }));
                    }}
                    className="p-1 hover:bg-line-soft rounded-full text-muted hover:text-ink transition-colors"
                    aria-label="Remove file"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </Section>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-2">
            <button
              type="button"
              onClick={() => handleSubmit("draft")}
              disabled={isLoading}
              className="text-[13px] font-semibold text-muted hover:text-ink transition-colors disabled:opacity-50"
            >
              Save Draft
            </button>
            <button
              type="button"
              onClick={() => handleSubmit("submit")}
              disabled={isLoading}
              className="btn-primary disabled:opacity-70 min-w-[160px]"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  Submit Referral
                  <ArrowRight className="w-3.5 h-3.5" strokeWidth={2.5} />
                </>
              )}
            </button>
          </div>
        </div>

        <aside className="space-y-5">
          <div className="bg-ink text-white rounded-card p-4 sm:p-6">
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
          </div>
        </aside>
      </div>
    </div>
  );
};

export default SubmitReferralPage;
