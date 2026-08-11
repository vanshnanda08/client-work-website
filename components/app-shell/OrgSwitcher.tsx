"use client";

import React, { useState } from "react";
import { ChevronDown, Check, Zap } from "lucide-react";
import { useStore } from "@/lib/context/StoreContext";
import { formatDate, formatNumber } from "@/lib/utils";

export const OrgSwitcher: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { organization, memberships, currentUser } = useStore();

  const initial = organization.name.trim().charAt(0).toUpperCase() || "?";
  const myRole =
    memberships.find((m) => m.user_id === currentUser.id)?.role ?? "member";
  const creditsPct = organization.word_credits_total
    ? Math.max(
        0,
        Math.min(100, (organization.word_credits_remaining / organization.word_credits_total) * 100)
      )
    : 0;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl hover:bg-neutral-100/80 border border-neutral-200/80 bg-white transition text-left shadow-2xs cursor-pointer"
      >
        <div className="h-6 w-6 rounded-lg bg-neutral-900 text-white flex items-center justify-center font-bold text-xs">
          {initial}
        </div>
        <div className="hidden sm:flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-neutral-900 truncate max-w-[130px]">
              {organization.name}
            </span>
            <span className="text-[10px] px-1.5 py-0.2 bg-neutral-100 text-neutral-600 rounded font-medium border border-neutral-200 capitalize">
              {myRole}
            </span>
          </div>
        </div>
        <ChevronDown className="h-3.5 w-3.5 text-neutral-400" />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-30"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute left-0 mt-2 w-72 bg-white rounded-2xl border border-neutral-200 shadow-xl p-3 z-40 animate-in zoom-in-95 duration-100">
            <div className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider px-2 py-1">
              Active Organization
            </div>

            <div className="flex items-center justify-between p-2 rounded-xl bg-neutral-50 border border-neutral-200/60 my-1">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-lg bg-neutral-900 text-white flex items-center justify-center font-bold text-xs">
                  {initial}
                </div>
                <div>
                  <div className="text-xs font-bold text-neutral-900">{organization.name}</div>
                  <div className="text-[11px] text-neutral-500">{organization.plan}</div>
                </div>
              </div>
              <Check className="h-4 w-4 text-emerald-600" />
            </div>

            {/* Live Word Credits Usage Quick Bar */}
            <div className="mt-3 p-2.5 rounded-xl bg-orange-50/50 border border-orange-100">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="flex items-center gap-1 font-semibold text-orange-950">
                  <Zap className="h-3.5 w-3.5 text-orange-500 fill-orange-500" />
                  Word Credits
                </span>
                <span className="font-bold text-orange-900 text-[11px]">
                  {formatNumber(organization.word_credits_remaining)} / {formatNumber(organization.word_credits_total)}
                </span>
              </div>
              <div className="w-full bg-orange-200/60 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-orange-500 h-full rounded-full transition-all duration-300"
                  style={{ width: `${creditsPct}%` }}
                />
              </div>
              <div className="text-[10px] text-orange-700/80 mt-1.5">
                Renews on {formatDate(organization.renewal_date)}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
