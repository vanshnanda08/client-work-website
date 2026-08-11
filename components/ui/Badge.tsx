import React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "secondary" | "success" | "warning" | "danger" | "info" | "outline";
  size?: "sm" | "md";
  dot?: boolean;
  dotColor?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  className,
  variant = "default",
  size = "md",
  dot = false,
  dotColor,
  children,
  ...props
}) => {
  const variantStyles = {
    default: "bg-neutral-100 text-neutral-800 border-neutral-200",
    secondary: "bg-neutral-50 text-neutral-600 border-neutral-200/60",
    success: "bg-emerald-50 text-emerald-700 border-emerald-200/80",
    warning: "bg-amber-50 text-amber-700 border-amber-200/80",
    danger: "bg-rose-50 text-rose-700 border-rose-200/80",
    info: "bg-blue-50 text-blue-700 border-blue-200/80",
    outline: "bg-transparent text-neutral-700 border-neutral-300",
  };

  const sizeStyles = {
    sm: "px-2 py-0.5 text-[11px] font-medium gap-1 rounded-md",
    md: "px-2.5 py-1 text-xs font-medium gap-1.5 rounded-lg",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center border font-medium transition-colors",
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      {...props}
    >
      {dot && (
        <span
          className={cn("h-1.5 w-1.5 rounded-full", dotColor || "bg-current")}
        />
      )}
      {children}
    </span>
  );
};
