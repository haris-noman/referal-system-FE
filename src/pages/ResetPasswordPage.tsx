import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  ArrowRight,
  ArrowLeft,
  Loader2,
  CheckCircle2,
  KeyRound,
} from "lucide-react";
import AuthShell from "../components/auth/AuthShell";
import FormField from "../components/auth/FormField";
import PasswordField from "../components/auth/PasswordField";
import PasswordStrength, {
  evaluatePassword,
} from "../components/auth/PasswordStrength";
import Alert from "../components/auth/Alert";
import api from "../lib/api";

type Step = "verify" | "reset" | "success";

type Errors = Partial<{
  code: string;
  password: string;
  confirm: string;
  form: string;
}>;

const splitCode = (raw: string): { uid: string; token: string } | null => {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  const sep = trimmed.includes(":") ? ":" : trimmed.includes("-") ? "-" : null;
  if (!sep) return null;
  const idx = trimmed.indexOf(sep);
  const uid = trimmed.slice(0, idx).trim();
  const token = trimmed.slice(idx + 1).trim();
  if (!uid || !token) return null;
  return { uid, token };
};

const ResetPasswordPage = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  const initialUid = params.get("uid") || "";
  const initialToken = params.get("token") || "";

  const [uid, setUid] = useState(initialUid);
  const [token, setToken] = useState(initialToken);
  const [code, setCode] = useState(
    initialUid && initialToken ? `${initialUid}:${initialToken}` : "",
  );
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [isLoading, setIsLoading] = useState(false);

  const hasLinkCreds = Boolean(initialUid && initialToken);
  const [step, setStep] = useState<Step>(hasLinkCreds ? "reset" : "verify");

  const passwordStrong = useMemo(
    () => evaluatePassword(password).score >= 3,
    [password],
  );

  // Keep state in sync if the user navigates back to /reset-password
  // with new query params from a fresh email link.
  useEffect(() => {
    if (initialUid && initialToken) {
      setUid(initialUid);
      setToken(initialToken);
      setCode(`${initialUid}:${initialToken}`);
      setStep((prev) => (prev === "success" ? prev : "reset"));
    }
  }, [initialUid, initialToken]);

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = splitCode(code);
    if (!parsed) {
      setErrors({
        code: "Enter a valid reset code in the format \"uid:token\".",
      });
      return;
    }
    setUid(parsed.uid);
    setToken(parsed.token);
    setErrors({});
    setStep("reset");
  };

  const validateReset = (): Errors => {
    const next: Errors = {};
    const { score } = evaluatePassword(password);
    if (!password) next.password = "Password is required.";
    else if (password.length < 8)
      next.password = "Password must be at least 8 characters.";
    else if (score < 2)
      next.password = "Choose a stronger password (mix letters and numbers).";
    if (!confirm) next.confirm = "Please confirm your new password.";
    else if (confirm !== password) next.confirm = "Passwords do not match.";
    return next;
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    const v = validateReset();
    if (Object.keys(v).length > 0) {
      setErrors(v);
      return;
    }
    setErrors({});
    setIsLoading(true);
    try {
      await api.post("/auth/password-reset-confirm/", {
        uid,
        token,
        new_password: password,
      });
      setStep("success");
    } catch (err: any) {
      const data = err.response?.data || {};
      const fieldErr =
        data.new_password?.[0] ||
        data.password?.[0] ||
        data.token?.[0] ||
        data.uid?.[0];
      const formMsg =
        data.detail ||
        data.message ||
        fieldErr ||
        "We couldn't reset your password. The link may have expired.";

      // If the token is invalid, send the user back to the verify step.
      if (data.token || data.uid) {
        setStep("verify");
        setErrors({ code: formMsg });
      } else if (data.new_password || data.password) {
        setErrors({ password: formMsg });
      } else {
        setErrors({ form: formMsg });
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (step === "success") {
    return (
      <AuthShell
        title="Password Updated"
        subtitle="Your password has been reset successfully. You can now sign in with your new credentials."
      >
        <div className="space-y-6 text-center">
          <div className="flex justify-center">
            <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-7 h-7" strokeWidth={1.75} />
            </div>
          </div>
          <button
            type="button"
            onClick={() => navigate("/login", { replace: true })}
            className="btn-primary w-full py-3"
          >
            Continue to Sign In
            <ArrowRight className="w-4 h-4" strokeWidth={2} />
          </button>
        </div>
      </AuthShell>
    );
  }

  if (step === "verify") {
    return (
      <AuthShell
        title="Enter Reset Code"
        subtitle="Paste the reset code from your email. The code is in the format uid:token."
        footer={
          <Link
            to="/forgot-password"
            className="inline-flex items-center gap-1.5 font-semibold text-ink hover:underline"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Request a new link
          </Link>
        }
      >
        <form onSubmit={handleVerify} className="space-y-5" noValidate>
          {errors.form && <Alert variant="error">{errors.form}</Alert>}

          <FormField
            name="code"
            type="text"
            label="Reset Code"
            placeholder="MQ:abc123-xyz789"
            icon={<KeyRound className="w-4 h-4" />}
            value={code}
            onChange={(e) => {
              setCode(e.target.value);
              if (errors.code) setErrors({});
            }}
            error={errors.code}
            hint="Tip: opening the link from your email skips this step automatically."
            autoFocus
            autoComplete="one-time-code"
            spellCheck={false}
          />

          <button
            type="submit"
            className="btn-primary w-full py-3"
            disabled={isLoading}
          >
            Continue
            <ArrowRight className="w-4 h-4" strokeWidth={2} />
          </button>
        </form>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Set a New Password"
      subtitle="Choose a strong password that you don't use on other sites."
      footer={
        <Link
          to="/login"
          className="inline-flex items-center gap-1.5 font-semibold text-ink hover:underline"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
        </Link>
      }
    >
      <form onSubmit={handleReset} className="space-y-5" noValidate>
        {errors.form && <Alert variant="error">{errors.form}</Alert>}

        <div className="space-y-2">
          <PasswordField
            name="new-password"
            label="New Password"
            placeholder="Create a new password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
            }}
            error={errors.password}
            autoComplete="new-password"
            autoFocus
          />
          <PasswordStrength password={password} />
        </div>

        <PasswordField
          name="confirm-password"
          label="Confirm Password"
          placeholder="Re-enter your new password"
          value={confirm}
          onChange={(e) => {
            setConfirm(e.target.value);
            if (errors.confirm) setErrors((prev) => ({ ...prev, confirm: undefined }));
          }}
          error={errors.confirm}
          autoComplete="new-password"
        />

        <button
          type="submit"
          className="btn-primary w-full py-3 disabled:opacity-70"
          disabled={isLoading || !password || !confirm || !passwordStrong}
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              Reset Password
              <ArrowRight className="w-4 h-4" strokeWidth={2} />
            </>
          )}
        </button>
      </form>
    </AuthShell>
  );
};

export default ResetPasswordPage;
