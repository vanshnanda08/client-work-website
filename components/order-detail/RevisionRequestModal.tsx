"use client";

import React, { useState } from "react";
import { AlertCircle, Send, Check } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";

interface RevisionRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderTitle: string;
  assignedWriterName?: string;
  onSubmit: (data: { category: string; notes: string }) => void;
}

export const RevisionRequestModal: React.FC<RevisionRequestModalProps> = ({
  isOpen,
  onClose,
  orderTitle,
  assignedWriterName,
  onSubmit,
}) => {
  const [category, setCategory] = useState("tone");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categories = [
    { id: "tone", label: "Tone & Voice", desc: "Adjust style, cadence, or audience depth" },
    { id: "factual", label: "Factual / Data", desc: "Update statistics, quotes, or product facts" },
    { id: "structure", label: "Structure & Flow", desc: "Reorganize headers, intros, or summaries" },
    { id: "seo", label: "SEO & Keywords", desc: "Add missing keywords or optimize headers" },
    { id: "general", label: "General Edits", desc: "Minor polishing or specific sentence fixes" },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!notes.trim()) {
      alert("Please provide revision feedback instructions.");
      return;
    }
    setIsSubmitting(true);
    setTimeout(() => {
      onSubmit({ category, notes });
      setIsSubmitting(false);
      onClose();
    }, 600);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Request Content Revisions"
      description={`Send specific feedback to ${assignedWriterName || "your assigned writer"}. Unlimited minor revisions are included.`}
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Category Selector */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-neutral-700">
            Primary Area for Revision
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setCategory(cat.id)}
                className={`p-3 rounded-xl border text-left transition flex items-start justify-between ${
                  category === cat.id
                    ? "border-neutral-900 bg-neutral-900/5 ring-1 ring-neutral-900"
                    : "border-neutral-200 hover:bg-neutral-50"
                }`}
              >
                <div>
                  <div className="text-xs font-bold text-neutral-900">{cat.label}</div>
                  <div className="text-[11px] text-neutral-500">{cat.desc}</div>
                </div>
                {category === cat.id && (
                  <Check className="h-4 w-4 text-neutral-900 shrink-0 mt-0.5" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Detailed Notes */}
        <Textarea
          label="Specific Revision Notes & Instructions"
          placeholder="Please explain what you'd like adjusted (e.g. 'In section 2, please add a comparison table for FCR and CSAT metrics. Also tone down the buzzwords in the conclusion...')"
          rows={5}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          required
        />

        {/* Action Buttons */}
        <div className="pt-3 border-t border-neutral-100 flex items-center justify-end gap-2.5">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="danger"
            size="sm"
            isLoading={isSubmitting}
            leftIcon={<AlertCircle className="h-3.5 w-3.5" />}
          >
            Submit Revision Request
          </Button>
        </div>
      </form>
    </Modal>
  );
};
