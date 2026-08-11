import React from "react";
import Link from "next/link";
import { Clock, CheckCircle2, AlertCircle, Zap, ArrowUpRight } from "lucide-react";
import { Order, Organization } from "@/lib/types";
import { formatNumber } from "@/lib/utils";

interface StatusSummaryCardsProps {
  orders: Order[];
  organization: Organization;
}

export const StatusSummaryCards: React.FC<StatusSummaryCardsProps> = ({
  orders,
  organization,
}) => {
  const inFlightCount = orders.filter(
    (o) => ["submitted", "in_queue", "writing", "in_review"].includes(o.status)
  ).length;

  const deliveredCount = orders.filter((o) => o.status === "delivered").length;
  const revisionsCount = orders.filter((o) => o.status === "revision_requested").length;
  const approvedCount = orders.filter((o) => o.status === "approved").length;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Ready for Review (Highlight / Actionable) */}
      <Link
        href="/orders?status=delivered"
        className="group relative bg-white p-5 rounded-2xl border border-emerald-200/80 shadow-2xs hover:shadow-md hover:border-emerald-300 transition-all"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
            Ready for Review
          </span>
          <div className="h-8 w-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-105 transition">
            <CheckCircle2 className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-3xl font-extrabold text-neutral-900 tracking-tight">
            {deliveredCount}
          </span>
          {deliveredCount > 0 && (
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full ring-1 ring-emerald-200">
              Needs your action
            </span>
          )}
        </div>
        <div className="mt-2 text-xs text-neutral-500 flex items-center gap-1 group-hover:text-emerald-700 transition">
          <span>Review deliverables</span>
          <ArrowUpRight className="h-3 w-3" />
        </div>
      </Link>

      {/* 2. In Pipeline / In Flight */}
      <Link
        href="/orders?status=in_flight"
        className="group bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-2xs hover:shadow-md hover:border-neutral-300 transition-all"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
            Orders in Flight
          </span>
          <div className="h-8 w-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-105 transition">
            <Clock className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-3xl font-extrabold text-neutral-900 tracking-tight">
            {inFlightCount}
          </span>
          <span className="text-xs text-neutral-400 font-medium">in production</span>
        </div>
        <div className="mt-2 text-xs text-neutral-500 flex items-center gap-1 group-hover:text-neutral-800 transition">
          <span>Writing & QA stages</span>
          <ArrowUpRight className="h-3 w-3" />
        </div>
      </Link>

      {/* 3. Revisions Active */}
      <Link
        href="/orders?status=revision_requested"
        className="group bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-2xs hover:shadow-md hover:border-neutral-300 transition-all"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
            Revisions Active
          </span>
          <div className="h-8 w-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center group-hover:scale-105 transition">
            <AlertCircle className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-3xl font-extrabold text-neutral-900 tracking-tight">
            {revisionsCount}
          </span>
          <span className="text-xs text-neutral-400 font-medium">with writers</span>
        </div>
        <div className="mt-2 text-xs text-neutral-500 flex items-center gap-1 group-hover:text-neutral-800 transition">
          <span>Edits being applied</span>
          <ArrowUpRight className="h-3 w-3" />
        </div>
      </Link>

      {/* 4. Word Credits Remaining */}
      <Link
        href="/settings/plan"
        className="group bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-2xs hover:shadow-md hover:border-neutral-300 transition-all"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
            Credits Remaining
          </span>
          <div className="h-8 w-8 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center group-hover:scale-105 transition">
            <Zap className="h-4 w-4 fill-orange-500" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-3xl font-extrabold text-neutral-900 tracking-tight">
            {formatNumber(organization.word_credits_remaining)}
          </span>
          <span className="text-xs text-neutral-400 font-medium">words</span>
        </div>
        <div className="mt-2 text-xs text-neutral-500 flex items-center gap-1 group-hover:text-neutral-800 transition">
          <span>{organization.plan} • Renews Sep 1</span>
          <ArrowUpRight className="h-3 w-3" />
        </div>
      </Link>
    </div>
  );
};
