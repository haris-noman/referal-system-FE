import { useMemo, useState } from "react";
import { HelpCircle, ChevronDown, Search, X } from "lucide-react";
import { cn } from "../../lib/utils";
import SupportPageHeader from "../../components/support/SupportPageHeader";

type Category = "All" | "Account" | "Referrals" | "Payouts" | "Security";

const CATEGORIES: Category[] = [
  "All",
  "Account",
  "Referrals",
  "Payouts",
  "Security",
];

const FAQS: { category: Exclude<Category, "All">; q: string; a: string }[] = [
  {
    category: "Account",
    q: "How do I update my profile or contact information?",
    a: "Open Settings from the sidebar, choose Profile, and edit any field. Changes save automatically and are reflected across the portal within a few seconds.",
  },
  {
    category: "Account",
    q: "Can I invite team members to collaborate on referrals?",
    a: "Admin users can invite team members from Settings → Team. Each invite generates a secure link that expires after 72 hours.",
  },
  {
    category: "Referrals",
    q: "What information do I need to submit a referral?",
    a: "At minimum: the lead's full name, email or phone number, referral type, and an estimated value. Attaching a supporting document speeds up institutional review.",
  },
  {
    category: "Referrals",
    q: "How long does it take for a referral to be approved?",
    a: "Most referrals receive a status update within 4 business days. Complex cases (mortgage, multi-party real estate) may take up to 10 days.",
  },
  {
    category: "Payouts",
    q: "When are commissions paid out?",
    a: "Commissions are released on the 1st and 15th of every month for any referral marked Approved at least 5 business days prior.",
  },
  {
    category: "Payouts",
    q: "Why is my commission lower than expected?",
    a: "Commission is calculated from the institution's final transaction value, which may differ from your submitted estimate. The breakdown is visible on each referral detail page.",
  },
  {
    category: "Security",
    q: "How is my data protected?",
    a: "All data is encrypted at rest and in transit. We are SOC 2 Type II compliant and undergo quarterly third-party penetration tests.",
  },
  {
    category: "Security",
    q: "I think my account was compromised — what should I do?",
    a: "Call the emergency line (+1 800 555-0911) immediately and reset your password from the login screen. We will freeze the account during investigation.",
  },
];

const FaqItem = ({
  q,
  a,
  open,
  onToggle,
}: {
  q: string;
  a: string;
  open: boolean;
  onToggle: () => void;
}) => (
  <div className="border-b border-line last:border-b-0">
    <button
      type="button"
      onClick={onToggle}
      aria-expanded={open}
      className="w-full flex items-center justify-between gap-4 py-4 px-5 text-left hover:bg-line-soft/60 transition-colors"
    >
      <span className="text-[14px] font-semibold text-ink">{q}</span>
      <ChevronDown
        className={cn(
          "w-4 h-4 text-muted-2 shrink-0 transition-transform duration-300",
          open && "rotate-180",
        )}
        strokeWidth={2}
      />
    </button>
    <div
      className={cn(
        "grid transition-[grid-template-rows,opacity] duration-300 ease-in-out",
        open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
      )}
    >
      <div className="overflow-hidden">
        <p className="px-5 pb-5 text-[13px] text-muted leading-relaxed">{a}</p>
      </div>
    </div>
  </div>
);

const FaqPage = () => {
  const [category, setCategory] = useState<Category>("All");
  const [query, setQuery] = useState("");
  const [openKey, setOpenKey] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return FAQS.filter((item) => {
      if (category !== "All" && item.category !== category) return false;
      if (!q) return true;
      return (
        item.q.toLowerCase().includes(q) || item.a.toLowerCase().includes(q)
      );
    });
  }, [category, query]);

  return (
    <div className="space-y-6">
      <SupportPageHeader
        icon={HelpCircle}
        title="Frequently Asked Questions"
        description="Browse answers to the most common questions. Filter by category or search to narrow results."
      />

      <div className="bg-white border border-line rounded-card p-5">
        <div className="flex flex-col md:flex-row md:items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-2" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search questions and answers…"
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

          <div className="flex flex-wrap gap-1.5">
            {CATEGORIES.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCategory(c)}
                className={cn(
                  "px-3 py-1.5 rounded-full text-[12px] font-medium transition-colors",
                  category === c
                    ? "bg-ink text-white"
                    : "bg-line-soft text-muted hover:text-ink",
                )}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white border border-line rounded-card overflow-hidden">
        {filtered.length === 0 ? (
          <div className="py-16 text-center">
            <HelpCircle
              className="w-8 h-8 mx-auto text-muted-2"
              strokeWidth={1.5}
            />
            <p className="mt-3 text-sm font-medium text-ink">
              No matching questions
            </p>
            <p className="mt-1 text-[12.5px] text-muted">
              Try a different keyword or category.
            </p>
          </div>
        ) : (
          filtered.map((item) => {
            const key = `${item.category}-${item.q}`;
            return (
              <FaqItem
                key={key}
                q={item.q}
                a={item.a}
                open={openKey === key}
                onToggle={() => setOpenKey(openKey === key ? null : key)}
              />
            );
          })
        )}
      </div>
    </div>
  );
};

export default FaqPage;
