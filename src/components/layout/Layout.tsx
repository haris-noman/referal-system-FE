import { useEffect, useState } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutGrid,
  Network,
  FileText,
  Settings,
  HelpCircle,
  LogOut,
  Search,
  X,
  Mail,
  Phone,
  MessageSquare,
  Ticket,
  Activity,
  ChevronDown,
  Menu,
} from "lucide-react";
import { cn } from "../../lib/utils";
import { NetworkPortalBadge } from "../ui/Logo";
import { settingsApi } from "../../lib/settingsApi";
import { SearchProvider, useSearch } from "../../contexts/SearchContext";

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
  "/documents": "Document Center",
  "/settings": "Account Settings",
  "/support/email": "Support Center",
  "/support/contact": "Support Center",
  "/support/faq": "Support Center",
  "/support/send-message": "Support Center",
  "/support/submit-ticket": "Support Center",
  "/support/response-status": "Support Center",
};

const SEARCH_ENABLED_PATHS = new Set(["/dashboard", "/tracking"]);

const HeaderAvatar = ({
  src,
  fallback,
}: {
  src?: string | null;
  fallback: string;
}) => {
  const [failed, setFailed] = useState(false);
  const showImage = !!src && !failed;

  // Reset the failure flag when the user uploads a new image so we retry.
  useEffect(() => {
    setFailed(false);
  }, [src]);

  return (
    <div className="w-8 h-8 rounded-full bg-line-soft border border-line flex items-center justify-center text-[11px] font-bold text-muted overflow-hidden shrink-0">
      {showImage ? (
        <img
          src={src as string}
          alt=""
          className="w-full h-full object-cover"
          onError={() => setFailed(true)}
        />
      ) : (
        <span>{fallback}</span>
      )}
    </div>
  );
};

const SidebarLink = ({
  icon: Icon,
  label,
  href,
  active,
  onNavigate,
}: {
  icon: any;
  label: string;
  href: string;
  active?: boolean;
  onNavigate?: () => void;
}) => (
  <Link
    to={href}
    onClick={onNavigate}
    aria-current={active ? "page" : undefined}
    className={cn(
      "relative flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
      active
        ? "bg-line-soft text-ink font-semibold"
        : "text-muted hover:bg-line-soft hover:text-ink",
    )}
  >
    {active && (
      <span
        aria-hidden
        className="absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded-r-full"
        style={{ backgroundColor: "var(--color-accent)" }}
      />
    )}
    <Icon className="w-[18px] h-[18px]" strokeWidth={1.75} />
    <span>{label}</span>
  </Link>
);

