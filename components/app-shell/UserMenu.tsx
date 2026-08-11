"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { User, Settings, CreditCard, LogOut, ChevronDown } from "lucide-react";
import { useStore } from "@/lib/context/StoreContext";

export const UserMenu: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const { currentUser: user, signOut } = useStore();

  const handleSignOut = () => {
    if (!confirm("Sign out? This clears the workspace data saved in this browser.")) return;
    setIsOpen(false);
    signOut();
    router.push("/");
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2.5 pl-1.5 pr-2.5 py-1.5 rounded-xl hover:bg-neutral-100/80 border border-neutral-200/80 bg-white transition shadow-2xs"
      >
        <img
          src={user.avatar_url}
          alt={user.full_name}
          className="h-7 w-7 rounded-lg object-cover ring-1 ring-neutral-200"
        />
        <span className="hidden sm:block text-xs font-semibold text-neutral-800">
          {user.full_name.split(" ")[0]}
        </span>
        <ChevronDown className="h-3.5 w-3.5 text-neutral-400" />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl border border-neutral-200 shadow-2xl p-2 z-40 animate-in zoom-in-95 duration-100">
            {/* User Profile Header */}
            <div className="p-3 border-b border-neutral-100 flex items-center gap-3">
              <img
                src={user.avatar_url}
                alt={user.full_name}
                className="h-10 w-10 rounded-xl object-cover"
              />
              <div className="min-w-0 flex-1">
                <div className="text-xs font-bold text-neutral-900 truncate">
                  {user.full_name}
                </div>
                <div className="text-[11px] text-neutral-500 truncate">{user.email}</div>
                <div className="text-[10px] text-orange-600 font-medium mt-0.5">
                  {user.role_title}
                </div>
              </div>
            </div>

            {/* Menu Links */}
            <div className="py-1">
              <Link
                href="/settings/profile"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-neutral-700 hover:bg-neutral-100 rounded-lg transition"
              >
                <User className="h-4 w-4 text-neutral-400" />
                Profile Settings
              </Link>
              <Link
                href="/settings/plan"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-neutral-700 hover:bg-neutral-100 rounded-lg transition"
              >
                <CreditCard className="h-4 w-4 text-neutral-400" />
                Plan & Word Credits
              </Link>
              <Link
                href="/settings/organization"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-neutral-700 hover:bg-neutral-100 rounded-lg transition"
              >
                <Settings className="h-4 w-4 text-neutral-400" />
                Organization & Team
              </Link>
            </div>

            {/* Sign Out Mock */}
            <div className="pt-1 border-t border-neutral-100">
              <button
                onClick={handleSignOut}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 rounded-lg transition text-left cursor-pointer"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
