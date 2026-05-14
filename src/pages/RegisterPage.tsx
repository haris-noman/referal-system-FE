import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, User, ArrowRight, ShieldCheck, BadgeCheck, Loader2 } from "lucide-react";
import { NetworkPortalLogo } from "../components/ui/Logo";
import api from "../lib/api";

const RegisterPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState("partner");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    
    try {
      const response = await api.post("/auth/register/", { 
        email, 
        password, 
        full_name: fullName, 
        role 
      });
      const { access, user } = response.data;
      
      localStorage.setItem("access_token", access);
      localStorage.setItem("user", JSON.stringify(user));
      
      navigate("/dashboard");
    } catch (err: any) {
      const detail = err.response?.data?.detail || err.response?.data?.email?.[0] || "Registration failed. Please try again.";
      setError(detail);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-canvas flex flex-col">
      <div className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-[420px]">
          <div className="flex flex-col items-center text-center mb-10">
            <NetworkPortalLogo title="Network Portal" className="h-9 w-auto mb-5" />
            <h1 className="text-[26px] font-bold tracking-tight text-ink">
              Create Account
            </h1>
            <p className="text-sm text-muted mt-1.5">
              Join the Enterprise Referral Network
            </p>
          </div>

          <div className="bg-white border border-line rounded-card p-8">
            <form onSubmit={handleRegister} className="space-y-5">
              {error && (
                <div className="p-3 bg-red-50 border border-red-100 text-red-600 text-[13px] rounded-md">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <label className="eyebrow">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-2" />
                  <input
                    type="text"
                    placeholder="John Doe"
                    className="field pl-9"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                  />
                </div>
              </div>
              
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
                <label className="eyebrow">Password</label>
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
                    Create Account
                    <ArrowRight className="w-4 h-4" strokeWidth={2} />
                  </>
                )}
              </button>

              <div className="pt-5 border-t border-line">
                <p className="text-center text-[13px] text-muted">
                  Already have an account?{" "}
                  <Link
                    to="/login"
                    className="font-semibold text-ink hover:underline"
                  >
                    Sign In
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

      <footer className="bg-canvas py-6 text-center">
        <p className="text-[11px] text-muted-2">
          © 2024 Referral Network Portal. All rights reserved. Professional Use
          Only.
        </p>
      </footer>
    </div>
  );
};

export default RegisterPage;
