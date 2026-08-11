import React from "react";
import Link from "next/link";
import { CheckCircle2, ArrowRight, Clock, FileText, UserCheck } from "lucide-react";
import { Order } from "@/lib/types";
import { CONTENT_TYPES } from "@/lib/config";
import { calculateReadingTime, formatNumber } from "@/lib/utils";
import { Button } from "@/components/ui/Button";

interface NeedsAttentionListProps {
  orders: Order[];
}

export const NeedsAttentionList: React.FC<NeedsAttentionListProps> = ({ orders }) => {
  const deliveredOrders = orders.filter((o) => o.status === "delivered");

  if (deliveredOrders.length === 0) return null;

  return (
    <div className="bg-gradient-to-r from-emerald-50/80 via-teal-50/40 to-white rounded-2xl border border-emerald-200/80 p-5 shadow-2xs">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="h-7 w-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center">
            <CheckCircle2 className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-neutral-900">
              Deliverables Ready for Review ({deliveredOrders.length})
            </h2>
            <p className="text-xs text-neutral-500">
              Agency has finished drafting. Review and approve or request revisions.
            </p>
          </div>
        </div>
        <Link href="/orders?status=delivered" className="text-xs font-semibold text-emerald-800 hover:underline">
          View all
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {deliveredOrders.map((order) => {
          const typeConfig = CONTENT_TYPES[order.content_type] || CONTENT_TYPES.other;
          const latestDeliverable = order.deliverables?.[0];

          return (
            <div
              key={order.id}
              className="bg-white rounded-xl border border-emerald-100 p-4 shadow-2xs hover:shadow-xs transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60">
                    {typeConfig.label}
                  </span>
                  <span className="text-[11px] font-medium text-neutral-400">
                    v{latestDeliverable?.version || 1} • {formatNumber(latestDeliverable?.word_count || order.word_count_target)} words
                  </span>
                </div>

                <h3 className="text-sm font-bold text-neutral-900 line-clamp-2 leading-snug">
                  {order.title}
                </h3>

                {order.assigned_writer && (
                  <div className="flex items-center gap-2 mt-3 pt-3 border-t border-neutral-100">
                    <img
                      src={order.assigned_writer.avatar_url}
                      alt={order.assigned_writer.full_name}
                      className="h-6 w-6 rounded-full object-cover ring-1 ring-neutral-200"
                    />
                    <div className="text-xs text-neutral-600">
                      Written by <span className="font-medium text-neutral-900">{order.assigned_writer.full_name}</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-4 pt-3 flex items-center justify-between border-t border-neutral-100">
                <span className="text-xs text-neutral-500 font-medium">
                  {calculateReadingTime(latestDeliverable?.word_count || order.word_count_target)}
                </span>
                <Link href={`/orders/${order.id}`}>
                  <Button size="sm" variant="primary" rightIcon={<ArrowRight className="h-3.5 w-3.5" />}>
                    Review Deliverable
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
