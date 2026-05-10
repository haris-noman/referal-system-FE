import { cn } from "../../lib/utils";

type Score = 0 | 1 | 2 | 3 | 4;

export const evaluatePassword = (
  pw: string,
): { score: Score; label: string; checks: { id: string; label: string; ok: boolean }[] } => {
  const checks = [
    { id: "len", label: "At least 8 characters", ok: pw.length >= 8 },
    { id: "case", label: "Upper & lowercase letter", ok: /[a-z]/.test(pw) && /[A-Z]/.test(pw) },
    { id: "num", label: "At least one number", ok: /\d/.test(pw) },
    { id: "sym", label: "At least one symbol", ok: /[^A-Za-z0-9]/.test(pw) },
  ];
  const passed = checks.filter((c) => c.ok).length as Score;
  const label =
    pw.length === 0
      ? ""
      : passed <= 1
        ? "Weak"
        : passed === 2
          ? "Fair"
          : passed === 3
            ? "Good"
            : "Strong";
  return { score: passed, label, checks };
};

const barColor: Record<Score, string> = {
  0: "bg-line",
  1: "bg-red-400",
  2: "bg-amber-400",
  3: "bg-emerald-400",
  4: "bg-emerald-600",
};

const PasswordStrength = ({ password }: { password: string }) => {
  const { score, label, checks } = evaluatePassword(password);
  if (!password) return null;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <div className="flex-1 grid grid-cols-4 gap-1">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className={cn(
                "h-1.5 rounded-full transition-colors",
                i <= score ? barColor[score] : "bg-line",
              )}
            />
          ))}
        </div>
        {label && (
          <span className="text-[11px] font-semibold text-muted min-w-[44px] text-right">
            {label}
          </span>
        )}
      </div>
      <ul className="grid grid-cols-2 gap-x-3 gap-y-1">
        {checks.map((c) => (
          <li
            key={c.id}
            className={cn(
              "text-[11px] flex items-center gap-1.5 transition-colors",
              c.ok ? "text-emerald-600" : "text-muted-2",
            )}
          >
            <span
              className={cn(
                "w-1.5 h-1.5 rounded-full",
                c.ok ? "bg-emerald-500" : "bg-line",
              )}
            />
            {c.label}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PasswordStrength;
