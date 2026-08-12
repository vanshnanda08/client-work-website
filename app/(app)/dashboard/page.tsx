"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { CheckCircle2, Clock, Zap, ArrowRight, FileText, Sparkles } from "lucide-react";
import { OrderStatusBadge } from "@/components/orders/OrderStatusBadge";
import { RecentActivityFeed } from "@/components/dashboard/RecentActivityFeed";
import { useStore } from "@/lib/context/StoreContext";
import { formatNumber, formatRelativeTime } from "@/lib/utils";
import { CONTENT_TYPES } from "@/lib/config";
import { Button } from "@/components/ui/Button";

/**
 * The demo seeder fills a workspace with eight fabricated orders. That is a
 * development affordance — a real client must never be offered it on their own
 * empty dashboard. NODE_ENV is inlined at build time, so the button and its
 * handler are dropped from the production bundle entirely.
 */
const SHOW_DEMO_SEED = process.env.NODE_ENV === "development";

export default function DashboardPage() {
  const { orders, organization, activities, seedDemoData } = useStore();

  const [isSeeding, setIsSeeding] = useState(false);
  const [seedError, setSeedError] = useState("");

  // Metric counts
  const inFlightCount = useMemo(
    () =>
      orders.filter((o) =>
        ["submitted", "in_queue", "writing", "in_review", "revision_requested"].includes(o.status)
      ).length,
    [orders]
  );

  const deliveredCount = useMemo(
    () => orders.filter((o) => o.status === "delivered").length,
    [orders]
  );

  // Active / recent orders sorted newest first
  const activeOrders = useMemo(() => {
    return [...orders]
      .filter((o) => o.status !== "draft")
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }, [orders]);

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Clean Dashboard Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-neutral-900 tracking-tight">
          Dashboard
        </h1>
        <p className="text-xs text-neutral-500 mt-0.5">
          Overview of your active orders and deliverables.
        </p>
      </div>

      {/* 3 Simple Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Card 1: In Pipeline */}
        <Link
          href="/orders"
          className="bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-2xs hover:shadow-xs transition block group"
        >
          <div className="flex items-center justify-between text-xs font-semibold text-neutral-500">
            <span>Orders in Pipeline</span>
            <Clock className="h-4 w-4 text-purple-600" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-neutral-900">{inFlightCount}</span>
            <span className="text-xs text-neutral-400 font-medium">in production</span>
          </div>
        </Link>

        {/* Card 2: Ready for Review */}
        <Link
          href="/orders?status=delivered"
          className="bg-white p-5 rounded-2xl border border-emerald-200/80 shadow-2xs hover:shadow-xs transition block group"
        >
          <div className="flex items-center justify-between text-xs font-semibold text-neutral-500">
            <span>Ready for Review</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-neutral-900">{deliveredCount}</span>
            {deliveredCount > 0 && (
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                Needs review
              </span>
            )}
          </div>
        </Link>

        {/* Card 3: Word Credits Remaining */}
        <Link
          href="/settings/plan"
          className="bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-2xs hover:shadow-xs transition block group"
        >
          <div className="flex items-center justify-between text-xs font-semibold text-neutral-500">
            <span>Word Credits</span>
            <Zap className="h-4 w-4 text-orange-500 fill-orange-500" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-neutral-900">
              {formatNumber(organization.word_credits_remaining)}
            </span>
            <span className="text-xs text-neutral-400">words remaining</span>
          </div>
        </Link>
      </div>

      {/* Clean Full-Width Orders Table */}
      <div className="bg-white rounded-2xl border border-neutral-200/80 p-6 shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b border-neutral-100 pb-4">
          <div>
            <h2 className="text-base font-bold text-neutral-900">Active Orders</h2>
            <p className="text-xs text-neutral-500">
              All content orders currently in writing and editorial review.
            </p>
          </div>
          <Link
            href="/orders"
            className="text-xs font-semibold text-neutral-700 hover:text-neutral-900 hover:underline flex items-center gap-1"
          >
            View all ({orders.length}) <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {activeOrders.length === 0 ? (
          <div className="py-12 text-center">
            <FileText className="h-8 w-8 text-neutral-300 mx-auto mb-2" />
            <p className="text-xs font-semibold text-neutral-700">No active orders</p>
            <p className="text-xs text-neutral-400 mt-0.5">
              Click &quot;New Order&quot; in the header to create your first brief.
            </p>

            {/* Only offered while the workspace is genuinely empty — seed_demo_data()
                refuses to run once any order exists — and only in development. */}
            {SHOW_DEMO_SEED && orders.length === 0 && (
              <div className="mt-5 pt-5 border-t border-neutral-100 max-w-xs mx-auto space-y-2">
                <p className="text-[11px] text-neutral-400">
                  Want something to look at? Load a sample workspace with eight orders
                  across every status.
                </p>
                {seedError && (
                  <p role="alert" className="text-[11px] font-medium text-rose-600">
                    {seedError}
                  </p>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  isLoading={isSeeding}
                  onClick={async () => {
                    setSeedError("");
                    setIsSeeding(true);
                    try {
                      await seedDemoData();
                    } catch (err) {
                      setSeedError(err instanceof Error ? err.message : String(err));
                    } finally {
                      setIsSeeding(false);
                    }
                  }}
                  leftIcon={<Sparkles className="h-3.5 w-3.5" />}
                >
                  Load sample data
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="divide-y divide-neutral-100">
            {activeOrders.slice(0, 8).map((order) => {
              const typeConfig = CONTENT_TYPES[order.content_type] || CONTENT_TYPES.other;
              const isDelivered = order.status === "delivered";
              const isNew = new Date().getTime() - new Date(order.created_at).getTime() < 300000; // < 5 mins

              return (
                <div
                  key={order.id}
                  className={`py-3.5 flex items-center justify-between gap-4 transition-colors ${
                    isNew ? "bg-orange-50/25 -mx-2 px-2 rounded-xl" : ""
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/orders/${order.id}`}
                        className="text-xs sm:text-sm font-bold text-neutral-900 hover:underline truncate"
                      >
                        {order.title}
                      </Link>
                      {isNew && (
                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-md bg-orange-100 text-orange-700 uppercase tracking-wider shrink-0 animate-pulse">
                          New
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 mt-1 text-[11px] text-neutral-500">
                      <span className="font-semibold text-neutral-700">{typeConfig.label}</span>
                      <span>•</span>
                      <span>{order.word_count_target.toLocaleString()} words</span>
                      <span>•</span>
                      <span>Due {order.due_date}</span>
                      {order.assigned_writer && (
                        <>
                          <span>•</span>
                          <span className="text-neutral-700 font-medium">
                            {order.assigned_writer.full_name}
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <OrderStatusBadge status={order.status} size="sm" />
                    <Link href={`/orders/${order.id}`}>
                      <Button
                        size="sm"
                        variant={isDelivered ? "primary" : "ghost"}
                        className="h-8 px-3 text-xs"
                      >
                        {isDelivered ? "Review" : "View"}
                      </Button>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Activity timeline — the only surface for the events the store records */}
      <RecentActivityFeed activities={activities.slice(0, 8)} />
    </div>
  );
}
