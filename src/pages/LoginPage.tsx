import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, ArrowRight, ShieldCheck, BadgeCheck, Loader2 } from "lucide-react";
import { NetworkPortalLogo } from "../components/ui/Logo";
import api from "../lib/api";

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    
    try {
      const response = await api.post("/auth/login/", { email, password });
      const { access, role, full_name } = response.data;
      
      localStorage.setItem("access_token", access);
      localStorage.setItem("user", JSON.stringify({ role, full_name, email }));
      
      navigate("/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.detail || "Invalid email or password. Please try again.");
    } finally {
      setIsLoading(false);
    }
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
                    className="field pl-9 pr-10"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
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
