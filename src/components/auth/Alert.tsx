import type { ReactNode } from "react";
import { AlertCircle, CheckCircle2, Info } from "lucide-react";
import { cn } from "../../lib/utils";

type Variant = "error" | "success" | "info";

const styles: Record<Variant, { box: string; icon: ReactNode }> = {
  error: {
    box: "bg-red-50 border-red-100 text-red-700",
    icon: <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" strokeWidth={2} />,
  },
  success: {
    box: "bg-emerald-50 border-emerald-100 text-emerald-700",
    icon: <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" strokeWidth={2} />,
  },
  info: {
    box: "bg-blue-50 border-blue-100 text-blue-700",
    icon: <Info className="w-4 h-4 mt-0.5 shrink-0" strokeWidth={2} />,
  },
};

const Alert = ({
  variant = "info",
  children,
  className,
}: {
  variant?: Variant;
  children: ReactNode;
  className?: string;
}) => {
  const s = styles[variant];
  return (
    <div
      role={variant === "error" ? "alert" : "status"}
      className={cn(
        "flex items-start gap-2 text-[13px] border rounded-md px-3 py-2.5 leading-snug",
        s.box,
        className,
      )}
    >
      {s.icon}
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
};

export default Alert;
