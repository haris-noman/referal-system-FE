import { forwardRef, useState } from "react";
import type { InputHTMLAttributes } from "react";
import { Lock } from "lucide-react";
import FormField from "./FormField";

type PasswordFieldProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "type"
> & {
  label?: string;
  error?: string;
  hint?: string;
};

const PasswordField = forwardRef<HTMLInputElement, PasswordFieldProps>(
  ({ label = "Password", error, hint, ...rest }, ref) => {
    const [show, setShow] = useState(false);

    return (
      <FormField
        ref={ref}
        type={show ? "text" : "password"}
        label={label}
        icon={<Lock className="w-4 h-4" />}
        error={error}
        hint={hint}
        trailing={
          <button
            type="button"
            onClick={() => setShow((v) => !v)}
            className="text-[10px] font-semibold uppercase tracking-wider text-muted hover:text-ink"
            tabIndex={-1}
            aria-label={show ? "Hide password" : "Show password"}
          >
            {show ? "Hide" : "Show"}
          </button>
        }
        {...rest}
      />
    );
  },
);

PasswordField.displayName = "PasswordField";

export default PasswordField;
