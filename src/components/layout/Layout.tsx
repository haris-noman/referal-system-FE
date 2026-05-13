import { useEffect, useState } from "react";
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
  X,
  Mail,
  Phone,
  MessageSquare,
  Ticket,
  Activity,
  ChevronDown,
} from "lucide-react";
import { cn } from "../../lib/utils";
import { NetworkPortalBadge } from "../ui/Logo";
import api from "../../lib/api";
import { SearchProvider, useSearch } from "../../contexts/SearchContext";

const NAV = [
  { icon: LayoutGrid, label: "Dashboard", href: "/dashboard" },
  {
    icon: Network,
    label: "Referrals",
    href: "/tracking",
    match: ["/tracking", "/submit"],
  },
  { icon: FileText, label: "Documents", href: "#" },
  { icon: Settings, label: "Settings", href: "#" },
];

export const SUPPORT_ITEMS = [
  { icon: Mail, label: "Support Email", href: "/support/email" },
  { icon: Phone, label: "Contact Number", href: "/support/contact" },
  { icon: HelpCircle, label: "FAQ Section", href: "/support/faq" },
  { icon: MessageSquare, label: "Send Message", href: "/support/send-message" },
  { icon: Ticket, label: "Submit Ticket", href: "/support/submit-ticket" },
  {
    icon: Activity,
    label: "Response Status",
    href: "/support/response-status",
  },
];

const TITLES: Record<string, string> = {
  "/dashboard": "Referral Portal",
  "/tracking": "Referral Portal",
  "/submit": "Referral Form",
  "/support/email": "Support Center",
  "/support/contact": "Support Center",
  "/support/faq": "Support Center",
  "/support/send-message": "Support Center",
  "/support/submit-ticket": "Support Center",
  "/support/response-status": "Support Center",
};

const SEARCH_ENABLED_PATHS = new Set(["/dashboard", "/tracking"]);

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

const SupportDropdown = ({ currentPath }: { currentPath: string }) => {
  const inSupport = currentPath.startsWith("/support");
  const [open, setOpen] = useState(inSupport);

  useEffect(() => {
    if (inSupport) setOpen(true);
  }, [inSupport]);

  return (
    <div className="select-none">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="support-submenu"
        className={cn(
          "w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
          inSupport
            ? "bg-line-soft text-ink font-semibold"
            : "text-muted hover:bg-line-soft hover:text-ink",
        )}
      >
        <HelpCircle className="w-[18px] h-[18px]" strokeWidth={1.75} />
        <span className="flex-1 text-left">Support</span>
        <ChevronDown
          className={cn(
            "w-4 h-4 text-muted-2 transition-transform duration-300",
            open && "rotate-180",
          )}
          strokeWidth={2}
        />
      </button>

      <div
        id="support-submenu"
        className={cn(
          "grid transition-[grid-template-rows,opacity,margin] duration-300 ease-in-out",
          open
            ? "grid-rows-[1fr] opacity-100 mt-1"
            : "grid-rows-[0fr] opacity-0 mt-0",
        )}
      >
        <div className="overflow-hidden">
          <div className="ml-3 pl-3 border-l border-line space-y-0.5 py-0.5">
            {SUPPORT_ITEMS.map((item) => {
              const active = currentPath === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={cn(
                    "flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-[12.5px] transition-colors",
                    active
                      ? "bg-line-soft text-ink font-semibold"
                      : "text-muted hover:bg-line-soft hover:text-ink",
                  )}
                >
                  <Icon className="w-3.5 h-3.5" strokeWidth={1.75} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

const LayoutInner = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const title = TITLES[location.pathname] ?? "Referral Portal";
  const [user, setUser] = useState<any>(null);
  const { query, setQuery } = useSearch();
  const searchEnabled = SEARCH_ENABLED_PATHS.has(location.pathname);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get("/auth/profile/");
        setUser(response.data);
        localStorage.setItem("user", JSON.stringify(response.data));
      } catch (err) {
        console.error("Failed to fetch profile", err);
      }
    };

    fetchProfile();
  }, []);

  useEffect(() => {
    if (!searchEnabled && query) {
      setQuery("");
    }
  }, [searchEnabled, query, setQuery]);

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const isActive = (item: (typeof NAV)[number]) => {
    if (item.match) return item.match.includes(location.pathname);
    return location.pathname === item.href;
  };

  const getInitials = (name: string) => {
    return (
      name
        ?.split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase() || "U"
    );
  };

  return (
    <div className="flex min-h-screen bg-canvas">
      <aside className="w-[232px] shrink-0 bg-white border-r border-line flex flex-col fixed h-screen z-20 overflow-y-auto">
        <div className="px-6 pt-6 pb-8 flex items-center gap-3">
          <NetworkPortalBadge
            title="Network Portal"
            className="w-8 h-8 shrink-0"
          />
          <div className="min-w-0">
            <h1 className="text-[14px] font-bold tracking-tight text-ink leading-none">
              Network Portal
            </h1>
            <p className="mt-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-2">
              Enterprise Admin
            </p>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-0.5">
          {NAV.map((item) => (
            <SidebarLink key={item.href} {...item} active={isActive(item)} />
          ))}
        </nav>

        <div className="px-4 py-6 border-t border-line space-y-0.5">
          <SupportDropdown currentPath={location.pathname} />
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm text-muted hover:bg-line-soft hover:text-ink transition-colors"
          >
            <LogOut className="w-[18px] h-[18px]" strokeWidth={1.75} />
            <span>Logout</span>
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
              {searchEnabled && (
                <>
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-2" />
                  <input
                    type="text"
                    value={searchEnabled ? query : ""}
                    onChange={(e) => setQuery(e.target.value)}
                    disabled={!searchEnabled}
                    placeholder={
                      searchEnabled ? "Search by referrals" : "Search"
                    }
                    className="w-full bg-transparent border-0 py-2 pl-9 pr-9 text-sm placeholder:text-muted-2 focus:outline-none disabled:cursor-not-allowed"
                  />
                </>
              )}

              {searchEnabled && query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  aria-label="Clear search"
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-full text-muted-2 hover:text-ink hover:bg-line-soft transition-colors"
                >
                  <X className="w-3.5 h-3.5" strokeWidth={2} />
                </button>
              )}
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
                  {user?.full_name || "Guest User"}
                </p>
                <p className="text-[11px] text-muted leading-tight">
                  {user?.role === "admin" ? "Administrator" : "Global Partner"}
                </p>
              </div>
              <div className="w-8 h-8 rounded-full bg-line-soft flex items-center justify-center text-[11px] font-bold text-muted">
                {getInitials(user?.full_name || "Guest User")}
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

const Layout = () => (
  <SearchProvider>
    <LayoutInner />
  </SearchProvider>
);

export default Layout;
