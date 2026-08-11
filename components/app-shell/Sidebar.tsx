"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  PlusCircle,
  Bell,
  Settings,
  Menu,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useStore } from "@/lib/context/StoreContext";

interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
  badge?: number;
}

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const { notifications } = useStore();

  const unreadCount = notifications.filter((n) => !n.read_at).length;

  // Simplified core navigation
  const navItems: NavItem[] = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Orders", href: "/orders", icon: FileText },
    { name: "New Order", href: "/orders/new", icon: PlusCircle },
    { name: "Notifications", href: "/notifications", icon: Bell, badge: unreadCount },
    { name: "Settings", href: "/settings/profile", icon: Settings },
  ];

  const isActiveRoute = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    if (href === "/orders")
      return (
        pathname === "/orders" ||
        (pathname.startsWith("/orders/") && pathname !== "/orders/new")
      );
    if (href === "/orders/new") return pathname === "/orders/new";
    if (href === "/notifications") return pathname === "/notifications";
    if (href.startsWith("/settings/")) return pathname.startsWith("/settings");
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Mobile Header Bar */}
      <div className="palette-base lg:hidden fixed top-0 left-0 right-0 h-14 bg-[#0B0D14] border-b border-neutral-800 z-40 flex items-center justify-between px-4">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <div className="h-7 w-7 rounded-lg bg-neutral-800 flex items-center justify-center p-1 border border-neutral-700">
            <div className="grid grid-cols-2 gap-0.5 w-full h-full">
              <div className="bg-white rounded-xs" />
              <div className="bg-orange-500 rounded-xs" />
              <div className="bg-orange-500 rounded-xs" />
              <div className="bg-white rounded-xs" />
            </div>
          </div>
          <span className="text-white font-bold text-sm tracking-tight">Inkwell</span>
        </Link>
        <button
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="p-1.5 rounded-lg text-neutral-400 hover:text-white transition"
          aria-label="Toggle Navigation"
        >
          {isMobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Desktop Dark Mini-Sidebar (Matching Screenshot) */}
      <aside className="palette-base hidden lg:flex fixed top-0 left-0 bottom-0 w-[64px] bg-[#0B0D14] flex-col items-center py-4 z-40 border-r border-neutral-900 select-none">
        {/* Brand Geometric Logo */}
        <Link
          href="/dashboard"
          className="group flex items-center justify-center h-10 w-10 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 transition"
          title="Inkwell Dashboard"
        >
          <div className="grid grid-cols-2 gap-0.5 w-4 h-4">
            <div className="bg-white rounded-xs" />
            <div className="bg-orange-500 rounded-xs" />
            <div className="bg-orange-500 rounded-xs" />
            <div className="bg-white rounded-xs" />
          </div>
        </Link>

        {/* Navigation Items */}
        <nav className="flex-1 flex flex-col items-center gap-2.5 mt-6 w-full px-2">
          {navItems.map((item) => {
            const active = isActiveRoute(item.href);
            const Icon = item.icon;

            return (
              <div key={item.name} className="relative group w-full flex justify-center">
                <Link
                  href={item.href}
                  className={cn(
                    "relative flex items-center justify-center h-10 w-10 rounded-xl transition-colors",
                    active
                      ? "bg-neutral-800 text-white shadow-xs"
                      : "text-neutral-400 hover:text-white hover:bg-neutral-900"
                  )}
                >
                  <Icon className="h-4.5 w-4.5" />

                  {/* Active Indicator Bar */}
                  {active && (
                    <span className="absolute -left-2 top-2 bottom-2 w-1 bg-white rounded-r-full" />
                  )}

                  {/* Notification Dot */}
                  {!!item.badge && item.badge > 0 && (
                    <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-orange-500 ring-2 ring-[#0B0D14]" />
                  )}
                </Link>

                {/* Tooltip */}
                <div className="absolute left-full ml-3 px-2 py-1 bg-neutral-900 text-white text-[11px] font-medium rounded-md whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 shadow-lg border border-neutral-800">
                  {item.name}
                </div>
              </div>
            );
          })}
        </nav>
      </aside>

      {/* Mobile Drawer */}
      {isMobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex">
          <div className="palette-base w-64 bg-[#0B0D14] h-full p-5 flex flex-col border-r border-neutral-800 animate-in slide-in-from-left duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
              <div className="flex items-center gap-2">
                <div className="grid grid-cols-2 gap-0.5 w-5 h-5">
                  <div className="bg-white rounded-xs" />
                  <div className="bg-orange-500 rounded-xs" />
                  <div className="bg-orange-500 rounded-xs" />
                  <div className="bg-white rounded-xs" />
                </div>
                <span className="text-white font-bold text-base">Inkwell</span>
              </div>
              <button
                onClick={() => setIsMobileOpen(false)}
                className="p-1 rounded-lg text-neutral-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <nav className="flex-1 flex flex-col gap-1.5 mt-5">
              {navItems.map((item) => {
                const active = isActiveRoute(item.href);
                const Icon = item.icon;

                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setIsMobileOpen(false)}
                    className={cn(
                      "flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition",
                      active
                        ? "bg-neutral-800 text-white"
                        : "text-neutral-400 hover:text-white hover:bg-neutral-900"
                    )}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className="h-4 w-4" />
                      <span>{item.name}</span>
                    </div>
                    {!!item.badge && item.badge > 0 && (
                      <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-orange-500 text-white font-bold">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>
          <div className="flex-1" onClick={() => setIsMobileOpen(false)} />
        </div>
      )}
    </>
  );
};
