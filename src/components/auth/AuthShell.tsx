import type { ReactNode } from "react";
import { ShieldCheck, BadgeCheck } from "lucide-react";
import { NetworkPortalLogo } from "../ui/Logo";

type AuthShellProps = {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
  showTrustBadges?: boolean;
};

const AuthShell = ({
  title,
  subtitle,
  children,
  footer,
  showTrustBadges = true,
}: AuthShellProps) => {
  return (
    <div className="min-h-screen bg-canvas flex flex-col">
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 py-10 sm:py-16">
        <div className="w-full max-w-[420px]">
          <div className="flex flex-col items-center text-center mb-8 sm:mb-10">
            <NetworkPortalLogo
              title="Network Portal"
              className="h-8 sm:h-9 w-auto mb-4 sm:mb-5"
            />
            <h1 className="text-[22px] sm:text-[26px] font-bold tracking-tight text-ink">
              {title}
            </h1>
            {subtitle && (
              <p className="text-[13px] sm:text-sm text-muted mt-1.5 max-w-[340px]">
                {subtitle}
              </p>
            )}
          </div>

          <div className="bg-white border border-line rounded-card p-6 sm:p-8">
            {children}
          </div>

          {footer && (
            <div className="mt-5 text-center text-[13px] text-muted">
              {footer}
            </div>
          )}

          {showTrustBadges && (
            <div className="mt-7 sm:mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[12px] text-muted-2">
              <span className="inline-flex items-center gap-2">
                <ShieldCheck className="w-4 h-4" strokeWidth={1.75} />
                Secure 256-bit Encryption
              </span>
              <span className="inline-flex items-center gap-2">
                <BadgeCheck className="w-4 h-4" strokeWidth={1.75} />
                Compliance Verified
              </span>
            </div>
          )}
        </div>
      </div>

      <footer className="bg-canvas py-5 sm:py-6 text-center px-4">
        <p className="text-[11px] text-muted-2">
          © 2024 Referral Network Portal. All rights reserved. Professional Use
          Only.
        </p>
        <div className="mt-2 flex flex-wrap justify-center gap-x-6 gap-y-1 text-[11px] font-medium text-muted">
          <button className="hover:text-ink">Privacy Policy</button>
          <button className="hover:text-ink">Terms of Service</button>
          <button className="hover:text-ink">System Status</button>
        </div>
      </footer>
    </div>
  );
};

export default AuthShell;
