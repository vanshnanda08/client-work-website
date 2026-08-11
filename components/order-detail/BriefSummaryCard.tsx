"use client";

import React, { useState } from "react";
import { ChevronDown, ChevronUp, FileText, Search, ExternalLink, User, Calendar, Zap } from "lucide-react";
import { Order } from "@/lib/types";
import { CONTENT_TYPES } from "@/lib/config";
import { formatNumber } from "@/lib/utils";

interface BriefSummaryCardProps {
  order: Order;
}

export const BriefSummaryCard: React.FC<BriefSummaryCardProps> = ({ order }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const typeConfig = CONTENT_TYPES[order.content_type] || CONTENT_TYPES.other;

  return (
    <div className="bg-white rounded-2xl border border-neutral-200/80 p-5 shadow-2xs space-y-3">
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between cursor-pointer select-none"
      >
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-lg bg-neutral-100 text-neutral-600 flex items-center justify-center">
            <FileText className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-neutral-900">Original Order Brief & Specs</h3>
            <p className="text-[11px] text-neutral-500">
              {typeConfig.label} • {formatNumber(order.word_count_target)} words
            </p>
          </div>
        </div>

        <button className="p-1 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition">
          {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
      </div>

      {/* Brief Preview */}
      <p className={`text-xs text-neutral-600 leading-relaxed ${isExpanded ? "" : "line-clamp-2"}`}>
        {order.brief}
      </p>

      {/* Expanded Spec Details */}
      {isExpanded && (
        <div className="pt-3 border-t border-neutral-100 space-y-3 text-xs">
          {/* Target Keywords */}
          {order.primary_keyword && (
            <div>
              <span className="font-bold text-neutral-700 block mb-1">Primary Keyword:</span>
              <span className="inline-block px-2.5 py-1 bg-neutral-100 text-neutral-800 rounded-md font-medium">
                {order.primary_keyword}
              </span>
            </div>
          )}

          {order.secondary_keywords && order.secondary_keywords.length > 0 && (
            <div>
              <span className="font-bold text-neutral-700 block mb-1">Secondary Keywords:</span>
              <div className="flex flex-wrap gap-1.5">
                {order.secondary_keywords.map((kw, i) => (
                  <span key={i} className="px-2 py-0.5 bg-neutral-100 text-neutral-700 rounded-md text-[11px]">
                    {kw}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Tone & Audience */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
            <div>
              <span className="font-bold text-neutral-700 block">Tone:</span>
              <span className="text-neutral-600">{order.tone}</span>
            </div>
            {order.target_audience && (
              <div>
                <span className="font-bold text-neutral-700 block">Target Audience:</span>
                <span className="text-neutral-600">{order.target_audience}</span>
              </div>
            )}
          </div>

          {/* Reference URLs */}
          {order.reference_urls && order.reference_urls.length > 0 && (
            <div className="pt-2">
              <span className="font-bold text-neutral-700 block mb-1">References:</span>
              <div className="space-y-1">
                {order.reference_urls.map((url, i) => (
                  <a
                    key={i}
                    href={url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-neutral-600 hover:text-neutral-900 hover:underline flex items-center gap-1 truncate text-[11px]"
                  >
                    <ExternalLink className="h-3 w-3 shrink-0" />
                    {url}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
