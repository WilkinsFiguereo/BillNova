"use client";

import { useState, useEffect, useCallback } from 'react';
import { DashboardData } from '../types/dashboard.types';
import { dashboardMock } from '../data/dashboard.mock';

interface UseDashboardReturn {
  data: DashboardData;
  isLoading: boolean;
  isRefreshing: boolean;
  periodo: '7d' | '30d' | '1y';
  setPeriodo: (p: '7d' | '30d' | '1y') => void;
  ahora: string;
  refresh: () => void;
}

function formatAhora() {
  return new Date().toLocaleString('es-DO', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function useDashboard(): UseDashboardReturn {
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [periodo, setPeriodo] = useState<'7d' | '30d' | '1y'>('7d');
  const [ahora, setAhora] = useState(() => formatAhora());

  useEffect(() => {
    const t = setTimeout(() => setIsLoading(false), 600);
    return () => clearTimeout(t);
  }, []);

  const refresh = useCallback(() => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    setTimeout(() => {
      setAhora(formatAhora());
      setIsRefreshing(false);
    }, 800);
  }, [isRefreshing]);

  return { data: dashboardMock, isLoading, isRefreshing, periodo, setPeriodo, ahora, refresh };
}
