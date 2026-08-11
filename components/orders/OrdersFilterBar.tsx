"use client";

import React from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { ContentType, OrderStatus, Priority } from "@/lib/types";
import { CONTENT_TYPES } from "@/lib/config";

export interface OrdersFilters {
  search: string;
  statusTab: string; // "all" | "in_flight" | "delivered" | "approved" | "draft"
  contentType: string;
  priority: string;
  sortBy: "due_date_asc" | "created_at_desc" | "word_count_desc";
}

interface OrdersFilterBarProps {
  filters: OrdersFilters;
  onChange: (filters: OrdersFilters) => void;
  statusCounts: {
    all: number;
    in_flight: number;
    delivered: number;
    approved: number;
    draft: number;
  };
}

export const OrdersFilterBar: React.FC<OrdersFilterBarProps> = ({
  filters,
  onChange,
  statusCounts,
}) => {
  const tabs = [
    { id: "all", label: "All Orders", count: statusCounts.all },
    { id: "in_flight", label: "In Pipeline", count: statusCounts.in_flight },
    { id: "delivered", label: "Ready for Review", count: statusCounts.delivered },
    { id: "approved", label: "Completed", count: statusCounts.approved },
    { id: "draft", label: "Drafts", count: statusCounts.draft },
  ];

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ ...filters, search: e.target.value });
  };

  const handleTabChange = (tabId: string) => {
    onChange({ ...filters, statusTab: tabId });
  };

  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange({ ...filters, contentType: e.target.value });
  };

  const handlePriorityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange({ ...filters, priority: e.target.value });
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange({
      ...filters,
      sortBy: e.target.value as OrdersFilters["sortBy"],
    });
  };

  const clearFilters = () => {
    onChange({
      search: "",
      statusTab: "all",
      contentType: "all",
      priority: "all",
      sortBy: "created_at_desc",
    });
  };

  const hasActiveFilters =
    filters.search !== "" ||
    filters.contentType !== "all" ||
    filters.priority !== "all" ||
    filters.statusTab !== "all";

  return (
    <div className="space-y-4">
      {/* Top Status Tabs */}
      <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1 scrollbar-none">
        <div className="flex items-center gap-1.5 p-1 bg-neutral-100 rounded-xl">
          {tabs.map((tab) => {
            const isActive = filters.statusTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg transition whitespace-nowrap ${
                  isActive
                    ? "bg-white text-neutral-900 shadow-xs font-bold"
                    : "text-neutral-600 hover:text-neutral-900 hover:bg-neutral-200/50"
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    isActive
                      ? "bg-neutral-900 text-white"
                      : "bg-neutral-200 text-neutral-700"
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="text-xs font-medium text-neutral-500 hover:text-neutral-900 flex items-center gap-1 shrink-0 px-2 py-1"
          >
            <X className="h-3 w-3" />
            Reset filters
          </button>
        )}
      </div>

      {/* Search & Select Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
          <input
            type="text"
            value={filters.search}
            onChange={handleSearchChange}
            placeholder="Search by title, keyword, or writer..."
            className="w-full h-10 pl-10 pr-4 bg-white text-neutral-900 text-xs sm:text-sm rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-900 transition"
          />
          {filters.search && (
            <button
              onClick={() => onChange({ ...filters, search: "" })}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Content Type Filter */}
        <div className="flex items-center gap-2">
          <select
            value={filters.contentType}
            onChange={handleTypeChange}
            className="h-10 px-3 bg-white text-neutral-700 text-xs rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-900 cursor-pointer font-medium"
          >
            <option value="all">All Content Types</option>
            {Object.entries(CONTENT_TYPES).map(([key, val]) => (
              <option key={key} value={key}>
                {val.label}
              </option>
            ))}
          </select>

          {/* Priority Filter */}
          <select
            value={filters.priority}
            onChange={handlePriorityChange}
            className="h-10 px-3 bg-white text-neutral-700 text-xs rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-900 cursor-pointer font-medium"
          >
            <option value="all">All Priorities</option>
            <option value="standard">Standard</option>
            <option value="high">High</option>
            <option value="urgent">Urgent Rush</option>
          </select>

          {/* Sort Selector */}
          <select
            value={filters.sortBy}
            onChange={handleSortChange}
            className="h-10 px-3 bg-white text-neutral-700 text-xs rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-900 cursor-pointer font-medium"
          >
            <option value="created_at_desc">Newest First</option>
            <option value="due_date_asc">Due Date (Earliest)</option>
            <option value="word_count_desc">Word Count (Highest)</option>
          </select>
        </div>
      </div>
    </div>
  );
};
