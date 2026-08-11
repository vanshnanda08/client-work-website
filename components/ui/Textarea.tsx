import React from "react";
import { cn } from "@/lib/utils";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  helperText?: string;
  error?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, helperText, error, id, rows = 4, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label htmlFor={inputId} className="block text-xs font-medium text-neutral-700">
            {label}
          </label>
        )}
        <textarea
          id={inputId}
          ref={ref}
          rows={rows}
          className={cn(
            "w-full px-3.5 py-2.5 bg-white text-neutral-900 text-sm rounded-xl border border-neutral-200 placeholder:text-neutral-400 transition-colors duration-150 resize-y",
            "focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-900",
            "disabled:bg-neutral-50 disabled:text-neutral-400 disabled:cursor-not-allowed",
            error && "border-rose-400 focus:border-rose-500 focus:ring-rose-500/10",
            className
          )}
          {...props}
        />
        {error ? (
          <p className="text-xs text-rose-600 font-medium">{error}</p>
        ) : helperText ? (
          <p className="text-xs text-neutral-500">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";
