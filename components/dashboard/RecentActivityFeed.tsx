import React from "react";
import Link from "next/link";
import {
  FileText,
  FilePlus,
  MessageSquare,
  CheckCircle2,
  AlertCircle,
  UserPlus,
  UserCheck,
  PenTool,
  Clock,
} from "lucide-react";
import { ActivityEvent } from "@/lib/types";
import { formatRelativeTime } from "@/lib/utils";

interface RecentActivityFeedProps {
  activities: ActivityEvent[];
}

export const RecentActivityFeed: React.FC<RecentActivityFeedProps> = ({ activities }) => {
  const getEventIcon = (type: ActivityEvent["type"]) => {
    switch (type) {
      case "order_created":
        return <FilePlus className="h-3.5 w-3.5 text-neutral-700" />;
      case "writer_assigned":
        return <UserCheck className="h-3.5 w-3.5 text-indigo-600" />;
      case "deliverable_submitted":
        return <FileText className="h-3.5 w-3.5 text-emerald-600" />;
      case "writing_started":
        return <PenTool className="h-3.5 w-3.5 text-purple-600" />;
      case "revision_requested":
        return <AlertCircle className="h-3.5 w-3.5 text-rose-600" />;
      case "order_approved":
        return <CheckCircle2 className="h-3.5 w-3.5 text-teal-600" />;
      case "comment_added":
        return <MessageSquare className="h-3.5 w-3.5 text-blue-600" />;
      case "member_invited":
        return <UserPlus className="h-3.5 w-3.5 text-orange-600" />;
      default:
        return <Clock className="h-3.5 w-3.5 text-neutral-500" />;
    }
  };

  const getEventDescription = (activity: ActivityEvent) => {
    switch (activity.type) {
      case "order_created":
        return (
          <>
            <span className="font-semibold text-neutral-900">{activity.actor_name}</span>{" "}
            submitted{" "}
            <span className="font-medium text-neutral-800 italic">
              {activity.order_title}
            </span>{" "}
            to the writing queue
            {activity.payload?.words ? ` (${activity.payload.words} words)` : ""}.
          </>
        );
      case "writer_assigned":
        return (
          <>
            <span className="font-medium text-neutral-800 italic">{activity.order_title}</span>{" "}
            was assigned to{" "}
            <span className="font-semibold text-neutral-900">{activity.actor_name}</span>.
          </>
        );
      case "comment_added":
        return (
          <>
            <span className="font-semibold text-neutral-900">{activity.actor_name}</span>{" "}
            commented on{" "}
            <span className="font-medium text-neutral-800 italic">
              {activity.order_title}
            </span>
          </>
        );
      case "deliverable_submitted":
        return (
          <>
            <span className="font-semibold text-neutral-900">{activity.actor_name}</span>{" "}
            submitted Deliverable v{activity.payload?.version || 1} for{" "}
            <span className="font-medium text-neutral-800 italic">
              {activity.order_title}
            </span>
          </>
        );
      case "writing_started":
        return (
          <>
            <span className="font-semibold text-neutral-900">{activity.actor_name}</span>{" "}
            started drafting{" "}
            <span className="font-medium text-neutral-800 italic">
              {activity.order_title}
            </span>
          </>
        );
      case "revision_requested":
        return (
          <>
            <span className="font-semibold text-neutral-900">{activity.actor_name}</span>{" "}
            requested revisions on{" "}
            <span className="font-medium text-neutral-800 italic">
              {activity.order_title}
            </span>
          </>
        );
      case "order_approved":
        return (
          <>
            <span className="font-semibold text-neutral-900">{activity.actor_name}</span>{" "}
            approved and completed{" "}
            <span className="font-medium text-neutral-800 italic">
              {activity.order_title}
            </span>
          </>
        );
      case "member_invited":
        return (
          <>
            <span className="font-semibold text-neutral-900">{activity.actor_name}</span>{" "}
            invited <span className="font-medium text-neutral-800">{activity.payload?.email}</span> to the organization.
          </>
        );
      default:
        return <span>Activity recorded in pipeline</span>;
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-neutral-200/80 p-5 shadow-2xs">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-sm font-bold text-neutral-900">Recent Agency Activity</h2>
          <p className="text-xs text-neutral-500">Live timeline of production pipeline updates</p>
        </div>
      </div>

      {activities.length === 0 ? (
        <div className="py-8 text-center">
          <Clock className="h-7 w-7 text-neutral-300 mx-auto mb-2" />
          <p className="text-xs font-semibold text-neutral-700">No activity yet</p>
          <p className="text-xs text-neutral-400 mt-0.5">
            Order submissions, approvals, and revisions will appear here.
          </p>
        </div>
      ) : (
      <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-px before:bg-neutral-200">
        {activities.map((activity) => (
          <div key={activity.id} className="relative flex items-start justify-between gap-3 text-xs">
            {/* Timeline Dot Icon — colour-coded per event type */}
            <div className="absolute -left-[30px] -top-0.5 h-6 w-6 rounded-full bg-white border border-neutral-200 flex items-center justify-center shrink-0">
              {getEventIcon(activity.type)}
            </div>

            <div className="flex-1 pr-2">
              <p className="text-neutral-600 leading-relaxed">
                {getEventDescription(activity)}
              </p>
              {activity.order_id && (
                <Link
                  href={`/orders/${activity.order_id}`}
                  className="text-[11px] font-semibold text-neutral-900 hover:underline inline-block mt-0.5"
                >
                  View order details →
                </Link>
              )}
            </div>

            <span className="text-[11px] text-neutral-400 shrink-0 font-medium whitespace-nowrap">
              {formatRelativeTime(activity.created_at)}
            </span>
          </div>
        ))}
      </div>
      )}
    </div>
  );
};
