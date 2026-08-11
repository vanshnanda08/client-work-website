"use client";

import React, { useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FileText,
  Search,
  Hash,
  Calendar,
  Link as LinkIcon,
  Plus,
  Trash2,
  ArrowLeft,
} from "lucide-react";
import { CONTENT_TYPES } from "@/lib/config";
import { ContentType, Order, Priority } from "@/lib/types";
import { useStore } from "@/lib/context/StoreContext";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";

export default function EditDraftOrderPage({ params }: { params: Promise<{ orderId: string }> }) {
  const { orderId } = use(params);
  const { orders } = useStore();

  const draftOrder = orders.find((o) => o.id.toLowerCase() === orderId.toLowerCase());

  if (!draftOrder) {
    return (
      <div className="p-12 text-center">
        <h2 className="text-lg font-bold text-neutral-900">Order not found</h2>
        <p className="text-xs text-neutral-500 mt-1">
          This order may have been deleted or never existed.
        </p>
        <Link href="/orders">
          <Button variant="primary" size="sm" className="mt-4">
            Back to Orders
          </Button>
        </Link>
      </div>
    );
  }

  // Keyed on the order id so the form state re-seeds if the route changes.
  return <EditDraftForm key={draftOrder.id} order={draftOrder} />;
}

function EditDraftForm({ order }: { order: Order }) {
  const router = useRouter();
  const { updateOrder, submitDraft, deleteOrder } = useStore();

  const [title, setTitle] = useState(order.title);
  const [contentType, setContentType] = useState<ContentType>(order.content_type);
  const [wordCount, setWordCount] = useState(order.word_count_target);
  const [primaryKeyword, setPrimaryKeyword] = useState(order.primary_keyword || "");
  const [secondaryKeywords, setSecondaryKeywords] = useState<string[]>(
    order.secondary_keywords || []
  );
  const [keywordInput, setKeywordInput] = useState("");
  const [brief, setBrief] = useState(order.brief || "");
  const [tone, setTone] = useState(order.tone || "");
  const [targetAudience, setTargetAudience] = useState(order.target_audience || "");
  const [referenceUrls, setReferenceUrls] = useState<string[]>(
    order.reference_urls && order.reference_urls.length > 0 ? order.reference_urls : [""]
  );
  const [dueDate, setDueDate] = useState(order.due_date);
  const [priority, setPriority] = useState<Priority>(order.priority);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  const isDraft = order.status === "draft";

  const collectFields = () => ({
    title: title.trim(),
    content_type: contentType,
    word_count_target: Number(wordCount) || 0,
    primary_keyword: primaryKeyword.trim(),
    secondary_keywords: secondaryKeywords,
    brief: brief.trim(),
    tone: tone.trim(),
    target_audience: targetAudience.trim(),
    reference_urls: referenceUrls.map((u) => u.trim()).filter(Boolean),
    due_date: dueDate,
    priority,
  });

  const handleAddKeyword = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && keywordInput.trim()) {
      e.preventDefault();
      if (!secondaryKeywords.includes(keywordInput.trim())) {
        setSecondaryKeywords([...secondaryKeywords, keywordInput.trim()]);
      }
      setKeywordInput("");
    }
  };

  const handleRemoveKeyword = (kw: string) => {
    setSecondaryKeywords(secondaryKeywords.filter((k) => k !== kw));
  };

  const handleUrlChange = (index: number, val: string) => {
    const next = [...referenceUrls];
    next[index] = val;
    setReferenceUrls(next);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Please provide an order title.");
      return;
    }
    if (!brief.trim()) {
      setError("Please provide a content brief before submitting to the queue.");
      return;
    }
    setError("");
    setIsSubmitting(true);

    try {
      // Both awaited: the save must land before submit_order() reads the row,
      // and navigating early would race the writes.
      await updateOrder(order.id, collectFields());
      await submitDraft(order.id);
      router.push(`/orders/${order.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setIsSubmitting(false);
    }
  };

  const handleSaveDraft = async () => {
    if (!title.trim()) {
      setError("Please provide an order title.");
      return;
    }
    setError("");
    setIsSaving(true);
    try {
      await updateOrder(order.id, collectFields());
      router.push("/orders");
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Delete draft "${order.title}"? This cannot be undone.`)) return;
    try {
      await deleteOrder(order.id);
      router.push("/orders");
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      <div>
        <Link
          href="/orders"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-500 hover:text-neutral-900 transition"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to all orders
        </Link>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight mt-2">
          {isDraft ? "Edit Draft" : "Edit Order"}: {order.reference ?? order.id}
        </h1>
        <p className="text-xs sm:text-sm text-neutral-500 mt-1">
          {isDraft
            ? "Make updates to your draft specifications and submit to the writing queue."
            : "This order is already in production — edits are shared with the assigned writer."}
        </p>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs font-medium text-rose-800">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          <div className="lg:col-span-2 bg-white rounded-2xl border border-neutral-200/80 p-6 sm:p-8 shadow-2xs space-y-6">
            <Input
              label="Content Title / Topic"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              leftIcon={<FileText className="h-4 w-4 text-neutral-400" />}
              required
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-neutral-700">
                  Content Format
                </label>
                <select
                  value={contentType}
                  onChange={(e) => setContentType(e.target.value as ContentType)}
                  className="w-full h-10 px-3.5 bg-white text-neutral-900 text-sm rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-900 font-medium cursor-pointer"
                >
                  {Object.entries(CONTENT_TYPES).map(([key, val]) => (
                    <option key={key} value={key}>
                      {val.label}
                    </option>
                  ))}
                </select>
              </div>

              <Input
                label="Target Word Count"
                type="number"
                step="100"
                min="300"
                max="15000"
                value={wordCount}
                onChange={(e) => setWordCount(parseInt(e.target.value) || 0)}
                leftIcon={<Hash className="h-4 w-4 text-neutral-400" />}
              />
            </div>

            <Textarea
              label="Detailed Content Brief"
              rows={6}
              value={brief}
              onChange={(e) => setBrief(e.target.value)}
              required
            />

            {/* SEO Keywords */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-neutral-100">
              <Input
                label="Primary Keyword"
                value={primaryKeyword}
                onChange={(e) => setPrimaryKeyword(e.target.value)}
                leftIcon={<Search className="h-4 w-4 text-neutral-400" />}
              />

              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-neutral-700">
                  Secondary Keywords (Press Enter)
                </label>
                <input
                  type="text"
                  placeholder="Type keyword and press Enter..."
                  value={keywordInput}
                  onChange={(e) => setKeywordInput(e.target.value)}
                  onKeyDown={handleAddKeyword}
                  className="w-full h-10 px-3.5 bg-white text-neutral-900 text-sm rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-900"
                />
                {secondaryKeywords.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1.5">
                    {secondaryKeywords.map((kw) => (
                      <span
                        key={kw}
                        className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-neutral-100 text-neutral-800 text-xs font-medium border border-neutral-200"
                      >
                        {kw}
                        <button
                          type="button"
                          onClick={() => handleRemoveKeyword(kw)}
                          className="hover:text-rose-600 ml-0.5 font-bold cursor-pointer"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Tone & Audience */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-neutral-100">
              <Input
                label="Tone of Voice"
                value={tone}
                onChange={(e) => setTone(e.target.value)}
              />

              <Input
                label="Target Audience Persona"
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value)}
              />
            </div>

            {/* Reference URLs */}
            <div className="space-y-2 pt-4 border-t border-neutral-100">
              <label className="block text-xs font-medium text-neutral-700">
                Reference & Research URLs
              </label>
              {referenceUrls.map((url, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="flex-1">
                    <Input
                      placeholder="https://..."
                      value={url}
                      onChange={(e) => handleUrlChange(index, e.target.value)}
                      leftIcon={<LinkIcon className="h-4 w-4 text-neutral-400" />}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => setReferenceUrls(referenceUrls.filter((_, i) => i !== index))}
                    className="p-2 text-neutral-400 hover:text-rose-600 rounded-lg hover:bg-neutral-100 transition cursor-pointer"
                    aria-label="Remove reference URL"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => setReferenceUrls([...referenceUrls, ""])}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-600 hover:text-neutral-900 transition cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" />
                Add another reference
              </button>
            </div>

            {/* Schedule & Priority */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-neutral-100">
              <Input
                label="Target Due Date"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                leftIcon={<Calendar className="h-4 w-4 text-neutral-400" />}
                required
              />

              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-neutral-700">
                  Production Priority
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as Priority)}
                  className="w-full h-10 px-3.5 bg-white text-neutral-900 text-sm rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-900 font-medium cursor-pointer"
                >
                  <option value="standard">Standard Turnaround (~5-7 Days)</option>
                  <option value="high">High Priority (~3-4 Days)</option>
                  <option value="urgent">Urgent Rush (~48 Hours)</option>
                </select>
              </div>
            </div>

            <div className="pt-6 border-t border-neutral-100 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                {isDraft && (
                  <Button type="submit" size="md" variant="primary" isLoading={isSubmitting}>
                    Submit to Writing Queue
                  </Button>
                )}
                <Button
                  type="button"
                  size="md"
                  variant={isDraft ? "secondary" : "primary"}
                  onClick={handleSaveDraft}
                  isLoading={isSaving}
                >
                  {isDraft ? "Save Draft" : "Save Changes"}
                </Button>
              </div>

              <Link href="/orders">
                <Button type="button" size="md" variant="ghost">
                  Cancel
                </Button>
              </Link>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-neutral-200/80 p-6 shadow-2xs space-y-4">
            <h3 className="text-sm font-bold text-neutral-900">
              {isDraft ? "Draft Status" : "Order Status"}
            </h3>
            {isDraft ? (
              <>
                <p className="text-xs text-neutral-500 leading-relaxed">
                  This order has not been placed into production yet. No word credits have been
                  deducted.
                </p>
                <div className="p-3.5 rounded-xl bg-orange-50/60 border border-orange-100 text-xs text-orange-950">
                  Submitting this draft will allocate ~{(Number(wordCount) || 0).toLocaleString()}{" "}
                  words from your plan allowance.
                </div>

                <div className="pt-4 border-t border-neutral-100">
                  <button
                    type="button"
                    onClick={handleDelete}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-600 hover:text-rose-800 transition cursor-pointer"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Delete this draft
                  </button>
                </div>
              </>
            ) : (
              <p className="text-xs text-neutral-500 leading-relaxed">
                This order is already in production. Saving changes updates the brief shared with{" "}
                {order.assigned_writer?.full_name || "the editorial team"}.
              </p>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
