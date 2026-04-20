"use client";

import { useState, useCallback, useEffect } from "react";
import { PRODUCTS_DATA } from "../data/dashboard.data";
import { Product } from "../types/dashboard.types";

const ODOO_URL = process.env.NEXT_PUBLIC_ODOO_URL || "http://localhost:8079";

interface CompanyStats {
  totalGanado: number;
  totalPerdido: number;
  porMes: number;
  stockCritico: number;
}

interface UseDashboardReturn {
  search: string;
  activeNav: string;
  isRefreshing: boolean;
  toastVisible: boolean;
  toastMsg: string;
  filteredProducts: Product[];
  stats: CompanyStats;
  loading: boolean;

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
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<CompanyStats>({
    totalGanado: 0,
    totalPerdido: 0,
    porMes: 0,
    stockCritico: 0,
  });

  useEffect(() => {
    async function fetchStats() {
      try {
        const companyId = window.localStorage.getItem("billnova_company_id");
        if (!companyId) {
          setLoading(false);
          return;
        }

        const res = await fetch(`${ODOO_URL}/api/company/${companyId}/stats`, {
          credentials: "include",
        });

        if (res.ok) {
          const data = await res.json();
          setStats({
            totalGanado: data.total_ganado || 0,
            totalPerdido: data.total_perdido || 0,
            porMes: data.por_mes || 0,
            stockCritico: data.stock_critico || 0,
          });
        }
      } catch (e) {
        console.error("Error fetching stats:", e);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

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
    stats,
    loading,
    setSearch,
    setActiveNav,
    showToast,
    refresh,
  };
}
