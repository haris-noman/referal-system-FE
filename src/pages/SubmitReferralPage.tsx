import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Info,
  UploadCloud,
  CheckCircle2,
  ChevronDown,
  ArrowRight,
  Hourglass,
  Loader2,
  X,
  FileText,
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

const REFERRAL_TYPES = [
  { value: "real_estate", label: "Real Estate" },
  { value: "insurance", label: "Insurance" },
  { value: "mortgage", label: "Mortgage" },
  { value: "other", label: "Other" },
];

const SubmitReferralPage = () => {
  const [dragActive, setDragActive] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [referralType, setReferralType] = useState("real_estate");
  const [estimatedValue, setEstimatedValue] = useState("");
  const [additionalNotes, setAdditionalNotes] = useState("");
  const [document, setDocument] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setDocument(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setDocument(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async (action: 'submit' | 'draft') => {
    setIsLoading(true);
    setError("");
    
    const formData = new FormData();
    formData.append("full_name", fullName);
    formData.append("email", email);
    formData.append("phone_number", phoneNumber);
    formData.append("referral_type", referralType);
    formData.append("estimated_value", estimatedValue);
    formData.append("additional_notes", additionalNotes);
    formData.append("action", action);
    if (document) {
      formData.append("document", document);
    }

    try {
      await api.post("/referrals/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      navigate("/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to submit referral. Please check all fields.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="bg-white border border-line rounded-card px-5 py-3 flex items-center gap-3">
        <Info className="w-4 h-4 text-muted" strokeWidth={1.75} />
        <p className="text-[13px] text-muted">
          Please ensure all client information is accurate to expedite the
          vetting process. Secure handling of data is our priority.
        </p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-100 text-red-600 text-[14px] rounded-card">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">
        <div className="lg:col-span-2 space-y-5">
          <Section title="Client Information">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Field label="Full Name">
                <input 
                  className="field" 
                  placeholder="e.g. Jonathan Harker" 
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </Field>
              <Field label="Email Address">
                <input
                  type="email"
                  className="field"
                  placeholder="j.harker@enterprise.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </Field>
              <Field label="Phone Number" className="md:col-span-2">
                <input 
                  className="field" 
                  placeholder="+1 (555) 000-0000" 
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  required
                />
              </Field>
            </div>
          </Section>

          <Section title="Referral Details">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Field label="Referral Type">
                <div className="relative">
                  <select 
                    className="field appearance-none pr-9 cursor-pointer"
                    value={referralType}
                    onChange={(e) => setReferralType(e.target.value)}
                  >
                    {REFERRAL_TYPES.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
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
                    type="number"
                    className="field pl-7 text-right"
                    placeholder="0.00"
                    value={estimatedValue}
                    onChange={(e) => setEstimatedValue(e.target.value)}
                    required
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
                />
              </Field>
            </div>
          </Section>

          <Section title="Document Upload">
            {!document ? (
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragActive(true);
                }}
                onDragLeave={() => setDragActive(false)}
                onDrop={handleDrop}
                onClick={() => document.getElementById('file-upload')?.click()}
                className={cn(
                  "rounded-[8px] border border-dashed flex flex-col items-center justify-center py-12 transition-colors cursor-pointer",
                  dragActive
                    ? "border-ink bg-line-soft"
                    : "border-line hover:bg-line-soft/50",
                )}
              >
                <input 
                  type="file" 
                  id="file-upload" 
                  className="hidden" 
                  accept=".pdf,.docx,.xlsx"
                  onChange={handleFileChange}
                />
                <UploadCloud className="w-7 h-7 text-muted-2" strokeWidth={1.5} />
                <p className="mt-3 text-[14px] font-semibold text-ink">
                  Click to upload or drag and drop
                </p>
                <p className="mt-1 text-[12px] text-muted">
                  PDF, DOCX, or XLSX (Max 10MB)
                </p>
              </div>
            ) : (
              <div className="bg-light-gray rounded-[8px] p-4 flex items-center justify-between border border-line">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-md bg-white border border-line flex items-center justify-center">
                    <FileText className="w-5 h-5 text-ink" />
                  </div>
                  <div>
                    <p className="text-[13px] font-semibold text-ink">{document.name}</p>
                    <p className="text-[11px] text-muted">{(document.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                </div>
                <button 
                  onClick={() => setDocument(null)}
                  className="p-1 hover:bg-line-soft rounded-full text-muted hover:text-ink transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </Section>

          <div className="flex items-center justify-between pt-2">
            <button 
              onClick={() => handleSubmit('draft')}
              disabled={isLoading}
              className="text-[13px] font-semibold text-muted hover:text-ink transition-colors disabled:opacity-50"
            >
              Save Draft
            </button>
            <button 
              onClick={() => handleSubmit('submit')}
              disabled={isLoading}
              className="btn-primary disabled:opacity-70 min-w-[140px]"
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
          </div>
          {/* ... rest of sidebar remains static or can be dynamic later */}
        </aside>
      </div>
    </div>
  );
};

export default SubmitReferralPage;
