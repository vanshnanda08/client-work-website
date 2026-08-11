"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { OrdersFilterBar, OrdersFilters } from "@/components/orders/OrdersFilterBar";
import { OrdersTable } from "@/components/orders/OrdersTable";
import { OrdersPagination } from "@/components/orders/OrdersPagination";
import { useStore } from "@/lib/context/StoreContext";
import { Button } from "@/components/ui/Button";

export default function OrdersPage() {
  const { orders } = useStore();

  const [filters, setFilters] = useState<OrdersFilters>({
    search: "",
    statusTab: "all",
    contentType: "all",
    priority: "all",
    sortBy: "created_at_desc",
  });

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  // Compute status counts dynamically from live orders
  const statusCounts = useMemo(() => {
    return {
      all: orders.length,
      in_flight: orders.filter((o) =>
        ["submitted", "in_queue", "writing", "in_review", "revision_requested"].includes(o.status)
      ).length,
      delivered: orders.filter((o) => o.status === "delivered").length,
      approved: orders.filter((o) => o.status === "approved").length,
      draft: orders.filter((o) => o.status === "draft").length,
    };
  }, [orders]);

  // Filter & Sort Logic
  const filteredOrders = useMemo(() => {
    let result = [...orders];

    // Status Tab Filter
    if (filters.statusTab === "in_flight") {
      result = result.filter((o) =>
        ["submitted", "in_queue", "writing", "in_review", "revision_requested"].includes(o.status)
      );
    } else if (filters.statusTab === "delivered") {
      result = result.filter((o) => o.status === "delivered");
    } else if (filters.statusTab === "approved") {
      result = result.filter((o) => o.status === "approved");
    } else if (filters.statusTab === "draft") {
      result = result.filter((o) => o.status === "draft");
    }

    // Search Filter
    if (filters.search.trim()) {
      const q = filters.search.toLowerCase();
      result = result.filter(
        (o) =>
          o.title.toLowerCase().includes(q) ||
          o.primary_keyword?.toLowerCase().includes(q) ||
          o.id.toLowerCase().includes(q) ||
          (o.assigned_writer && o.assigned_writer.full_name.toLowerCase().includes(q))
      );
    }

    // Content Type Filter
    if (filters.contentType !== "all") {
      result = result.filter((o) => o.content_type === filters.contentType);
    }

    // Priority Filter
    if (filters.priority !== "all") {
      result = result.filter((o) => o.priority === filters.priority);
    }

    // Sorting
    if (filters.sortBy === "due_date_asc") {
      result.sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime());
    } else if (filters.sortBy === "word_count_desc") {
      result.sort((a, b) => b.word_count_target - a.word_count_target);
    } else {
      result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }

    return result;
  }, [orders, filters]);

  const totalPages = Math.ceil(filteredOrders.length / pageSize);
  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight">
            Orders
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 mt-1">
            Track writing production, review deliverables, and manage upcoming deadlines.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/orders/new">
            <Button variant="primary" size="sm" leftIcon={<Plus className="h-3.5 w-3.5" />}>
              New Order
            </Button>
          </Link>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <OrdersFilterBar
        filters={filters}
        onChange={(newFilters) => {
          setFilters(newFilters);
          setCurrentPage(1);
        }}
        statusCounts={statusCounts}
      />

      {/* Orders Table */}
      <OrdersTable orders={paginatedOrders} />

      {/* Pagination */}
      {filteredOrders.length > pageSize && (
        <OrdersPagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filteredOrders.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
        />
      )}
    </div>
  );
}
