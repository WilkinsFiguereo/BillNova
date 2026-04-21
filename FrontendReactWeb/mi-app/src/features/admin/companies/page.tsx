'use client';

import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { colors, font } from '../users/theme/tokens';
import { AdminSidebar } from '../dashboard/ui/AdminSidebar';
import { ADMIN_NAV_ITEMS } from '../dashboard/data/adminNavigation.data';
import { useDashboard } from './hooks/useDashboard';
import { FilterBar } from './ui/FilterBar';
import { StatsSection } from './sections/StatsSection';
import { ListaEmpresasSection } from './sections/ListaEmpresasSection';
import { GraficasSection } from './sections/GraficasSection';
import { TopEmpresasSection } from './sections/TopEmpresasSection';
import { CompanyDetailSidebar } from './ui/CompanyDetailSidebar';
import type { Company } from './types/company.types';

export default function CompaniesPage() {
  const {
    companies,
    filteredCompanies,
    stats,
    isLoading,
    error,
    setSearchQuery,
    updateCompany,
  } = useDashboard();
  const [searchInput, setSearchInput] = useState('');
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [sidebarError, setSidebarError] = useState<string | null>(null);
  const [isSavingCompany, setIsSavingCompany] = useState(false);

  const handleSearch = (query: string) => {
    setSearchInput(query);
    setSearchQuery(query);
  };

  const handleSaveCompany = async (updates: Partial<Company>) => {
    if (!selectedCompany) return;

    setIsSavingCompany(true);
    setSidebarError(null);
    try {
      const nextCompany = await updateCompany(selectedCompany.id, updates);
      setSelectedCompany(nextCompany);
    } catch (err) {
      setSidebarError(err instanceof Error ? err.message : 'No se pudo guardar la empresa');
    } finally {
      setIsSavingCompany(false);
    }
  };

  const handleToggleCompanyStatus = async () => {
    if (!selectedCompany) return;

    const nextStatus = selectedCompany.status === 'Activa' ? 'Inactiva' : 'Activa';
    await handleSaveCompany({ status: nextStatus });
  };

  return (
    <div
      style={{
        display: 'flex',
        minHeight: '100vh',
        background: colors.bg.primary,
        fontFamily: font.family,
        color: colors.text.primary,
      }}
    >
      <AdminSidebar navItems={ADMIN_NAV_ITEMS} />

      <main
        style={{
          flex: 1,
          overflow: 'auto',
          padding: '32px 36px',
          marginRight: selectedCompany ? 440 : 0,
          transition: 'margin-right 0.24s ease',
        }}
      >
        <div style={{ maxWidth: 1120, margin: '0 auto' }}>
          {/* Header */}
          <div style={{ marginBottom: '32px' }}>
            <h1 style={{ fontSize: font.sizes['2xl'], fontWeight: font.weights.bold, marginBottom: 8 }}>
              Manage Empresas
            </h1>
            <p style={{ fontSize: font.sizes.base, color: colors.text.secondary }}>
              Gestiona todas las empresas registradas en el sistema
            </p>
          </div>

          {/* Search and Create Button */}
          <div
            style={{
              display: 'flex',
              gap: '16px',
              marginBottom: '32px',
              alignItems: 'center',
              flexWrap: 'wrap',
            }}
          >
            <div style={{ flex: 1, minWidth: 200 }}>
              <FilterBar searchQuery={searchInput} onSearchChange={handleSearch} placeholder="Buscar empresas..." />
            </div>
            <button
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '11px 16px',
                background: colors.accent,
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                fontSize: font.sizes.base,
                fontWeight: font.weights.semibold,
                cursor: 'pointer',
              }}
              onClick={() => {
                // TODO: Implement create company modal
                alert('Crear empresa: Feature en desarrollo');
              }}
            >
              <Plus size={16} />
              Nueva Empresa
            </button>
          </div>

          {/* Stats Section */}
          <div style={{ marginBottom: '32px' }}>
            <StatsSection stats={stats} />
          </div>

          {/* Charts Section */}
          <div style={{ marginBottom: '32px' }}>
            <GraficasSection companies={filteredCompanies} />
          </div>

          {/* Top Companies Section */}
          <div style={{ marginBottom: '32px' }}>
            <TopEmpresasSection companies={companies} />
          </div>

          {/* Companies List Section */}
          <div style={{ marginBottom: '32px' }}>
            <h2 style={{ fontSize: font.sizes.lg, fontWeight: font.weights.semibold, marginBottom: 16 }}>
              Listado de Empresas
            </h2>
            <ListaEmpresasSection
              companies={filteredCompanies}
              isLoading={isLoading}
              error={error}
              onViewDetails={(company) => {
                setSidebarError(null);
                setSelectedCompany(company);
              }}
            />
          </div>
        </div>
      </main>

      <CompanyDetailSidebar
        company={selectedCompany}
        isOpen={Boolean(selectedCompany)}
        isSaving={isSavingCompany}
        error={sidebarError}
        onClose={() => {
          setSidebarError(null);
          setSelectedCompany(null);
        }}
        onSave={handleSaveCompany}
        onToggleStatus={handleToggleCompanyStatus}
      />
    </div>
  );
}
