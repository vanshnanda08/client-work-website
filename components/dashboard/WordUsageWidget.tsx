import React from "react";
import Link from "next/link";
import { Zap, ArrowUpRight, ShieldCheck, Sparkles, BookOpen } from "lucide-react";
import { Organization } from "@/lib/types";
import { formatNumber } from "@/lib/utils";

interface WordUsageWidgetProps {
  organization: Organization;
}

export const WordUsageWidget: React.FC<WordUsageWidgetProps> = ({ organization }) => {
  const usedWords = organization.word_credits_total - organization.word_credits_remaining;
  const percentageUsed = Math.round((usedWords / organization.word_credits_total) * 100);

  return (
    <div className="space-y-4">
      {/* Word Credit Meter Card */}
      <div className="bg-white rounded-2xl border border-neutral-200/80 p-5 shadow-2xs">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center">
              <Zap className="h-4 w-4 fill-orange-500" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-neutral-900">Word Credit Usage</h3>
              <p className="text-[11px] text-neutral-500">{organization.plan}</p>
            </div>
          </div>
          <Link
            href="/settings/plan"
            className="text-[11px] font-semibold text-neutral-600 hover:text-neutral-900 flex items-center gap-0.5"
          >
            Manage <ArrowUpRight className="h-3 w-3" />
          </Link>
        </div>

        {/* Progress bar */}
        <div className="mt-4">
          <div className="flex items-baseline justify-between text-xs mb-1.5 font-medium">
            <span className="text-neutral-500">
              <strong className="text-neutral-900 font-bold">{formatNumber(organization.word_credits_remaining)}</strong> words remaining
            </span>
            <span className="text-neutral-400 text-[11px]">{percentageUsed}% used</span>
          </div>

          <div className="w-full bg-neutral-100 h-2.5 rounded-full overflow-hidden p-0.5">
            <div
              className="bg-neutral-900 h-full rounded-full transition-all duration-500"
              style={{ width: `${percentageUsed}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-neutral-400 mt-2">
            <span>Cycle reset: Sep 1, 2026</span>
            <span>Total: {formatNumber(organization.word_credits_total)}</span>
          </div>
        </div>
      </div>

      {/* Brand Voice & Quality Guarantee Card */}
      <div className="bg-neutral-900 text-white rounded-2xl p-5 shadow-2xs">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="h-4 w-4 text-orange-400" />
          <span className="text-xs font-bold uppercase tracking-wider text-neutral-300">
            Agency Guarantee
          </span>
        </div>
        <h4 className="text-sm font-bold text-white mb-1">
          Every piece custom-crafted to your Style Guide
        </h4>
        <p className="text-xs text-neutral-400 leading-relaxed mb-4">
          Includes dedicated human editor QA, native plagiarism scan, and unlimited minor revisions.
        </p>
        <Link
          href="/settings/brand-voice"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-orange-400 hover:text-orange-300 transition"
        >
          <BookOpen className="h-3.5 w-3.5" />
          Edit Brand Voice Guidelines →
        </Link>
      </div>
    </div>
  );
};
