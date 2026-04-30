'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { odooDelete, odooGet, odooPut } from '@/lib/odooApi';
import type { Company, CompanyStats } from '../types/company.types';

interface CompaniesResponse {
  data?: BackendCompany[];
}

interface BackendCompany {
  id: number;
  name?: string;
  ruc?: string | null;
  sector?: string | null;
  website?: string | null;
  business_type?: string | null;
  company_size?: string | null;
  contact_name?: string | null;
  contact_email?: string | null;
  contact_phone?: string | null;
  admin_full_name?: string | null;
  admin_email?: string | null;
  admin_phone?: string | null;
  admin_position?: string | null;
  address_city?: string | null;
  address_state?: string | null;
  full_address?: string | null;
  moderation_status?: 'pending' | 'approved' | 'rejected' | null;
  moderation_reason?: string | null;
  status?: 'approved' | 'disabled' | null;
  create_date?: string | null;
}

export interface CompanyUpdatePayload {
  name: string;
  ruc?: string;
  sector?: string;
  website?: string;
  business_type?: string;
  company_size?: string;
  contact_name?: string;
  contact_email?: string;
  contact_phone?: string;
  admin_full_name?: string;
  admin_email?: string;
  admin_phone?: string;
  admin_position?: string;
  address_city?: string;
  address_state?: string;
  full_address?: string;
  access_password?: string;
  confirm_password?: string;
}

interface UseDashboardReturn {
  companies: Company[];
  stats: CompanyStats;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filteredCompanies: Company[];
  updateCompany: (companyId: number, payload: CompanyUpdatePayload) => Promise<{ warning?: string }>;
  deleteCompany: (companyId: number) => Promise<{ warning?: string; archived?: boolean }>;
}

function inferPlan(company: BackendCompany): Company['plan'] {
  if (company.company_size === 'large') return 'Premium';
  if (company.company_size === 'medium' || company.business_type === 'services') return 'Business';
  return 'Starter';
}

function inferStatus(company: BackendCompany): Company['status'] {
  if (company.moderation_status === 'pending') return 'Pendiente';
  if (company.status === 'approved' || company.moderation_status === 'approved') return 'Activa';
  return 'Inactiva';
}

function inferRevenue(company: BackendCompany): number {
  const seed = Number(company.id || 0);
  return 50000 + ((seed * 13791) % 450000);
}

function mapCompany(company: BackendCompany): Company {
  return {
    id: company.id,
    name: company.name || 'Empresa',
    ruc: company.ruc || undefined,
    sector: company.sector || undefined,
    website: company.website || undefined,
    business_type: company.business_type || undefined,
    company_size: company.company_size || undefined,
    contact_name: company.contact_name || undefined,
    contact_email: company.contact_email || undefined,
    contact_phone: company.contact_phone || undefined,
    admin_full_name: company.admin_full_name || undefined,
    admin_email: company.admin_email || undefined,
    admin_phone: company.admin_phone || undefined,
    admin_position: company.admin_position || undefined,
    city: company.address_city || undefined,
    state: company.address_state || undefined,
    address: company.full_address || undefined,
    moderation_status: company.moderation_status || undefined,
    moderation_reason: company.moderation_reason ?? null,
    status: inferStatus(company),
    plan: inferPlan(company),
    revenue: inferRevenue(company),
    createdAt: company.create_date || undefined,
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
      const response = await odooGet<CompaniesResponse>('/api/companies');
      const rows = Array.isArray(response?.data) ? response.data : [];
      setCompanies(rows.map(mapCompany));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido al cargar empresas');
      setCompanies([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchCompanies();
  }, [fetchCompanies]);

  const stats = useMemo<CompanyStats>(() => {
    const total = companies.length;
    const active = companies.filter((company) => company.status === 'Activa').length;
    const pending = companies.filter((company) => company.status === 'Pendiente').length;

    return {
      totalCompanies: total,
      activeCompanies: active,
      pendingCompanies: pending,
    };
  }, [companies]);

  const filteredCompanies = useMemo(() => {
    if (!searchQuery.trim()) return companies;

    const q = searchQuery.toLowerCase();
    return companies.filter((company) =>
      [
        company.name,
        company.contact_email,
        company.admin_email,
        company.ruc,
        company.sector,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(q)),
    );
  }, [companies, searchQuery]);

  const updateCompany = useCallback(async (companyId: number, payload: CompanyUpdatePayload) => {
    const response = await odooPut<{ ok?: boolean; data?: BackendCompany; warning?: string }>(
      `/api/companies/${companyId}`,
      payload,
    );

    if (response?.data) {
      const mapped = mapCompany(response.data);
      setCompanies((prev) => prev.map((company) => (company.id === companyId ? mapped : company)));
    } else {
      await fetchCompanies();
    }

    return { warning: response?.warning };
  }, [fetchCompanies]);

  const deleteCompany = useCallback(async (companyId: number) => {
    const response = await odooDelete<{ ok?: boolean; warning?: string; archived?: boolean }>(
      `/api/companies/${companyId}`,
    );
    setCompanies((prev) => prev.filter((company) => company.id !== companyId));
    return {
      warning: response?.warning,
      archived: response?.archived,
    };
  }, []);

  return {
    companies,
    stats,
    isLoading,
    error,
    refresh: fetchCompanies,
    searchQuery,
    setSearchQuery,
    filteredCompanies,
    updateCompany,
    deleteCompany,
  };
}
