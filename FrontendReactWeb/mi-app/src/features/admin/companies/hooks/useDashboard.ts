'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { mockCompanies } from '../data/mockCompanies';
import type { Company, CompanyStats } from '../types/company.types';

interface UseDashboardReturn {
  companies: Company[];
  stats: CompanyStats;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filteredCompanies: Company[];
}

export function useDashboard(): UseDashboardReturn {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchCompanies = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      setCompanies(mockCompanies);
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Error desconocido al cargar empresas';
      setError(errorMsg);
      setCompanies([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCompanies();
  }, [fetchCompanies]);

  // Calcular estadísticas
  const stats = useMemo<CompanyStats>(() => {
    const total = companies.length;
    const active = companies.filter(c => c.status === 'Activa').length;
    const pending = companies.filter(c => c.status === 'Pendiente').length;

    return {
      totalCompanies: total,
      activeCompanies: active,
      pendingCompanies: pending,
    };
  }, [companies]);

  // Filtrar empresas por búsqueda
  const filteredCompanies = useMemo(() => {
    if (!searchQuery.trim()) return companies;

    const q = searchQuery.toLowerCase();
    return companies.filter(
      company =>
        company.name.toLowerCase().includes(q) ||
        company.contact_email?.toLowerCase().includes(q) ||
        company.ruc?.toLowerCase().includes(q)
    );
  }, [companies, searchQuery]);

  return {
    companies,
    stats,
    isLoading,
    error,
    refresh: fetchCompanies,
    searchQuery,
    setSearchQuery,
    filteredCompanies,
  };
}
