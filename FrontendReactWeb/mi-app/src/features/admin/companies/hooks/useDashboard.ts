'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { mockCompanies } from '../data/mockCompanies';
import type { Company, CompanyStats, CompaniesData } from '../types/company.types';

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

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === 'true';

export function useDashboard(): UseDashboardReturn {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchCompanies = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Si estamos usando datos mock, retornar de inmediato
      if (USE_MOCK) {
        console.log('[Dashboard] Using mock data (NEXT_PUBLIC_USE_MOCK=true)');
        setCompanies(mockCompanies);
        setIsLoading(false);
        return;
      }

      const response = await fetch(`/api/companies`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      console.log('[Dashboard] Companies API response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[Dashboard] Backend error response:', errorText);
        
        try {
          const errorData = JSON.parse(errorText);
          const message = errorData.error || errorData.message || `HTTP ${response.status}`;
          const details = errorData.details ? ` - ${errorData.details}` : '';
          setError(`${message}${details}`);
        } catch {
          setError(`HTTP ${response.status}: ${errorText}`);
        }
        
        console.log('[Dashboard] Using mock data as fallback');
        setCompanies(mockCompanies);
        setIsLoading(false);
        return;
      }

      const data = await response.json();
      let companiesList: Company[] = data.data || data.companies || [];

      if (companiesList.length === 0) {
        console.warn('[Dashboard] No companies found in response, using mock data');
        setCompanies(mockCompanies);
      } else {
        // Enriquecer datos con status y plan aleatorios
        companiesList = companiesList.map((company: any, index: number) => ({
          ...company,
          status: index % 3 === 0 ? 'Pendiente' : index % 2 === 0 ? 'Activa' : 'Activa',
          plan: ['Starter', 'Business', 'Premium'][index % 3] as any,
          revenue: Math.floor(Math.random() * 500000) + 50000,
          createdAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
        }));

        setCompanies(companiesList);
      }
    } catch (err: unknown) {
      console.error('[Dashboard] Error fetching companies:', err);
      const errorMsg = err instanceof Error ? err.message : 'Error desconocido al cargar empresas';
      setError(errorMsg);
      console.log('[Dashboard] Using mock data as fallback (error)');
      setCompanies(mockCompanies);
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
