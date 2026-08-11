"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Plus } from "lucide-react";
import { NotificationsBell } from "./NotificationsBell";
import { OrgSwitcher } from "./OrgSwitcher";
import { UserMenu } from "./UserMenu";
import { Button } from "@/components/ui/Button";

export const TopNav: React.FC = () => {
  const pathname = usePathname();

  // Dynamic Breadcrumb computation
  const getBreadcrumbs = () => {
    if (pathname === "/dashboard") {
      return [{ label: "Dashboard", href: "/dashboard" }];
    }
    if (pathname === "/orders") {
      return [{ label: "Orders", href: "/orders" }, { label: "All Orders" }];
    }
    if (pathname === "/orders/new") {
      return [{ label: "Orders", href: "/orders" }, { label: "New Order" }];
    }
    if (pathname.startsWith("/orders/") && pathname.endsWith("/edit")) {
      const orderId = pathname.split("/")[2];
      return [
        { label: "Orders", href: "/orders" },
        { label: orderId.toUpperCase(), href: `/orders/${orderId}` },
        { label: "Edit Draft" },
      ];
    }
    if (pathname.startsWith("/orders/")) {
      const orderId = pathname.split("/")[2];
      return [
        { label: "Orders", href: "/orders" },
        { label: orderId.toUpperCase() },
      ];
    }
    if (pathname === "/notifications") {
      return [{ label: "Notifications", href: "/notifications" }];
    }
    if (pathname.startsWith("/settings/")) {
      const sub = pathname.replace("/settings/", "");
      const formattedSub = sub
        .split("-")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ");
      return [
        { label: "Settings", href: "/settings/profile" },
        { label: formattedSub },
      ];
    }
    return [{ label: "Dashboard", href: "/dashboard" }];
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <header className="sticky top-0 z-30 bg-[var(--background)]/90 backdrop-blur-md border-b border-neutral-200/60 px-4 sm:px-8 py-3 flex items-center justify-between gap-4">
      {/* Left: Organization switcher + breadcrumbs */}
      <div className="flex items-center gap-3 min-w-0">
        <div className="hidden sm:block shrink-0">
          <OrgSwitcher />
        </div>

        <div className="flex items-center gap-1.5 text-xs text-neutral-500 font-medium truncate">
          {breadcrumbs.map((crumb, idx) => {
            const isLast = idx === breadcrumbs.length - 1;
            return (
              <React.Fragment key={idx}>
                {idx > 0 && <span className="text-neutral-400">/</span>}
                {crumb.href && !isLast ? (
                  <Link
                    href={crumb.href}
                    className="hover:text-neutral-900 transition font-medium"
                  >
                    {crumb.label}
                  </Link>
                ) : (
                  <span
                    className={
                      isLast
                        ? "text-neutral-900 font-semibold truncate"
                        : "text-neutral-500"
                    }
                  >
                    {crumb.label}
                  </span>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Right: Only New Order button, Notifications bell, and Profile menu */}
      <div className="flex items-center gap-3 shrink-0">
        {/* 1. New Order Button */}
        {pathname !== "/orders/new" && (
          <Link href="/orders/new">
            <Button size="sm" variant="primary" leftIcon={<Plus className="h-3.5 w-3.5" />}>
              <span className="hidden sm:inline">New Order</span>
              <span className="sm:hidden">Order</span>
            </Button>
          </Link>
        )}

        {/* 2. Notification Bell */}
        <NotificationsBell />

        {/* 3. Profile User Avatar Menu */}
        <UserMenu />
      </div>
    </header>
  );
};
