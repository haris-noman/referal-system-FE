import { forwardRef } from "react";
import type { InputHTMLAttributes, ReactNode } from "react";
import { cn } from "../../lib/utils";

type FormFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  icon?: ReactNode;
  error?: string;
  hint?: string;
  trailing?: ReactNode;
  containerClassName?: string;
};

const FormField = forwardRef<HTMLInputElement, FormFieldProps>(
  (
    {
      label,
      icon,
      error,
      hint,
      trailing,
      containerClassName,
      className,
      id,
      ...rest
    },
    ref,
  ) => {
    const inputId = id || rest.name;
    const hasError = Boolean(error);

    return (
      <div className={cn("space-y-2", containerClassName)}>
        {label && (
          <label htmlFor={inputId} className="eyebrow block">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <span className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-2 pointer-events-none">
              {icon}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            aria-invalid={hasError || undefined}
            aria-describedby={
              hasError ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined
            }
            className={cn(
              "field",
              icon && "pl-9",
              trailing && "pr-10",
              hasError && "border-red-400 focus:border-red-500",
              className,
            )}
            {...rest}
          />
          {trailing && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center">
              {trailing}
            </span>
          )}
        </div>
        {hasError ? (
          <p
            id={`${inputId}-error`}
            className="text-[12px] text-red-600 leading-snug"
          >
            {error}
          </p>
        ) : hint ? (
          <p
            id={`${inputId}-hint`}
            className="text-[12px] text-muted-2 leading-snug"
          >
            {hint}
          </p>
        ) : null}
      </div>
    );
  },
);

FormField.displayName = "FormField";

export default FormField;
