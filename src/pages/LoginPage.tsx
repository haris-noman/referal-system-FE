import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Mail,
  Lock,
  ArrowRight,
  ShieldCheck,
  BadgeCheck,
  Loader2,
  KeyRound,
  ArrowLeft,
} from "lucide-react";
import { NetworkPortalLogo } from "../components/ui/Logo";
import { authApi, persistSession } from "../lib/authApi";
import { extractSettingsError } from "../lib/settingsApi";

type Stage = "credentials" | "two-factor";

const CODE_LENGTH = 6;

const LoginPage = () => {
  const [stage, setStage] = useState<Stage>("credentials");
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("partner");
  const [tempToken, setTempToken] = useState("");
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const codeInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (stage === "two-factor") {
      const id = window.setTimeout(() => codeInputRef.current?.focus(), 50);
      return () => window.clearTimeout(id);
    }
  }, [stage]);

  const finishLogin = (
    access: string,
    role: "partner" | "admin",
    fullName: string,
  ) => {
    persistSession({ access, role, full_name: fullName, email });
    navigate("/dashboard");
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setInfo("");

    try {
      const data = await authApi.login({ email, password });

      if (data.requires_2fa && data.temp_token) {
        setTempToken(data.temp_token);
        setCode("");
        setStage("two-factor");
        setInfo("We've emailed a 6-digit verification code.");
        return;
      }

      if (!data.access || !data.role || !data.full_name) {
        setError("Unexpected response from server. Please try again.");
        return;
      }

      finishLogin(data.access, data.role, data.full_name);
    } catch (err) {
      setError(
        extractSettingsError(
          err,
          "Invalid email or password. Please try again.",
        ),
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const data = await authApi.verify2fa({
        temp_token: tempToken,
        code: code.trim(),
      });
      finishLogin(data.access, data.role, data.full_name);
    } catch (err) {
      setError(
        extractSettingsError(err, "Verification failed. Please try again."),
      );
    } finally {
      setIsLoading(false);
    }
  };

  const resendCode = async () => {
    setIsLoading(true);
    setError("");
    setInfo("");
    try {
      const data = await authApi.login({ email, password });
      if (data.requires_2fa && data.temp_token) {
        setTempToken(data.temp_token);
        setCode("");
        setInfo("A new verification code has been sent to your email.");
      } else if (data.access && data.role && data.full_name) {
        finishLogin(data.access, data.role, data.full_name);
      }
    } catch (err) {
      setError(
        extractSettingsError(err, "Couldn't resend the code. Try again."),
      );
    } finally {
      setIsLoading(false);
    }
  };

  const backToCredentials = () => {
    setStage("credentials");
    setTempToken("");
    setCode("");
    setError("");
    setInfo("");
  };

  return (
    <div className="min-h-screen bg-canvas flex flex-col">
      <div className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-[420px]">
          <div className="flex flex-col items-center text-center mb-10">
            <NetworkPortalLogo
              title="Network Portal"
              className="h-9 w-auto mb-5"
            />
            <h1 className="text-[26px] font-bold tracking-tight text-ink">
              Network Portal
            </h1>
            <p className="text-sm text-muted mt-1.5">
              Enterprise Referral Administration
            </p>
          </div>

          <div className="bg-white border border-line rounded-card p-8">
            {stage === "credentials" ? (
              <form onSubmit={handleSignIn} className="space-y-5">
                {error && (
                  <div className="p-3 bg-red-50 border border-red-100 text-red-600 text-[13px] rounded-md">
                    {error}
                  </div>
                )}

                <div className="space-y-2">
                  <label className="eyebrow">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-2" />
                    <input
                      type="email"
                      placeholder="name@organization.com"
                      className="field pl-9"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      autoComplete="email"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="eyebrow">Password</label>
                    <Link
                      to="/forgot-password"
                      className="text-[11px] font-semibold text-ink hover:underline"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-2" />
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      className="field pl-9 pr-14"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-semibold uppercase tracking-wider text-muted hover:text-ink"
                    >
                      {showPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="eyebrow">Account Type</label>
                  <select
                    className="field appearance-none cursor-pointer bg-no-repeat pr-9"
                    style={{
                      backgroundImage:
                        "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%236B7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><polyline points='6 9 12 15 18 9'/></svg>\")",
                      backgroundPosition: "right 12px center",
                    }}
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                  >
                    <option value="partner">Partner</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="btn-primary w-full mt-2 py-3 disabled:opacity-70"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      Sign In
                      <ArrowRight className="w-4 h-4" strokeWidth={2} />
                    </>
                  )}
                </button>

                <div className="pt-5 border-t border-line">
                  <p className="text-center text-[13px] text-muted">
                    New to the network?{" "}
                    <Link
                      to="/register"
                      className="font-semibold text-ink hover:underline"
                    >
                      Register
                    </Link>
                  </p>
                </div>
              </form>
            ) : (
              <form onSubmit={handleVerify} className="space-y-5">
                <div className="flex flex-col items-center text-center -mt-2">
                  <div className="w-12 h-12 rounded-full bg-line-soft text-ink flex items-center justify-center mb-3">
                    <KeyRound className="w-5 h-5" strokeWidth={1.75} />
                  </div>
                  <h2 className="text-[16px] font-semibold text-ink">
                    Verification required
                  </h2>
                  <p className="mt-1 text-[12.5px] text-muted">
                    Enter the {CODE_LENGTH}-digit code we sent to{" "}
                    <span className="font-semibold text-ink">{email}</span>.
                  </p>
                </div>

                {error && (
                  <div className="p-3 bg-red-50 border border-red-100 text-red-600 text-[13px] rounded-md">
                    {error}
                  </div>
                )}
                {info && !error && (
                  <div className="p-3 bg-info-bg border border-blue-100 text-info-fg text-[13px] rounded-md">
                    {info}
                  </div>
                )}

                <div className="space-y-2">
                  <label className="eyebrow">Verification Code</label>
                  <input
                    ref={codeInputRef}
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    pattern="\d{6}"
                    maxLength={CODE_LENGTH}
                    value={code}
                    onChange={(e) =>
                      setCode(
                        e.target.value.replace(/\D/g, "").slice(0, CODE_LENGTH),
                      )
                    }
                    placeholder="123456"
                    className="field text-center tracking-[0.5em] text-[18px] font-semibold"
                    required
                  />
                  <p className="text-[11px] text-muted-2">
                    Code expires in 10 minutes. Check your spam folder if you
                    don't see it.
                  </p>
                </div>

                <button
                  type="submit"
                  className="btn-primary w-full mt-2 py-3 disabled:opacity-70"
                  disabled={isLoading || code.length !== CODE_LENGTH}
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      Verify &amp; Continue
                      <ArrowRight className="w-4 h-4" strokeWidth={2} />
                    </>
                  )}
                </button>

                <div className="flex items-center justify-between pt-2 text-[12px]">
                  <button
                    type="button"
                    onClick={backToCredentials}
                    className="inline-flex items-center gap-1 font-medium text-muted hover:text-ink transition-colors"
                  >
                    <ArrowLeft className="w-3 h-3" strokeWidth={2} />
                    Back to sign in
                  </button>
                  <button
                    type="button"
                    onClick={resendCode}
                    disabled={isLoading}
                    className="font-semibold text-ink hover:underline disabled:opacity-60"
                  >
                    Resend code
                  </button>
                </div>
              </form>
            )}
          </div>

          <div className="mt-8 flex items-center justify-center gap-8 text-[12px] text-muted-2">
            <span className="inline-flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" strokeWidth={1.75} />
              Secure 256-bit Encryption
            </span>
            <span className="inline-flex items-center gap-2">
              <BadgeCheck className="w-4 h-4" strokeWidth={1.75} />
              Compliance Verified
            </span>
          </div>
        </div>
      </div>

      <footer className="bg-canvas py-6 text-center">
        <p className="text-[11px] text-muted-2">
          © 2024 Referral Network Portal. All rights reserved. Professional Use
          Only.
        </p>
        <div className="mt-2 flex justify-center gap-6 text-[11px] font-medium text-muted">
          <button className="hover:text-ink">Privacy Policy</button>
          <button className="hover:text-ink">Terms of Service</button>
          <button className="hover:text-ink">System Status</button>
        </div>
      </footer>
    </div>
  );
};

export default LoginPage;
