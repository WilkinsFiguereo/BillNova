'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
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

type CompanyApi = {
  id: number;
  active?: boolean;
  name: string;
  ruc?: string | null;
  sector?: string | null;
  website?: string | null;
  company_size?: string | null;
  contact_name?: string | null;
  contact_email?: string | null;
  contact_phone?: string | null;
  city?: string | null;
  state?: string | null;
  address?: string | null;
  created_at?: string | null;
};

function mapCompany(company: CompanyApi): Company {
  const sizeToPlan = {
    micro: 'Starter',
    small: 'Business',
    medium: 'Premium',
    large: 'Premium',
  } as const;

  return {
    id: company.id,
    active: company.active ?? true,
    name: company.name,
    ruc: company.ruc || undefined,
    sector: company.sector || undefined,
    website: company.website || undefined,
    contact_name: company.contact_name || undefined,
    contact_email: company.contact_email || undefined,
    contact_phone: company.contact_phone || undefined,
    city: company.city || undefined,
    state: company.state || undefined,
    address: company.address || undefined,
    status: company.active === false ? 'Inactiva' : company.contact_email ? 'Activa' : 'Pendiente',
    plan: sizeToPlan[(company.company_size || 'micro') as keyof typeof sizeToPlan] || 'Starter',
    revenue: company.id * 1250,
    createdAt: company.created_at || undefined,
  };
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

      const response = await fetch(`/api/companies`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        cache: 'no-store',
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      const data = (await response.json()) as { data?: CompanyApi[]; companies?: CompanyApi[] };
      const companiesList = (data.data || data.companies || []).map(mapCompany);
      setCompanies(companiesList);
    } catch (err: unknown) {
      console.error('[Dashboard] Error fetching companies:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido al cargar empresas');
      setCompanies([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCompanies();
  }, [fetchCompanies]);

  const stats = useMemo<CompanyStats>(() => {
    const total = companies.length;
    const active = companies.filter((c) => c.status === 'Activa').length;
    const pending = companies.filter((c) => c.status === 'Pendiente').length;

    return {
      totalCompanies: total,
      activeCompanies: active,
      pendingCompanies: pending,
    };
  }, [companies]);

  const filteredCompanies = useMemo(() => {
    if (!searchQuery.trim()) return companies;

    const q = searchQuery.toLowerCase();
    return companies.filter(
      (company) =>
        company.name.toLowerCase().includes(q) ||
        company.contact_email?.toLowerCase().includes(q) ||
        company.ruc?.toLowerCase().includes(q),
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
