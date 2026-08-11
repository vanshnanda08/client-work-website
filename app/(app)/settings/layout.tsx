"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  User,
  Users,
  BookOpen,
  CreditCard,
  Building2,
  Bell,
  Palette,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // One tab per settings page — every page under /settings must be reachable here.
  const settingsNav = [
    { name: "My Profile", href: "/settings/profile", icon: User },
    { name: "Organization", href: "/settings/organization", icon: Building2 },
    { name: "Team & Invites", href: "/settings/team", icon: Users },
    { name: "Brand Voice", href: "/settings/brand-voice", icon: BookOpen },
    { name: "Notifications", href: "/settings/notifications", icon: Bell },
    { name: "Plan & Credits", href: "/settings/plan", icon: CreditCard },
    { name: "Appearance", href: "/settings/appearance", icon: Palette },
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-neutral-900 tracking-tight">
          Settings
        </h1>
        <p className="text-xs text-neutral-500 mt-0.5">
          Manage your profile, team members, brand voice guidelines, and word credit plan.
        </p>
      </div>

      {/* Clean Horizontal Subnavigation Tabs */}
      <div className="flex flex-wrap items-center gap-1.5 p-1 bg-neutral-100/90 rounded-xl w-fit max-w-full border border-neutral-200/50">
        {settingsNav.map((item) => {
          const active = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition",
                active
                  ? "bg-white text-neutral-900 shadow-xs"
                  : "text-neutral-600 hover:text-neutral-900"
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </div>

      {/* Main Settings Subpage Content */}
      <div className="w-full">{children}</div>
    </div>
  );
}