const SupportDropdown = ({
  currentPath,
  onNavigate,
}: {
  currentPath: string;
  onNavigate?: () => void;
}) => {
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
          "relative w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
          inSupport
            ? "bg-line-soft text-ink font-semibold"
            : "text-muted hover:bg-line-soft hover:text-ink",
        )}
      >
        {inSupport && (
          <span
            aria-hidden
            className="absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded-r-full"
            style={{ backgroundColor: "var(--color-accent)" }}
          />
        )}
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
                  onClick={onNavigate}
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
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const { query, setQuery } = useSearch();
  const searchEnabled = SEARCH_ENABLED_PATHS.has(location.pathname);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const profile = await settingsApi.profile.get();
        setUser(profile);
        localStorage.setItem("user", JSON.stringify(profile));
      } catch (err) {
        console.error("Failed to fetch profile", err);
      }
    };

    fetchProfile();

    const onProfileUpdated = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail) setUser(detail);
    };
    window.addEventListener("profile-updated", onProfileUpdated);
    return () =>
      window.removeEventListener("profile-updated", onProfileUpdated);
  }, []);

  useEffect(() => {
    if (!searchEnabled && query) {
      setQuery("");
    }
    if (!searchEnabled) setMobileSearchOpen(false);
  }, [searchEnabled, query, setQuery]);

  // Close the sidebar drawer whenever the route changes on mobile.
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  // Lock body scroll while the mobile drawer is open.
  useEffect(() => {
    if (sidebarOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [sidebarOpen]);

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

  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="flex min-h-screen bg-canvas">
      {sidebarOpen && (
        <button
          type="button"
          aria-label="Close menu"
          onClick={closeSidebar}
          className="lg:hidden fixed inset-0 z-30 bg-black/40 backdrop-blur-[2px]"
        />
      )}

      <aside
        className={cn(
          "w-[232px] shrink-0 bg-surface border-r border-line flex flex-col fixed h-screen z-40 overflow-y-auto transition-transform duration-300 ease-in-out lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="px-6 pt-6 pb-8 flex items-center gap-3">
          <NetworkPortalBadge
            title="Network Portal"
            className="w-8 h-8 shrink-0"
          />
          <div className="min-w-0 flex-1">
            <h1 className="text-[14px] font-bold tracking-tight text-ink leading-none">
              Network Portal
            </h1>
            <p className="mt-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-2">
              Enterprise Admin
            </p>
          </div>
          <button
            type="button"
            onClick={closeSidebar}
            className="lg:hidden p-1.5 -mr-1 rounded-md text-muted hover:bg-line-soft hover:text-ink transition-colors"
            aria-label="Close menu"
          >
            <X className="w-4 h-4" strokeWidth={2} />
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-0.5">
          {NAV.map((item) => (
            <SidebarLink
              key={item.href}
              {...item}
              active={isActive(item)}
              onNavigate={closeSidebar}
            />
          ))}
        </nav>

        <div className="px-4 py-6 border-t border-line space-y-0.5">
          <SupportDropdown
            currentPath={location.pathname}
            onNavigate={closeSidebar}
          />
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm text-muted hover:bg-line-soft hover:text-ink transition-colors"
          >
            <LogOut className="w-[18px] h-[18px]" strokeWidth={1.75} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 lg:ml-[232px] min-h-screen flex flex-col min-w-0">
        <header className="h-[60px] bg-surface border-b border-line px-4 sm:px-6 lg:px-8 flex items-center justify-between sticky top-0 z-20 gap-3">
          <div className="flex items-center gap-3 sm:gap-6 min-w-0 flex-1">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 -ml-2 rounded-md text-ink hover:bg-line-soft transition-colors"
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5" strokeWidth={2} />
            </button>

            <span className="hidden sm:inline text-[12px] font-bold uppercase tracking-[0.12em] text-ink truncate">
              {title}
            </span>
            <span className="hidden md:inline h-5 w-px bg-line" />

            <div className="relative hidden md:block w-[260px] lg:w-[320px]">
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

            {searchEnabled && (
              <button
                type="button"
                onClick={() => setMobileSearchOpen((v) => !v)}
                className="md:hidden p-2 rounded-md text-ink hover:bg-line-soft transition-colors"
                aria-label="Search"
              >
                <Search className="w-5 h-5" strokeWidth={2} />
              </button>
            )}
          </div>

          <div className="flex items-center gap-3 sm:gap-5">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="hidden sm:block text-right max-w-[160px]">
                <p className="text-[13px] font-semibold text-ink leading-tight truncate">
                  {user?.full_name || "Guest User"}
                </p>
                <p className="text-[11px] text-muted leading-tight truncate">
                  {user?.role === "admin" ? "Administrator" : "Global Partner"}
                </p>
              </div>
              <HeaderAvatar
                src={user?.profile_image}
                fallback={getInitials(user?.full_name || "Guest User")}
              />
            </div>
          </div>
        </header>

        {searchEnabled && mobileSearchOpen && (
          <div className="md:hidden bg-surface border-b border-line px-4 py-2.5 sticky top-[60px] z-10">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-2" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by referrals"
                autoFocus
                className="field pl-9 pr-9"
              />
              {query && (
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
        )}

        <div className="px-4 sm:px-6 lg:px-10 py-6 lg:py-8 flex-1 bg-canvas min-w-0">
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
