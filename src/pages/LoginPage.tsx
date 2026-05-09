import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, ArrowRight, ShieldCheck, BadgeCheck } from "lucide-react";
import { NetworkPortalLogo } from "../components/ui/Logo";

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-[#FCF8FA] flex flex-col">
      <div className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-[420px]">
          <div className="flex flex-col items-center text-center mb-10">
            <NetworkPortalLogo title="Network Portal" className="h-9 w-auto mb-5" />
            <h1 className="text-[26px] font-bold tracking-tight text-ink">
              Network Portal
            </h1>
            <p className="text-sm text-muted mt-1.5">
              Enterprise Referral Administration
            </p>
          </div>

          <div className="bg-white border border-line rounded-card p-8">
            <form onSubmit={handleSignIn} className="space-y-5">
              <div className="space-y-2">
                <label className="eyebrow">Access Role</label>
                <select
                  className="field appearance-none cursor-pointer bg-no-repeat pr-9"
                  style={{
                    backgroundImage:
                      "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%236B7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><polyline points='6 9 12 15 18 9'/></svg>\")",
                    backgroundPosition: "right 12px center",
                  }}
                >
                  <option>Partner</option>
                  <option>Administrator</option>
                  <option>Reviewer</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="eyebrow">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-2" />
                  <input
                    type="email"
                    placeholder="name@organization.com"
                    className="field pl-9"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="eyebrow">Password</label>
                  <button
                    type="button"
                    className="text-[11px] font-semibold text-ink hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-2" />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="field pl-9 pr-10"
                    required
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

              <button type="submit" className="btn-primary w-full mt-2 py-3">
                Sign In
                <ArrowRight className="w-4 h-4" strokeWidth={2} />
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

      <footer className="bg-[#FCF8FA] py-6 text-center">
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
