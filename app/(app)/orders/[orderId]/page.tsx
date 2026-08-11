"use client";

import React, { useState, use } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  FileEdit,
  Download,
  Clock,
} from "lucide-react";
import { StatusTimelineStepper } from "@/components/order-detail/StatusTimelineStepper";
import { DeliverablesViewer } from "@/components/order-detail/DeliverablesViewer";
import { BriefSummaryCard } from "@/components/order-detail/BriefSummaryCard";
import { CommentsThread } from "@/components/order-detail/CommentsThread";
import { RevisionRequestModal } from "@/components/order-detail/RevisionRequestModal";
import { ApproveOrderModal } from "@/components/order-detail/ApproveOrderModal";
import { OrderStatusBadge } from "@/components/orders/OrderStatusBadge";
import { useStore } from "@/lib/context/StoreContext";
import { CONTENT_TYPES } from "@/lib/config";
import { downloadTextFile, formatDate, slugifyFilename } from "@/lib/utils";
import { Button } from "@/components/ui/Button";

export default function OrderDetailPage({ params }: { params: Promise<{ orderId: string }> }) {
  const { orderId } = use(params);
  const { orders, commentsMap, updateOrderStatus, addComment } = useStore();

  // No fallback to orders[0]: an unknown or deleted id must report "not found"
  // rather than silently rendering a different order.
  const order = orders.find((o) => o.id.toLowerCase() === orderId.toLowerCase());

  const comments = order ? commentsMap[order.id] || [] : [];

  // Modals
  const [isRevisionModalOpen, setIsRevisionModalOpen] = useState(false);
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  const [showSuccessBanner, setShowSuccessBanner] = useState(false);

  if (!order) {
    return (
      <div className="p-12 text-center">
        <h2 className="text-lg font-bold text-neutral-900">Order not found</h2>
        <p className="text-xs text-neutral-500 mt-1">
          No order matches <span className="font-mono">{orderId}</span>. It may have been deleted.
        </p>
        <Link href="/orders">
          <Button variant="primary" size="sm" className="mt-4">
            Back to Orders
          </Button>
        </Link>
      </div>
    );
  }

  const typeConfig = CONTENT_TYPES[order.content_type] || CONTENT_TYPES.other;
  const latestDeliverable = order.deliverables?.[0];
  const isDelivered = order.status === "delivered";
  const isApproved = order.status === "approved";
  const isDraft = order.status === "draft";

  const handleApprove = (feedback?: { rating: number; note: string }) => {
    updateOrderStatus(order.id, "approved", feedback?.note);
    addComment(
      order.id,
      `Order approved by client. Final deliverable ready for publishing.${
        feedback?.note ? ` Client Note: "${feedback.note}"` : ""
      }`,
      "system"
    );
    setShowSuccessBanner(true);
  };

  const handleRevisionSubmit = (data: { category: string; notes: string }) => {
    updateOrderStatus(order.id, "revision_requested", data.notes);
    addComment(
      order.id,
      `[Revision Request - ${data.category.toUpperCase()}]: ${data.notes}`,
      "client"
    );
    addComment(
      order.id,
      "Status changed to Revision In Progress. Writer notified.",
      "system"
    );
  };

  const handleAddUserComment = (body: string) => {
    addComment(order.id, body, "client");
  };

  // Bundles the approved copy plus its brief into one downloadable handoff file.
  const handleDownloadAssets = () => {
    if (!latestDeliverable) return;

    const assetBundle = [
      `# ${order.title}`,
      "",
      `- Order: ${order.id.toUpperCase()}`,
      `- Format: ${typeConfig.label}`,
      `- Word count: ${latestDeliverable.word_count.toLocaleString()}`,
      `- Primary keyword: ${order.primary_keyword || "—"}`,
      `- Writer: ${order.assigned_writer?.full_name || "Agency Editorial Team"}`,
      `- Approved: ${formatDate(order.updated_at)}`,
      "",
      "---",
      "",
      latestDeliverable.body_md,
    ].join("\n");

    downloadTextFile(`${slugifyFilename(order.title)}-final.md`, assetBundle);
  };

  return (
    <div className="space-y-6 pb-12 max-w-6xl mx-auto">
      {/* Back Link */}
      <div>
        <Link
          href="/orders"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-500 hover:text-neutral-900 transition"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to all orders
        </Link>
      </div>

      {/* Success Notification Banner on Approval */}
      {showSuccessBanner && (
        <div className="p-4 rounded-2xl bg-teal-50 border border-teal-200 text-teal-900 flex items-center justify-between animate-in fade-in duration-200">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5 text-teal-600 shrink-0" />
            <div className="text-xs">
              <span className="font-bold">Order Approved & Completed!</span> You can now download final DOCX/PDF files or copy the markdown copy below.
            </div>
          </div>
          <button
            onClick={() => setShowSuccessBanner(false)}
            className="text-xs font-bold text-teal-700 hover:underline cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Main Order Header & Top Actions */}
      <div className="bg-white rounded-2xl border border-neutral-200/80 p-6 shadow-2xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-xs text-neutral-400 font-bold uppercase">
                {order.id}
              </span>
              <span className="text-neutral-300">•</span>
              <span className="text-xs font-semibold text-neutral-700 bg-neutral-100 px-2.5 py-0.5 rounded-md">
                {typeConfig.label}
              </span>
              <OrderStatusBadge status={order.status} />
              {order.priority !== "standard" && (
                <span className="text-xs font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
                  {order.priority.toUpperCase()}
                </span>
              )}
            </div>

            <h1 className="text-xl sm:text-2xl font-extrabold text-neutral-900 tracking-tight leading-snug">
              {order.title}
            </h1>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            {isDelivered && (
              <>
                <Button
                  variant="success"
                  size="md"
                  onClick={() => setIsApproveModalOpen(true)}
                  leftIcon={<CheckCircle2 className="h-4 w-4" />}
                >
                  Approve Deliverable
                </Button>

                <Button
                  variant="danger"
                  size="md"
                  onClick={() => setIsRevisionModalOpen(true)}
                  leftIcon={<AlertCircle className="h-4 w-4" />}
                >
                  Request Changes
                </Button>
              </>
            )}

            {isDraft && (
              <Link href={`/orders/${order.id}/edit`}>
                <Button variant="primary" size="md" leftIcon={<FileEdit className="h-4 w-4" />}>
                  Resume Editing Draft
                </Button>
              </Link>
            )}

            {isApproved && (
              <Button
                variant="outline"
                size="md"
                onClick={handleDownloadAssets}
                disabled={!latestDeliverable}
                leftIcon={<Download className="h-4 w-4" />}
              >
                Download Assets
              </Button>
            )}
          </div>
        </div>

        {/* Assigned Writer Info Strip */}
        <div className="pt-4 border-t border-neutral-100 flex flex-wrap items-center justify-between gap-4 text-xs text-neutral-600">
          <div className="flex items-center gap-3">
            {order.assigned_writer ? (
              <>
                <img
                  src={order.assigned_writer.avatar_url}
                  alt={order.assigned_writer.full_name}
                  className="h-8 w-8 rounded-full object-cover ring-2 ring-neutral-100"
                />
                <div>
                  <div className="font-bold text-neutral-900">
                    {order.assigned_writer.full_name}
                  </div>
                  <div className="text-[11px] text-neutral-500">
                    {order.assigned_writer.title}
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2 text-neutral-500 italic">
                <Clock className="h-4 w-4" />
                <span>Agency editorial queue assigning specialized writer</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-4 text-neutral-500">
            <div>
              Target: <strong className="text-neutral-900">{order.word_count_target.toLocaleString()} words</strong>
            </div>
            <div>
              Due Date: <strong className="text-neutral-900">{order.due_date}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Visual Pipeline Progress Stepper */}
      <StatusTimelineStepper
        status={order.status}
        createdAt={order.created_at}
        updatedAt={order.updated_at}
      />

      {/* 2-Column Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left 2 Cols: Deliverables Viewer / Markdown Reader */}
        <div className="lg:col-span-2 space-y-6">
          <DeliverablesViewer
            deliverables={order.deliverables || []}
            orderTitle={order.title}
          />
        </div>

        {/* Right 1 Col: Brief Specs & Discussion Thread */}
        <div className="space-y-6">
          {/* Brief Summary */}
          <BriefSummaryCard order={order} />

          {/* Discussion Thread */}
          <CommentsThread
            comments={comments}
            assignedWriter={order.assigned_writer}
            onAddComment={handleAddUserComment}
          />
        </div>
      </div>

      {/* Revision Request Modal */}
      <RevisionRequestModal
        isOpen={isRevisionModalOpen}
        onClose={() => setIsRevisionModalOpen(false)}
        orderTitle={order.title}
        assignedWriterName={order.assigned_writer?.full_name}
        onSubmit={handleRevisionSubmit}
      />

      {/* Approval Modal */}
      <ApproveOrderModal
        isOpen={isApproveModalOpen}
        onClose={() => setIsApproveModalOpen(false)}
        orderTitle={order.title}
        assignedWriterName={order.assigned_writer?.full_name}
        onApprove={handleApprove}
      />
    </div>
  );
}
