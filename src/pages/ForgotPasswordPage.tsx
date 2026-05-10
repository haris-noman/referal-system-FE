import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Mail, ArrowRight, ArrowLeft, Loader2, MailCheck } from "lucide-react";
import AuthShell from "../components/auth/AuthShell";
import FormField from "../components/auth/FormField";
import Alert from "../components/auth/Alert";
import api from "../lib/api";

const RESEND_COOLDOWN = 45;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [submittedEmail, setSubmittedEmail] = useState<string | null>(null);
  const [fieldError, setFieldError] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const id = window.setInterval(() => {
      setCooldown((c) => (c > 0 ? c - 1 : 0));
    }, 1000);
    return () => window.clearInterval(id);
  }, [cooldown]);

  const validate = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return "Email address is required.";
    if (!EMAIL_RE.test(trimmed)) return "Enter a valid email address.";
    return "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const v = validate(email);
    if (v) {
      setFieldError(v);
      return;
    }
    setFieldError("");
    setError("");
    setIsLoading(true);
    try {
      const trimmed = email.trim();
      await api.post("/auth/password-reset/", { email: trimmed });
      setSubmittedEmail(trimmed);
      setCooldown(RESEND_COOLDOWN);
    } catch (err: any) {
      const detail =
        err.response?.data?.email?.[0] ||
        err.response?.data?.detail ||
        err.response?.data?.message ||
        "Unable to send reset link. Please try again in a moment.";
      setError(detail);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (cooldown > 0 || !submittedEmail) return;
    setError("");
    setIsLoading(true);
    try {
      await api.post("/auth/password-reset/", { email: submittedEmail });
      setCooldown(RESEND_COOLDOWN);
    } catch (err: any) {
      setError(
        err.response?.data?.detail ||
          "Couldn't resend the email. Please try again shortly.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (submittedEmail) {
    return (
      <AuthShell
        title="Check your email"
        subtitle="If an account exists for the address below, we've sent a secure link to reset your password."
        footer={
          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 font-semibold text-ink hover:underline"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
          </Link>
        }
      >
        <div className="space-y-5">
          <div className="flex flex-col items-center text-center gap-3 py-2">
            <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <MailCheck className="w-6 h-6" strokeWidth={1.75} />
            </div>
            <p className="text-[13px] text-muted">
              Reset link sent to{" "}
              <span className="font-semibold text-ink break-all">
                {submittedEmail}
              </span>
            </p>
          </div>

          {error && <Alert variant="error">{error}</Alert>}

          <div className="rounded-[8px] bg-line-soft px-4 py-3 text-[12px] text-muted leading-relaxed">
            The link expires in <span className="font-semibold text-ink">30 minutes</span>.
            Don't see it? Check your spam folder, or resend below.
          </div>

          <button
            type="button"
            onClick={handleResend}
            disabled={isLoading || cooldown > 0}
            className="btn-secondary w-full py-3 disabled:opacity-60"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : cooldown > 0 ? (
              `Resend available in ${cooldown}s`
            ) : (
              "Resend Email"
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              setSubmittedEmail(null);
              setEmail("");
              setError("");
              setCooldown(0);
            }}
            className="w-full text-center text-[12px] font-medium text-muted hover:text-ink transition-colors"
          >
            Use a different email address
          </button>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Forgot Password?"
      subtitle="Enter the email associated with your account and we'll send you a secure link to reset your password."
      footer={
        <>
          Remembered it?{" "}
          <Link to="/login" className="font-semibold text-ink hover:underline">
            Back to Sign In
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        {error && <Alert variant="error">{error}</Alert>}

        <FormField
          name="email"
          type="email"
          label="Email Address"
          placeholder="name@organization.com"
          icon={<Mail className="w-4 h-4" />}
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (fieldError) setFieldError("");
          }}
          onBlur={() => {
            if (email) setFieldError(validate(email));
          }}
          error={fieldError}
          autoComplete="email"
          autoFocus
          required
        />

        <button
          type="submit"
          className="btn-primary w-full py-3 disabled:opacity-70"
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              Send Reset Link
              <ArrowRight className="w-4 h-4" strokeWidth={2} />
            </>
          )}
        </button>

        <div className="pt-4 border-t border-line text-center">
          <Link
            to="/reset-password"
            className="text-[12px] font-medium text-muted hover:text-ink"
          >
            Already have a reset code? Enter it manually
          </Link>
        </div>
      </form>
    </AuthShell>
  );
};

export default ForgotPasswordPage;
