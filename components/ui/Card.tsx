import React from "react";
import { cn } from "@/lib/utils";

export const Skeleton: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  ...props
}) => {
  return (
    <div
      className={cn(
        "animate-pulse rounded-lg bg-neutral-200/70",
        className
      )}
      {...props}
    />
  );
};

export const Card: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  children,
  ...props
}) => {
  return (
    <div
      className={cn(
        "bg-white rounded-2xl border border-neutral-200/80 shadow-xs p-6",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
