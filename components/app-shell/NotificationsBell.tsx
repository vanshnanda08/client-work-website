"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Bell, CheckCheck, FileText, MessageSquare, Clock } from "lucide-react";
import { useStore } from "@/lib/context/StoreContext";
import { formatRelativeTime } from "@/lib/utils";

export const NotificationsBell: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { notifications, markNotificationsAsRead } = useStore();

  const unreadCount = notifications.filter((n) => !n.read_at).length;

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
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-xl text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100/80 border border-neutral-200/80 bg-white transition shadow-2xs cursor-pointer"
        aria-label="Notifications"
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-orange-500 ring-2 ring-white" />
        )}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl border border-neutral-200 shadow-2xl z-40 overflow-hidden animate-in zoom-in-95 duration-100">
            <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-100 bg-neutral-50/50">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-neutral-900">Notifications</span>
                {unreadCount > 0 && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-orange-100 text-orange-700 font-bold">
                    {unreadCount} new
                  </span>
                )}
              </div>
              {unreadCount > 0 && (
                <button
                  onClick={markNotificationsAsRead}
                  className="text-[11px] font-medium text-neutral-600 hover:text-neutral-900 flex items-center gap-1 cursor-pointer"
                >
                  <CheckCheck className="h-3.5 w-3.5" />
                  Mark all read
                </button>
              )}
            </div>

            <div className="divide-y divide-neutral-100 max-h-80 overflow-y-auto">
              {notifications.slice(0, 5).map((n) => {
                const isUnread = !n.read_at;
                return (
                  <Link
                    key={n.id}
                    href={n.order_id ? `/orders/${n.order_id}` : "/notifications"}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-start gap-3 p-3.5 hover:bg-neutral-50 transition block text-left ${
                      isUnread ? "bg-orange-50/20" : ""
                    }`}
                  >
                    <div className="p-2 rounded-xl bg-neutral-100 shrink-0 mt-0.5">
                      {getIcon(n.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <p className="text-xs font-semibold text-neutral-900 truncate">
                          {n.title}
                        </p>
                        {isUnread && (
                          <span className="h-1.5 w-1.5 rounded-full bg-orange-500 shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-neutral-500 line-clamp-2 mt-0.5">
                        {n.message}
                      </p>
                      <span className="text-[10px] text-neutral-400 mt-1 block">
                        {formatRelativeTime(n.created_at)}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>

            <div className="p-2.5 border-t border-neutral-100 bg-neutral-50 text-center">
              <Link
                href="/notifications"
                onClick={() => setIsOpen(false)}
                className="text-xs font-medium text-neutral-700 hover:text-neutral-900 hover:underline"
              >
                View all notifications →
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
