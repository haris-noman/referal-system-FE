import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutGrid,
  Network,
  FileText,
  Settings,
  HelpCircle,
  LogOut,
  Bell,
  Search,
} from "lucide-react";
import { cn } from "../../lib/utils";

const NAV = [
  { icon: LayoutGrid, label: "Dashboard", href: "/dashboard" },
  {
    icon: Network,
    label: "Referrals",
    href: "/tracking",
    match: ["/tracking", "/submit"],
  },
  { icon: FileText, label: "Documents", href: "/documents" },
  { icon: Settings, label: "Settings", href: "/settings" },
];

const TITLES: Record<string, string> = {
  "/dashboard": "Referral Portal",
  "/tracking": "Referral Portal",
  "/submit": "Referral Form",
};

const SidebarLink = ({
  icon: Icon,
  label,
  href,
  active,
}: {
  icon: any;
  label: string;
  href: string;
  active?: boolean;
}) => (
  <Link
    to={href}
    className={cn(
      "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
      active
        ? "bg-line-soft text-ink font-semibold"
        : "text-muted hover:bg-line-soft hover:text-ink",
    )}
  >
    <Icon className="w-[18px] h-[18px]" strokeWidth={1.75} />
    <span>{label}</span>
  </Link>
);

const Layout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const title = TITLES[location.pathname] ?? "Referral Portal";

  const isActive = (item: (typeof NAV)[number]) => {
    if (item.match) return item.match.includes(location.pathname);
    return location.pathname === item.href;
  };

  return (
    <div className="flex min-h-screen bg-canvas">
      <aside className="w-[232px] shrink-0 bg-white border-r border-line flex flex-col fixed h-screen z-20">
        <div className="px-6 pt-6 pb-8">
          <h1 className="text-[15px] font-bold tracking-tight text-ink leading-none">
            Network Portal
          </h1>
          <p className="mt-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-2">
            Enterprise Admin
          </p>
        </div>

        <nav className="flex-1 px-4 space-y-0.5">
          {NAV.map((item) => (
            <SidebarLink key={item.href} {...item} active={isActive(item)} />
          ))}
        </nav>

        <div className="px-4 py-6 border-t border-line space-y-0.5">
          <SidebarLink icon={HelpCircle} label="Support" href="/support" />
          <button
            onClick={() => navigate("/login")}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm text-muted hover:bg-line-soft hover:text-ink transition-colors"
          >
            <LogOut className="w-[18px] h-[18px]" strokeWidth={1.75} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 ml-[232px] min-h-screen flex flex-col">
        <header className="h-[60px] bg-white border-b border-line px-8 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-6">
            <span className="text-[12px] font-bold uppercase tracking-[0.12em] text-ink">
              {title}
            </span>
            <span className="h-5 w-px bg-line" />
            <div className="relative w-[320px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-2" />
              <input
                type="text"
                placeholder="Search referrals..."
                className="w-full bg-transparent border-0 py-2 pl-9 pr-3 text-sm placeholder:text-muted-2 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex items-center gap-5">
            <button className="relative text-muted hover:text-ink transition-colors">
              <Bell className="w-[18px] h-[18px]" strokeWidth={1.75} />
              <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-red-500 rounded-full" />
            </button>
            <div className="h-5 w-px bg-line" />
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-[13px] font-semibold text-ink leading-tight">
                  Alex Thompson
                </p>
                <p className="text-[11px] text-muted leading-tight">
                  Global Partner
                </p>
              </div>
              <div className="w-8 h-8 rounded-full bg-line-soft flex items-center justify-center text-[11px] font-bold text-muted">
                AT
              </div>
            </div>
          </div>
        </header>

        <div className="px-10 py-8 flex-1 bg-[#FCF8FA]">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
