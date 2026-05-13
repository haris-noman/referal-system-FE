import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { User, Shield, Bell, Sliders } from "lucide-react";
import Tabs, { type TabItem } from "../../components/ui/Tabs";
import ProfileTab from "./tabs/ProfileTab";
import SecurityTab from "./tabs/SecurityTab";
import NotificationsTab from "./tabs/NotificationsTab";
import ReferralConfigTab from "./tabs/ReferralConfigTab";

type TabKey = "profile" | "security" | "notifications" | "referral";

const TABS: TabItem<TabKey>[] = [
  { value: "profile", label: "Profile", icon: User },
  { value: "security", label: "Security", icon: Shield },
  { value: "notifications", label: "Notifications", icon: Bell },
  { value: "referral", label: "Referral", icon: Sliders },
];

const isTabKey = (v: string): v is TabKey =>
  TABS.some((t) => t.value === v);

const SettingsPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const initial = useMemo<TabKey>(() => {
    const hash = location.hash.replace("#", "");
    return isTabKey(hash) ? hash : "profile";
  }, [location.hash]);

  const [tab, setTab] = useState<TabKey>(initial);

  useEffect(() => {
    if (tab !== initial) setTab(initial);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initial]);

  const onTabChange = (next: TabKey) => {
    setTab(next);
    navigate(`${location.pathname}#${next}`, { replace: true });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h2 className="text-[24px] font-bold text-ink tracking-tight">
            Settings
          </h2>
          <p className="text-sm text-muted mt-1">
            Manage your account, security, and how the portal behaves.
          </p>
        </div>
      </div>

      <Tabs tabs={TABS} value={tab} onChange={onTabChange} />

      <div>
        {tab === "profile" && <ProfileTab />}
        {tab === "security" && <SecurityTab />}
        {tab === "notifications" && <NotificationsTab />}
        {tab === "referral" && <ReferralConfigTab />}
      </div>
    </div>
  );
};

export default SettingsPage;
