"use client";
// src/feature/orders/hooks/useOrderFilters.ts

import { useState, useMemo } from "react";
import { Order, OrderStatus } from "../types/order.types";

type FilterKey = "all" | OrderStatus;

interface FilterCounts {
  all:       number;
  pending:   number;
  sent:      number;
  delivered: number;
  cancelled: number;
}

export function useOrderFilters(orders: Order[]) {
  const safeOrders = Array.isArray(orders) ? orders : [];

  const [filter, setFilter] = useState<FilterKey>("all");
  const [search, setSearch] = useState<string>("");

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();

    return safeOrders.filter((o) => {
      const matchStatus = filter === "all" || o.status === filter;
      const matchSearch =
        !q ||
        o.id.toLowerCase().includes(q) ||
        o.client.toLowerCase().includes(q) ||
        o.product.toLowerCase().includes(q);

      return matchStatus && matchSearch;
    });
  }, [safeOrders, filter, search]);

  const counts = useMemo<FilterCounts>(() => ({
    all: safeOrders.length,
    pending: safeOrders.filter((o) => o.status === "pending").length,
    sent: safeOrders.filter((o) => o.status === "sent").length,
    delivered: safeOrders.filter((o) => o.status === "delivered").length,
    cancelled: safeOrders.filter((o) => o.status === "cancelled").length,
  }), [safeOrders]);

  return { filter, setFilter, search, setSearch, filtered, counts };
}