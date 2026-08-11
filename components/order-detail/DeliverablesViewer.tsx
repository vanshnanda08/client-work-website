"use client";

import React, { useState } from "react";
import {
  FileText,
  Copy,
  Check,
  Download,
  ExternalLink,
  Clock,
  Hash,
  Eye,
  FileCode,
} from "lucide-react";
import { Deliverable } from "@/lib/types";
import {
  calculateReadingTime,
  downloadTextFile,
  formatBytes,
  formatNumber,
  slugifyFilename,
} from "@/lib/utils";
import { Button } from "@/components/ui/Button";

interface DeliverablesViewerProps {
  deliverables: Deliverable[];
  orderTitle?: string;
}

export const DeliverablesViewer: React.FC<DeliverablesViewerProps> = ({
  deliverables,
  orderTitle,
}) => {
  const [selectedVersion, setSelectedVersion] = useState<number>(
    deliverables[0]?.version || 1
  );
  const [copied, setCopied] = useState(false);

  const activeDeliverable =
    deliverables.find((d) => d.version === selectedVersion) || deliverables[0];

  const handleCopyMarkdown = () => {
    if (activeDeliverable?.body_md) {
      navigator.clipboard.writeText(activeDeliverable.body_md);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    if (!activeDeliverable) return;
    const base = slugifyFilename(orderTitle || activeDeliverable.order_id);
    downloadTextFile(
      `${base}-v${activeDeliverable.version}.md`,
      activeDeliverable.body_md
    );
  };

  if (!deliverables || deliverables.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-neutral-200/80 p-12 text-center shadow-2xs">
        <div className="h-12 w-12 rounded-2xl bg-neutral-100 text-neutral-400 flex items-center justify-center mx-auto mb-3">
          <Clock className="h-6 w-6" />
        </div>
        <h3 className="text-base font-bold text-neutral-900">Draft In Production</h3>
        <p className="text-xs text-neutral-500 max-w-sm mx-auto mt-1">
          Your writer is actively working on this deliverable. Once the agency QA review completes, the initial draft will appear here for your review.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Deliverable Top Action Bar */}
      <div className="bg-white rounded-2xl border border-neutral-200/80 p-4 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Version Switcher Pills */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-neutral-500 mr-1">Version:</span>
          <div className="flex items-center gap-1.5 p-1 bg-neutral-100 rounded-xl">
            {deliverables.map((del) => {
              const isSelected = del.version === selectedVersion;
              return (
                <button
                  key={del.id}
                  onClick={() => setSelectedVersion(del.version)}
                  className={`px-3 py-1 text-xs font-bold rounded-lg transition ${
                    isSelected
                      ? "bg-white text-neutral-900 shadow-xs"
                      : "text-neutral-500 hover:text-neutral-900"
                  }`}
                >
                  v{del.version} {del.version === deliverables[0].version ? "(Latest)" : ""}
                </button>
              );
            })}
          </div>
        </div>

        {/* Word Count & Read Time Meta */}
        <div className="flex items-center gap-4 text-xs text-neutral-500">
          <div className="flex items-center gap-1.5">
            <Hash className="h-3.5 w-3.5 text-neutral-400" />
            <span>
              <strong className="text-neutral-900 font-bold">
                {formatNumber(activeDeliverable.word_count)}
              </strong>{" "}
              words
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-neutral-400" />
            <span>{calculateReadingTime(activeDeliverable.word_count)}</span>
          </div>

          {/* Copy Button */}
          <Button
            size="sm"
            variant="outline"
            onClick={handleCopyMarkdown}
            leftIcon={copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
          >
            {copied ? "Copied!" : "Copy Text"}
          </Button>
        </div>
      </div>

      {/* File Download Attachments Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="bg-white rounded-xl border border-neutral-200/80 p-3.5 shadow-2xs flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-9 w-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <FileText className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-neutral-900 truncate">
                {slugifyFilename(orderTitle || activeDeliverable.order_id)}-v
                {activeDeliverable.version}.md
              </div>
              <div className="text-[11px] text-neutral-500">
                Markdown Document • {formatBytes(new Blob([activeDeliverable.body_md]).size)}
              </div>
            </div>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={handleDownload}
            leftIcon={<Download className="h-3.5 w-3.5" />}
          >
            Download
          </Button>
        </div>

        {activeDeliverable.google_doc_url && (
          <div className="bg-white rounded-xl border border-neutral-200/80 p-3.5 shadow-2xs flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <div className="h-9 w-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <ExternalLink className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-neutral-900 truncate">
                  Live Google Docs Workspace
                </div>
                <div className="text-[11px] text-neutral-500">
                  Comment & suggest in real time
                </div>
              </div>
            </div>
            <a
              href={activeDeliverable.google_doc_url}
              target="_blank"
              rel="noreferrer"
            >
              <Button size="sm" variant="outline" rightIcon={<ExternalLink className="h-3.5 w-3.5" />}>
                Open
              </Button>
            </a>
          </div>
        )}
      </div>

      {/* Main Formatted Markdown Content Viewer */}
      <div className="bg-white rounded-2xl border border-neutral-200/80 p-6 sm:p-10 shadow-2xs">
        <article className="prose prose-neutral max-w-none text-neutral-800 space-y-5 text-sm sm:text-base leading-relaxed">
          {/* Simple Clean Markdown Renderer */}
          {activeDeliverable.body_md.split("\n\n").map((block, i) => {
            if (block.startsWith("# ")) {
              return (
                <h1 key={i} className="text-xl sm:text-2xl font-extrabold text-neutral-900 tracking-tight pb-2 border-b border-neutral-100">
                  {block.replace("# ", "")}
                </h1>
              );
            }
            if (block.startsWith("## ")) {
              return (
                <h2 key={i} className="text-lg sm:text-xl font-bold text-neutral-900 pt-3">
                  {block.replace("## ", "")}
                </h2>
              );
            }
            if (block.startsWith("### ")) {
              return (
                <h3 key={i} className="text-base font-bold text-neutral-900 pt-2">
                  {block.replace("### ", "")}
                </h3>
              );
            }
            if (block.startsWith("> ")) {
              return (
                <blockquote key={i} className="p-4 rounded-xl bg-neutral-50 border-l-4 border-neutral-900 text-neutral-700 italic text-sm">
                  {block.replace("> ", "")}
                </blockquote>
              );
            }
            if (block.startsWith("```")) {
              const codeText = block.replace(/```[a-z]*/g, "").trim();
              return (
                <pre key={i} className="p-4 rounded-xl bg-neutral-900 text-neutral-100 font-mono text-xs overflow-x-auto">
                  {codeText}
                </pre>
              );
            }
            if (block.startsWith("- ")) {
              const items = block.split("\n").map((item) => item.replace("- ", ""));
              return (
                <ul key={i} className="list-disc pl-5 space-y-1 text-sm text-neutral-700">
                  {items.map((item, idx) => (
                    <li key={idx} dangerouslySetInnerHTML={{ __html: item.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                  ))}
                </ul>
              );
            }
            if (block.startsWith("|")) {
              const rows = block.split("\n").filter((r) => !r.includes("---"));
              const header = rows[0]?.split("|").filter(Boolean).map((s) => s.trim());
              const bodyRows = rows.slice(1);

              return (
                <div key={i} className="overflow-x-auto my-4">
                  <table className="w-full text-xs border border-neutral-200 rounded-xl overflow-hidden">
                    <thead className="bg-neutral-100 text-neutral-700 font-bold">
                      <tr>
                        {header?.map((h, hIdx) => (
                          <th key={hIdx} className="p-2.5 text-left border-b border-neutral-200">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100">
                      {bodyRows.map((r, rIdx) => {
                        const cols = r.split("|").filter(Boolean).map((s) => s.trim());
                        return (
                          <tr key={rIdx} className="hover:bg-neutral-50">
                            {cols.map((c, cIdx) => (
                              <td key={cIdx} className="p-2.5 text-neutral-800" dangerouslySetInnerHTML={{ __html: c.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                            ))}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              );
            }
            return (
              <p
                key={i}
                className="text-neutral-700 leading-relaxed text-sm"
                dangerouslySetInnerHTML={{
                  __html: block
                    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
                    .replace(/\*(.*?)\*/g, "<em>$1</em>"),
                }}
              />
            );
          })}
        </article>
      </div>
    </div>
  );
};
