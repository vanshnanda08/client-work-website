"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Bell,
  CheckCheck,
  FileText,
  MessageSquare,
  Clock,
  Sparkles,
  ArrowRight,
  Filter,
} from "lucide-react";
import { useStore } from "@/lib/context/StoreContext";
import { formatRelativeTime } from "@/lib/utils";
import { Button } from "@/components/ui/Button";

export default function NotificationsPage() {
  const { notifications, markNotificationsAsRead, markNotificationAsRead } = useStore();
  const [filterTab, setFilterTab] = useState<"all" | "unread" | "deliverable">("all");

  /**
   * Both read actions update state optimistically and the store re-reads the
   * workspace on failure, rolling the badge back and surfacing the message in
   * the WorkspaceGate banner. This catch only stops the rejection the store
   * re-throws from becoming an unhandled promise rejection.
   */
  const reportedByStore = () => {};

  const unreadCount = notifications.filter((n) => !n.read_at).length;

  const filtered = notifications.filter((n) => {
    if (filterTab === "unread") return !n.read_at;
    if (filterTab === "deliverable") return n.type === "deliverable";
    return true;
  });

  const getIcon = (type: string) => {
    switch (type) {
      case "deliverable":
        return <FileText className="h-4 w-4 text-emerald-600" />;
      case "comment":
        return <MessageSquare className="h-4 w-4 text-blue-600" />;
      default:
        return <Clock className="h-4 w-4 text-orange-600" />;
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight">
            Notifications
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 mt-1">
            Stay updated on new deliverable uploads, revisions, and agency announcements.
          </p>
        </div>

        {unreadCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => markNotificationsAsRead().catch(reportedByStore)}
            leftIcon={<CheckCheck className="h-4 w-4" />}
          >
            Mark all as read
          </Button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setFilterTab("all")}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
            filterTab === "all"
              ? "bg-neutral-900 text-white"
              : "bg-white text-neutral-600 border border-neutral-200 hover:bg-neutral-50"
          }`}
        >
          All ({notifications.length})
        </button>
        <button
          onClick={() => setFilterTab("unread")}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
            filterTab === "unread"
              ? "bg-neutral-900 text-white"
              : "bg-white text-neutral-600 border border-neutral-200 hover:bg-neutral-50"
          }`}
        >
          Unread ({unreadCount})
        </button>
        <button
          onClick={() => setFilterTab("deliverable")}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
            filterTab === "deliverable"
              ? "bg-neutral-900 text-white"
              : "bg-white text-neutral-600 border border-neutral-200 hover:bg-neutral-50"
          }`}
        >
          Deliverables Ready
        </button>
      </div>

      {/* Notifications List */}
      <div className="bg-white rounded-2xl border border-neutral-200/80 shadow-2xs divide-y divide-neutral-100 overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-12 text-center">
            <div className="h-10 w-10 rounded-xl bg-neutral-100 text-neutral-400 flex items-center justify-center mx-auto mb-2">
              <Bell className="h-5 w-5" />
            </div>
            <p className="text-xs font-semibold text-neutral-900">No notifications</p>
            <p className="text-xs text-neutral-400 mt-0.5">You&apos;re all caught up!</p>
          </div>
        ) : (
          filtered.map((n) => {
            const isUnread = !n.read_at;
            return (
              <div
                key={n.id}
                className={`p-4 sm:p-5 flex items-start gap-4 transition hover:bg-neutral-50/80 ${
                  isUnread ? "bg-orange-50/15" : ""
                }`}
              >
                <div className="p-2.5 rounded-xl bg-neutral-100 shrink-0 mt-0.5">
                  {getIcon(n.type)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs sm:text-sm font-bold text-neutral-900">
                        {n.title}
                      </h4>
                      {isUnread && (
                        <span className="h-2 w-2 rounded-full bg-orange-500 shrink-0" />
                      )}
                    </div>
                    <span className="text-[11px] text-neutral-400 shrink-0 font-medium">
                      {formatRelativeTime(n.created_at)}
                    </span>
                  </div>

                  <p className="text-xs text-neutral-600 mt-1 leading-relaxed">
                    {n.message}
                  </p>

                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    {n.order_id && (
                      <Link
                        href={`/orders/${n.order_id}`}
                        onClick={() => markNotificationAsRead(n.id).catch(reportedByStore)}
                      >
                        <Button size="sm" variant="outline" rightIcon={<ArrowRight className="h-3 w-3" />}>
                          View Order Deliverable
                        </Button>
                      </Link>
                    )}

                    {isUnread && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => markNotificationAsRead(n.id).catch(reportedByStore)}
                        leftIcon={<CheckCheck className="h-3 w-3" />}
                      >
                        Mark as read
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
