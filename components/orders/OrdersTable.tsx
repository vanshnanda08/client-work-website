import React from "react";
import Link from "next/link";
import {
  Clock,
  ArrowRight,
  MoreVertical,
  Edit3,
  FileCheck,
  FileText,
  User,
  AlertTriangle,
} from "lucide-react";
import { Order } from "@/lib/types";
import { OrderStatusBadge } from "./OrderStatusBadge";
import { CONTENT_TYPES, PRIORITY_CONFIG } from "@/lib/config";
import { formatNumber, getDaysRemaining } from "@/lib/utils";
import { Button } from "@/components/ui/Button";

interface OrdersTableProps {
  orders: Order[];
}

export const OrdersTable: React.FC<OrdersTableProps> = ({ orders }) => {
  if (orders.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-neutral-200/80 p-12 text-center shadow-2xs">
        <div className="h-12 w-12 rounded-2xl bg-neutral-100 text-neutral-400 flex items-center justify-center mx-auto mb-3">
          <FileText className="h-6 w-6" />
        </div>
        <h3 className="text-base font-bold text-neutral-900">No orders found</h3>
        <p className="text-xs text-neutral-500 max-w-sm mx-auto mt-1 mb-5">
          No orders match the current filter or search criteria. Try clearing filters or create a new order brief.
        </p>
        <Link href="/orders/new">
          <Button variant="primary" size="sm">
            Create New Order
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-neutral-200/80 shadow-2xs overflow-hidden">
      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-neutral-200/80 bg-neutral-50/75 text-[11px] font-bold text-neutral-500 uppercase tracking-wider">
              <th className="py-3.5 pl-6 pr-4">Order & Content Type</th>
              <th className="py-3.5 px-4">Assigned Writer</th>
              <th className="py-3.5 px-4">Due Date & Urgency</th>
              <th className="py-3.5 px-4">Target Words</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 pl-4 pr-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100 text-xs">
            {orders.map((order) => {
              const typeConfig = CONTENT_TYPES[order.content_type] || CONTENT_TYPES.other;
              const dueInfo = getDaysRemaining(order.due_date);
              const isDelivered = order.status === "delivered";
              const isDraft = order.status === "draft";

              return (
                <tr
                  key={order.id}
                  className={`group hover:bg-neutral-50/80 transition-colors ${
                    isDelivered ? "bg-emerald-50/20" : ""
                  }`}
                >
                  {/* Order Title & Type */}
                  <td className="py-4 pl-6 pr-4 max-w-xs sm:max-w-md">
                    <div className="flex items-start gap-2.5">
                      <div className="p-2 rounded-xl bg-neutral-100 group-hover:bg-white text-neutral-600 transition shrink-0 mt-0.5 border border-neutral-200/40">
                        <FileText className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <Link
                          href={isDraft ? `/orders/${order.id}/edit` : `/orders/${order.id}`}
                          className="font-bold text-neutral-900 hover:text-neutral-700 hover:underline block leading-snug line-clamp-1"
                        >
                          {order.title}
                        </Link>
                        <div className="flex items-center gap-2 mt-1 text-[11px] text-neutral-500">
                          <span className="font-medium text-neutral-700">{typeConfig.label}</span>
                          <span>•</span>
                          <span className="text-neutral-400 font-mono uppercase">{order.reference ?? order.id}</span>
                          {order.priority !== "standard" && (
                            <>
                              <span>•</span>
                              <span
                                className={`font-semibold capitalize ${
                                  order.priority === "urgent"
                                    ? "text-rose-600"
                                    : "text-amber-600"
                                }`}
                              >
                                {order.priority}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Assigned Writer */}
                  <td className="py-4 px-4 whitespace-nowrap">
                    {order.assigned_writer ? (
                      <div className="flex items-center gap-2">
                        <img
                          src={order.assigned_writer.avatar_url}
                          alt={order.assigned_writer.full_name}
                          className="h-6 w-6 rounded-full object-cover ring-1 ring-neutral-200"
                        />
                        <div>
                          <div className="font-medium text-neutral-900">
                            {order.assigned_writer.full_name}
                          </div>
                          <div className="text-[10px] text-neutral-400 truncate max-w-[120px]">
                            {order.assigned_writer.title.split("&")[0]}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <span className="text-neutral-400 italic">Matching writer...</span>
                    )}
                  </td>

                  {/* Due Date & Urgency */}
                  <td className="py-4 px-4 whitespace-nowrap">
                    <div className="font-semibold text-neutral-800">{order.due_date}</div>
                    <div
                      className={`text-[11px] font-medium ${
                        dueInfo.isOverdue
                          ? "text-rose-600 font-bold"
                          : dueInfo.isUrgent
                          ? "text-amber-600 font-semibold"
                          : "text-neutral-400"
                      }`}
                    >
                      {dueInfo.label}
                    </div>
                  </td>

                  {/* Target Words */}
                  <td className="py-4 px-4 whitespace-nowrap font-medium text-neutral-700">
                    {formatNumber(order.word_count_target)} words
                  </td>

                  {/* Status Badge */}
                  <td className="py-4 px-4 whitespace-nowrap">
                    <OrderStatusBadge status={order.status} />
                  </td>

                  {/* Action Buttons */}
                  <td className="py-4 pl-4 pr-6 text-right whitespace-nowrap">
                    {isDelivered ? (
                      <Link href={`/orders/${order.id}`}>
                        <Button size="sm" variant="primary" rightIcon={<ArrowRight className="h-3 w-3" />}>
                          Review
                        </Button>
                      </Link>
                    ) : isDraft ? (
                      <Link href={`/orders/${order.id}/edit`}>
                        <Button size="sm" variant="outline" leftIcon={<Edit3 className="h-3 w-3" />}>
                          Edit Draft
                        </Button>
                      </Link>
                    ) : (
                      <Link href={`/orders/${order.id}`}>
                        <Button size="sm" variant="ghost" rightIcon={<ArrowRight className="h-3 w-3" />}>
                          Details
                        </Button>
                      </Link>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Card List View */}
      <div className="md:hidden divide-y divide-neutral-100">
        {orders.map((order) => {
          const typeConfig = CONTENT_TYPES[order.content_type] || CONTENT_TYPES.other;
          const dueInfo = getDaysRemaining(order.due_date);
          const isDelivered = order.status === "delivered";

          return (
            <div key={order.id} className="p-4 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div className="text-[11px] font-semibold text-neutral-500">
                  {typeConfig.label} • <span className="font-mono uppercase">{order.reference ?? order.id}</span>
                </div>
                <OrderStatusBadge status={order.status} size="sm" />
              </div>

              <Link
                href={`/orders/${order.id}`}
                className="font-bold text-sm text-neutral-900 hover:underline block leading-snug"
              >
                {order.title}
              </Link>

              <div className="flex items-center justify-between text-xs text-neutral-500 pt-1 border-t border-neutral-100">
                <div className="flex items-center gap-2">
                  {order.assigned_writer ? (
                    <>
                      <img
                        src={order.assigned_writer.avatar_url}
                        alt={order.assigned_writer.full_name}
                        className="h-5 w-5 rounded-full object-cover"
                      />
                      <span>{order.assigned_writer.full_name}</span>
                    </>
                  ) : (
                    <span className="italic">Agency Queue</span>
                  )}
                </div>

                <div className="font-semibold text-neutral-800">
                  Due {order.due_date}
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between">
                <span className="text-xs text-neutral-400 font-medium">
                  {formatNumber(order.word_count_target)} words
                </span>
                <Link href={`/orders/${order.id}`}>
                  <Button size="sm" variant={isDelivered ? "primary" : "secondary"}>
                    {isDelivered ? "Review Deliverable" : "View Order"}
                  </Button>
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
