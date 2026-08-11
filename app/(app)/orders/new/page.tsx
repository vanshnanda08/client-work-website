"use client";

import React, { useState } from "react";
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
  Clock,
  ShieldCheck,
  BookOpen,
  FileCheck,
  Zap,
  Sparkles,
  ChevronRight,
  HelpCircle,
  Layers,
  ArrowLeft,
  Check,
} from "lucide-react";
import { CONTENT_TYPES } from "@/lib/config";
import { ContentType, Priority } from "@/lib/types";
import { useStore } from "@/lib/context/StoreContext";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";

export default function NewOrderPage() {
  const router = useRouter();
  const { createOrder, organization } = useStore();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);

  // Form State
  const [title, setTitle] = useState("");
  const [contentType, setContentType] = useState<ContentType>("seo_article");
  const [wordCount, setWordCount] = useState(1500);
  const [primaryKeyword, setPrimaryKeyword] = useState("");
  const [secondaryKeywords, setSecondaryKeywords] = useState<string[]>([]);
  const [keywordInput, setKeywordInput] = useState("");
  const [brief, setBrief] = useState("");
  const [tone, setTone] = useState("Authoritative, Technical & Direct");
  const [targetAudience, setTargetAudience] = useState("Engineering Leaders & SaaS Decision Makers");
  const [referenceUrls, setReferenceUrls] = useState<string[]>([""]);
  const [dueDate, setDueDate] = useState("2026-08-22");
  const [priority, setPriority] = useState<Priority>("standard");

  // Right-rail settings toggles
  const [sendOutlineFirst, setSendOutlineFirst] = useState(true);
  const [plagiarismCheck, setPlagiarismCheck] = useState(true);
  const [metaDescription, setMetaDescription] = useState(true);
  const [includeMarkdownExport, setIncludeMarkdownExport] = useState(true);

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

  const handleAddUrl = () => {
    setReferenceUrls([...referenceUrls, ""]);
  };

  const handleUrlChange = (index: number, val: string) => {
    const next = [...referenceUrls];
    next[index] = val;
    setReferenceUrls(next);
  };

  const handleRemoveUrl = (index: number) => {
    setReferenceUrls(referenceUrls.filter((_, i) => i !== index));
  };

  const [submitError, setSubmitError] = useState("");

  const collectFields = () => ({
    title: title.trim(),
    content_type: contentType,
    word_count_target: wordCount,
    primary_keyword: primaryKeyword.trim(),
    secondary_keywords: secondaryKeywords,
    tone,
    target_audience: targetAudience,
    reference_urls: referenceUrls.filter((u) => u.trim().length > 0),
    due_date: dueDate,
    priority,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError("");

    if (!title.trim()) {
      setSubmitError("Please provide an order title.");
      return;
    }
    if (!brief.trim()) {
      setSubmitError("Please provide a content brief.");
      return;
    }

    setIsSubmitting(true);
    try {
      // Must await: createOrder writes to Supabase and returns the new row id.
      const newOrderId = await createOrder({
        ...collectFields(),
        brief: brief.trim(),
        status: "submitted",
      });
      router.push(`/orders/${newOrderId}`);
    } catch (err) {
      // Most likely cause: not enough word credits (submit_order() raises).
      setSubmitError(err instanceof Error ? err.message : String(err));
      setIsSubmitting(false);
    }
  };

  const handleSaveDraft = async () => {
    setSubmitError("");
    if (!title.trim()) {
      setSubmitError("Please enter a title to save a draft.");
      return;
    }

    setIsSavingDraft(true);
    try {
      await createOrder({
        ...collectFields(),
        brief: brief.trim() || "Draft brief in progress...",
        status: "draft",
      });
      router.push("/orders?status=draft");
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : String(err));
      setIsSavingDraft(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight">
          New Content Order
        </h1>
        <p className="text-xs sm:text-sm text-neutral-500 mt-1">
          Specify your brief, target audience, and writing parameters to launch production.
        </p>
      </div>

      {submitError && (
        <div
          role="alert"
          className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs font-medium text-rose-800"
        >
          {submitError}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Main 2-Column Layout Matching the Screenshot */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Left 2 Cols: Main Order Form Card */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-neutral-200/80 p-6 sm:p-8 shadow-2xs space-y-6">
            <div className="border-b border-neutral-100 pb-4">
              <h2 className="text-base font-bold text-neutral-900">
                Welcome To The New Order Page
              </h2>
              <p className="text-xs text-neutral-500 mt-0.5">
                Enter title and brief specifications required to begin writing.
              </p>
            </div>

            {/* Section 1: Basics */}
            <div className="space-y-4">
              <Input
                label="Content Title / Topic Headline"
                placeholder="e.g. The Modern Guide to Autonomous AI Agents in Enterprise Support"
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
                    onChange={(e) => {
                      const type = e.target.value as ContentType;
                      setContentType(type);
                      setWordCount(CONTENT_TYPES[type]?.defaultWordCount || 1200);
                    }}
                    className="w-full h-10 px-3.5 bg-white text-neutral-900 text-sm rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-900 font-medium cursor-pointer"
                  >
                    {Object.entries(CONTENT_TYPES).map(([key, val]) => (
                      <option key={key} value={key}>
                        {val.label} (~{val.defaultWordCount} words)
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
                  helperText={`Uses ~${wordCount.toLocaleString()} words from balance`}
                />
              </div>
            </div>

            {/* Section 2: SEO & Keywords */}
            <div className="space-y-4 pt-4 border-t border-neutral-100">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Primary Target Keyword"
                  placeholder="e.g. autonomous AI agents customer support"
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
                            className="hover:text-rose-600 ml-0.5 font-bold"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Section 3: Brief & Tone */}
            <div className="space-y-4 pt-4 border-t border-neutral-100">
              <Textarea
                label="Detailed Content Brief"
                placeholder="Explain the main takeaways, problem statements, audience context, and key structural points the writer should cover..."
                rows={5}
                value={brief}
                onChange={(e) => setBrief(e.target.value)}
                required
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

              {/* Reference & Research URLs */}
              <div className="space-y-2">
                <label className="block text-xs font-medium text-neutral-700">
                  Reference &amp; Research URLs
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
                      onClick={() => handleRemoveUrl(index)}
                      className="p-2 text-neutral-400 hover:text-rose-600 rounded-lg hover:bg-neutral-100 transition cursor-pointer"
                      aria-label="Remove reference URL"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={handleAddUrl}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-600 hover:text-neutral-900 transition cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add another reference
                </button>
              </div>
            </div>

            {/* Section 4: Schedule & Priority */}
            <div className="space-y-4 pt-4 border-t border-neutral-100">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
            </div>

            {/* Bottom Actions (Matching Screenshot) */}
            <div className="pt-6 border-t border-neutral-100 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <Button
                  type="submit"
                  size="md"
                  variant="primary"
                  isLoading={isSubmitting}
                >
                  Submit Order
                </Button>

                <Button
                  type="button"
                  size="md"
                  variant="secondary"
                  onClick={handleSaveDraft}
                  isLoading={isSavingDraft}
                >
                  Save Draft
                </Button>
              </div>

              <Link href="/orders">
                <Button type="button" size="md" variant="ghost">
                  Cancel
                </Button>
              </Link>
            </div>
          </div>

          {/* Right 1 Col: Order Settings Card (Matching Screenshot "Client Settings") */}
          <div className="bg-white rounded-2xl border border-neutral-200/80 p-6 shadow-2xs space-y-5">
            <div>
              <h2 className="text-base font-bold text-neutral-900">Order Settings</h2>
              <p className="text-xs text-neutral-500 mt-0.5">
                Included quality checks and agency rules.
              </p>
            </div>

            <div className="space-y-3">
              {/* Item 1: Outline First */}
              <div
                onClick={() => setSendOutlineFirst(!sendOutlineFirst)}
                className="flex items-center justify-between p-3.5 rounded-xl border border-neutral-200/70 hover:bg-neutral-50 transition cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-xl bg-neutral-100 text-neutral-600 flex items-center justify-center group-hover:bg-white group-hover:shadow-2xs transition">
                    <Clock className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-neutral-900">
                      Send Outline First
                    </div>
                    <div className="text-[11px] text-neutral-500">
                      Approve headers before full draft
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-xs font-semibold text-neutral-700">
                  <span>{sendOutlineFirst ? "Yes" : "No"}</span>
                  <ChevronRight className="h-3.5 w-3.5 text-neutral-400" />
                </div>
              </div>

              {/* Item 2: Plagiarism & AI Scan */}
              <div
                onClick={() => setPlagiarismCheck(!plagiarismCheck)}
                className="flex items-center justify-between p-3.5 rounded-xl border border-neutral-200/70 hover:bg-neutral-50 transition cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-xl bg-neutral-100 text-neutral-600 flex items-center justify-center group-hover:bg-white group-hover:shadow-2xs transition">
                    <ShieldCheck className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-neutral-900">
                      Plagiarism & AI Check
                    </div>
                    <div className="text-[11px] text-neutral-500">
                      100% Originality QA Report
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-xs font-semibold text-neutral-700">
                  <span>{plagiarismCheck ? "Included" : "No"}</span>
                  <ChevronRight className="h-3.5 w-3.5 text-neutral-400" />
                </div>
              </div>

              {/* Item 3: SEO Meta Description */}
              <div
                onClick={() => setMetaDescription(!metaDescription)}
                className="flex items-center justify-between p-3.5 rounded-xl border border-neutral-200/70 hover:bg-neutral-50 transition cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-xl bg-neutral-100 text-neutral-600 flex items-center justify-center group-hover:bg-white group-hover:shadow-2xs transition">
                    <BookOpen className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-neutral-900">
                      SEO Meta Description
                    </div>
                    <div className="text-[11px] text-neutral-500">
                      Title tags and SERP summary
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-xs font-semibold text-neutral-700">
                  <span>{metaDescription ? "Yes" : "No"}</span>
                  <ChevronRight className="h-3.5 w-3.5 text-neutral-400" />
                </div>
              </div>

              {/* Item 4: Multi-format Deliverables */}
              <div
                onClick={() => setIncludeMarkdownExport(!includeMarkdownExport)}
                className="flex items-center justify-between p-3.5 rounded-xl border border-neutral-200/70 hover:bg-neutral-50 transition cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-xl bg-neutral-100 text-neutral-600 flex items-center justify-center group-hover:bg-white group-hover:shadow-2xs transition">
                    <FileCheck className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-neutral-900">
                      Deliverable Formats
                    </div>
                    <div className="text-[11px] text-neutral-500">
                      DOCX, PDF & Markdown
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-xs font-semibold text-neutral-700">
                  <span>{includeMarkdownExport ? "All" : "DOCX"}</span>
                  <ChevronRight className="h-3.5 w-3.5 text-neutral-400" />
                </div>
              </div>
            </div>

            {/* Word Credit Balance Summary */}
            <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200/60 space-y-2">
              <div className="flex items-center justify-between text-xs font-medium">
                <span className="text-neutral-500">Order Cost:</span>
                <span className="text-neutral-900 font-bold">~{wordCount.toLocaleString()} Words</span>
              </div>
              <div className="flex items-center justify-between text-xs font-medium">
                <span className="text-neutral-500">Current Balance:</span>
                <span className="text-emerald-700 font-bold">
                  {organization.word_credits_remaining.toLocaleString()} Words
                </span>
              </div>
              <div className="flex items-center justify-between text-xs font-medium pt-2 border-t border-neutral-200/60">
                <span className="text-neutral-500">Remaining After:</span>
                <span className="text-neutral-900 font-bold">
                  {Math.max(0, organization.word_credits_remaining - wordCount).toLocaleString()} Words
                </span>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
