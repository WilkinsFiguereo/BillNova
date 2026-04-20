"use client";

import { useState, useCallback } from "react";
import { PRODUCTS_DATA } from "../data/dashboard.data";
import { Product } from "../types/dashboard.types";

interface UseDashboardReturn {
  // State
  search: string;
  activeNav: string;
  isRefreshing: boolean;
  toastVisible: boolean;
  toastMsg: string;
  filteredProducts: Product[];

  // Actions
  setSearch: (value: string) => void;
  setActiveNav: (id: string) => void;
  showToast: (msg: string) => void;
  refresh: () => void;
}

export function useDashboard(): UseDashboardReturn {
  const [search, setSearch] = useState("");
  const [activeNav, setActiveNav] = useState("dashboard");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMsg, setToastMsg] = useState("");

  const filteredProducts = PRODUCTS_DATA.filter((p) => {
    const q = search.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      p.id.toLowerCase().includes(q) ||
      p.invoice.toLowerCase().includes(q)
    );
  });

  const showToast = useCallback((msg: string) => {
    setToastMsg(msg);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 3000);
  }, []);

  const refresh = useCallback(() => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 800);
    showToast("🔄 Dashboard actualizado");
  }, [isRefreshing, showToast]);

  return {
    search,
    activeNav,
    isRefreshing,
    toastVisible,
    toastMsg,
    filteredProducts,
    setSearch,
    setActiveNav,
    showToast,
    refresh,
  };
}
