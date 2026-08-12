"use client";

import React, { useState } from "react";
import { CheckCircle2, Star, Sparkles } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";

interface ApproveOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderTitle: string;
  assignedWriterName?: string;
  onApprove: (feedback?: { rating: number; note: string }) => void | Promise<void>;
}

export const ApproveOrderModal: React.FC<ApproveOrderModalProps> = ({
  isOpen,
  onClose,
  orderTitle,
  assignedWriterName,
  onApprove,
}) => {
  const [rating, setRating] = useState(5);
  const [note, setNote] = useState("");
  const [isApproving, setIsApproving] = useState(false);

  const [error, setError] = useState("");

  const handleConfirm = async () => {
    setError("");
    setIsApproving(true);
    try {
      // Awaited: onApprove now writes to Supabase. Firing and forgetting would
      // close the modal before the write resolved and swallow any failure as an
      // unhandled rejection.
      await onApprove({ rating, note });
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setIsApproving(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Approve & Complete Deliverable"
      description="Mark this content order as approved and finalized for publishing."
      maxWidth="md"
    >
      <div className="space-y-4">
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200/80 flex items-start gap-3">
          <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
          <div className="text-xs text-emerald-950">
            <p className="font-bold">Final Deliverable Ready</p>
            <p className="mt-0.5 text-emerald-800">
              Approving will move this order to your Completed archive and mark the writer&apos;s milestone as delivered.
            </p>
          </div>
        </div>

        {/* Rating Writer Feedback (Optional) */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-neutral-700">
            Rate this draft (Optional for {assignedWriterName || "writer"})
          </label>
          <div className="flex items-center gap-1.5">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                className="p-1 text-amber-400 hover:scale-110 transition"
              >
                <Star
                  className={`h-6 w-6 ${
                    star <= rating ? "fill-amber-400 text-amber-400" : "text-neutral-300"
                  }`}
                />
              </button>
            ))}
          </div>
        </div>

        {/* Optional appreciation note */}
        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-neutral-700">
            Leave a quick note for the writer (Optional)
          </label>
          <input
            type="text"
            placeholder="e.g. Excellent work on the technical benchmarks, Elena!"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full h-10 px-3.5 bg-white text-neutral-900 text-xs rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-900"
          />
        </div>

        {error && (
          <p role="alert" className="text-xs font-medium text-rose-600">
            {error}
          </p>
        )}

        {/* Buttons */}
        <div className="pt-3 border-t border-neutral-100 flex items-center justify-end gap-2.5">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="button"
            variant="success"
            size="sm"
            isLoading={isApproving}
            onClick={handleConfirm}
            leftIcon={<CheckCircle2 className="h-3.5 w-3.5" />}
          >
            Confirm Approval
          </Button>
        </div>
      </div>
    </Modal>
  );
};
