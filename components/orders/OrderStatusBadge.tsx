import React from "react";
import { OrderStatus } from "@/lib/types";
import { STATUS_CONFIG } from "@/lib/config";
import { cn } from "@/lib/utils";

interface OrderStatusBadgeProps {
  status: OrderStatus;
  size?: "sm" | "md";
  className?: string;
}

export const OrderStatusBadge: React.FC<OrderStatusBadgeProps> = ({
  status,
  size = "md",
  className,
}) => {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.draft;

  return (
    <span
      className={cn(
        "inline-flex items-center font-semibold rounded-lg border transition-colors",
        config.badgeClass,
        size === "sm" ? "px-2 py-0.5 text-[11px] gap-1.5" : "px-2.5 py-1 text-xs gap-2",
        className
      )}
      title={config.description}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full shrink-0", config.dotColor)} />
      <span className="whitespace-nowrap">{config.label}</span>
    </span>
  );
};
