'use client';

import React, { useMemo, useState } from 'react';
import { Plus, X } from 'lucide-react';
import { colors, font } from '../users/theme/tokens';
import { AdminSidebar } from '../dashboard/ui/AdminSidebar';
import { ADMIN_NAV_ITEMS } from '../dashboard/data/adminNavigation.data';
import { useDashboard } from './hooks/useDashboard';
import { FilterBar } from './ui/FilterBar';
import { StatsSection } from './sections/StatsSection';
import { ListaEmpresasSection } from './sections/ListaEmpresasSection';
import { GraficasSection } from './sections/GraficasSection';
import { TopEmpresasSection } from './sections/TopEmpresasSection';
import type { Company } from './types/company.types';

type CompanyFormState = {
  company_name: string;
  ruc: string;
  sector: string;
  company_size: string;
  contact_name: string;
  contact_email: string;
  contact_phone: string;
  city: string;
  state: string;
  address: string;
  website: string;
  password: string;
};

const emptyCompanyForm: CompanyFormState = {
  company_name: '',
  ruc: '',
  sector: '',
  company_size: 'micro',
  contact_name: '',
  contact_email: '',
  contact_phone: '',
  city: '',
  state: '',
  address: '',
  website: '',
  password: '',
};

const companyFields: Array<{ key: keyof CompanyFormState; label: string }> = [
  { key: 'company_name', label: 'Nombre empresa' },
  { key: 'ruc', label: 'RUC' },
  { key: 'sector', label: 'Sector' },
  { key: 'contact_name', label: 'Contacto' },
  { key: 'contact_email', label: 'Email contacto' },
  { key: 'contact_phone', label: 'Telefono contacto' },
  { key: 'city', label: 'Ciudad' },
  { key: 'state', label: 'Estado' },
  { key: 'address', label: 'Direccion' },
  { key: 'website', label: 'Sitio web' },
  { key: 'password', label: 'Clave de acceso' },
];

function mapCompanyToForm(company: Company): CompanyFormState {
  const planToSize = {
    Starter: 'micro',
    Business: 'small',
    Premium: 'medium',
  } as const;

  return {
    company_name: company.name ?? '',
    ruc: company.ruc ?? '',
    sector: company.sector ?? '',
    company_size: planToSize[company.plan] ?? 'micro',
    contact_name: company.contact_name ?? '',
    contact_email: company.contact_email ?? '',
    contact_phone: company.contact_phone ?? '',
    city: company.city ?? '',
    state: company.state ?? '',
    address: company.address ?? '',
    website: company.website ?? '',
    password: '',
  };
}

type CompanyFormModalProps = {
  mode: 'create' | 'edit';
  open: boolean;
  companyForm: CompanyFormState;
  isSubmitting: boolean;
  error: string | null;
  onClose: () => void;
  onChange: (key: keyof CompanyFormState, value: string) => void;
  onSubmit: () => void;
};

function CompanyFormModal({
  mode,
  open,
  companyForm,
  isSubmitting,
  error,
  onClose,
  onChange,
  onSubmit,
}: CompanyFormModalProps) {
  if (!open) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(15,23,42,0.45)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        zIndex: 70,
      }}
    >
      <div
        onClick={(event) => event.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: 760,
          background: colors.bg.secondary,
          borderRadius: 16,
          border: `1px solid ${colors.border}`,
          padding: 24,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div>
            <h3 style={{ margin: 0, fontSize: 20 }}>
              {mode === 'create' ? 'Crear empresa' : 'Editar empresa'}
            </h3>
            <p style={{ margin: '6px 0 0', color: colors.text.secondary }}>
              {mode === 'create' ? 'Registra una nueva empresa en Odoo.' : 'Actualiza los datos de la empresa en Odoo.'}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: colors.text.secondary }}
          >
            <X size={20} />
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 12 }}>
          {companyFields.map(({ key, label }) => (
            <input
              key={key}
              value={companyForm[key]}
              onChange={(event) => onChange(key, event.target.value)}
              placeholder={label}
              style={{
                padding: '12px 14px',
                borderRadius: 10,
                border: `1px solid ${colors.border}`,
                background: colors.bg.primary,
                color: colors.text.primary,
                fontSize: 14,
              }}
            />
          ))}

          <select
            value={companyForm.company_size}
            onChange={(event) => onChange('company_size', event.target.value)}
            style={{
              padding: '12px 14px',
              borderRadius: 10,
              border: `1px solid ${colors.border}`,
              background: colors.bg.primary,
              color: colors.text.primary,
              fontSize: 14,
            }}
          >
            <option value="micro">Micro</option>
            <option value="small">Pequena</option>
            <option value="medium">Mediana</option>
            <option value="large">Grande</option>
          </select>
        </div>

        {error && (
          <div
            style={{
              marginTop: 14,
              padding: '12px 14px',
              borderRadius: 10,
              background: `${colors.error}18`,
              color: colors.error,
              border: `1px solid ${colors.error}55`,
              fontSize: 13,
            }}
          >
            {error}
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 18 }}>
          <button
            onClick={onClose}
            style={{
              padding: '10px 14px',
              borderRadius: 10,
              border: `1px solid ${colors.border}`,
              background: 'transparent',
              color: colors.text.secondary,
              cursor: 'pointer',
            }}
          >
            Cancelar
          </button>
          <button
            onClick={onSubmit}
            disabled={isSubmitting}
            style={{
              padding: '10px 14px',
              borderRadius: 10,
              border: 'none',
              background: colors.accent,
              color: 'white',
              cursor: isSubmitting ? 'wait' : 'pointer',
              opacity: isSubmitting ? 0.7 : 1,
            }}
          >
            {isSubmitting
              ? mode === 'create'
                ? 'Creando...'
                : 'Guardando...'
              : mode === 'create'
                ? 'Crear empresa'
                : 'Guardar cambios'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function CompaniesPage() {
  const { companies, filteredCompanies, stats, isLoading, error, setSearchQuery, refresh } = useDashboard();
  const [searchInput, setSearchInput] = useState('');
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [companyForm, setCompanyForm] = useState<CompanyFormState>(emptyCompanyForm);

  const currentMode = useMemo<'create' | 'edit'>(() => (editingCompany ? 'edit' : 'create'), [editingCompany]);

  const handleSearch = (query: string) => {
    setSearchInput(query);
    setSearchQuery(query);
  };

  const resetForm = () => {
    setCompanyForm(emptyCompanyForm);
    setFormError(null);
    setEditingCompany(null);
  };

  const closeFormModal = () => {
    setIsCreateOpen(false);
    resetForm();
  };

  const handleFormChange = (key: keyof CompanyFormState, value: string) => {
    setCompanyForm((prev) => ({ ...prev, [key]: value }));
  };

  const submitRequest = async (path: string, method: 'POST' | 'PUT', body: Record<string, unknown>) => {
    const response = await fetch(path, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const payload = await response.json().catch(() => null);

    if (!response.ok || (payload && payload.ok === false)) {
      throw new Error(
        payload?.error ||
        payload?.details ||
        payload?.message ||
        'No se pudo guardar la empresa.',
      );
    }
  };

  const handleSubmitCompany = async () => {
    try {
      setIsSubmitting(true);
      setFormError(null);

      if (currentMode === 'create') {
        await submitRequest('/api/proxy/api/company/register', 'POST', companyForm);
      } else if (editingCompany) {
        const updatePayload = {
          ...companyForm,
          name: companyForm.company_name,
          company_name: companyForm.company_name,
          password: companyForm.password || undefined,
        };

        await submitRequest(`/api/proxy/api/companies/${editingCompany.id}`, 'PUT', updatePayload);
      }

      await refresh();
      closeFormModal();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'No se pudo guardar la empresa.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditCompany = (company: Company) => {
    setEditingCompany(company);
    setCompanyForm(mapCompanyToForm(company));
    setFormError(null);
    setIsCreateOpen(true);
  };

  const handleToggleCompany = async (company: Company) => {
    try {
      setFormError(null);
      await submitRequest(`/api/proxy/api/companies/${company.id}`, 'PUT', {
        active: company.active === false,
      });
      await refresh();
      if (selectedCompany?.id === company.id) {
        setSelectedCompany({ ...selectedCompany, active: company.active === false, status: company.active === false ? 'Activa' : 'Inactiva' });
      }
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'No se pudo cambiar el estado de la empresa.');
    }
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
        }}
      >
        <div style={{ maxWidth: 1120, margin: '0 auto' }}>
          <div style={{ marginBottom: '32px' }}>
            <h1 style={{ fontSize: font.sizes['2xl'], fontWeight: font.weights.bold, marginBottom: 8 }}>
              Empresas
            </h1>
            <p style={{ fontSize: font.sizes.base, color: colors.text.secondary }}>
              Gestiona todas las empresas registradas en el sistema
            </p>
          </div>

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
                resetForm();
                setIsCreateOpen(true);
              }}
            >
              <Plus size={16} />
              Nueva Empresa
            </button>
          </div>

          {formError && !isCreateOpen && (
            <div
              style={{
                marginBottom: 18,
                padding: '12px 14px',
                borderRadius: 10,
                background: `${colors.error}18`,
                color: colors.error,
                border: `1px solid ${colors.error}55`,
                fontSize: 13,
              }}
            >
              {formError}
            </div>
          )}

          <div style={{ marginBottom: '32px' }}>
            <StatsSection stats={stats} />
          </div>

          <div style={{ marginBottom: '32px' }}>
            <GraficasSection companies={filteredCompanies} />
          </div>

          <div style={{ marginBottom: '32px' }}>
            <TopEmpresasSection companies={companies} />
          </div>

          <div style={{ marginBottom: '32px' }}>
            <h2 style={{ fontSize: font.sizes.lg, fontWeight: font.weights.semibold, marginBottom: 16 }}>
              Listado de Empresas
            </h2>
            <ListaEmpresasSection
              companies={filteredCompanies}
              isLoading={isLoading}
              error={error}
              onViewCompany={setSelectedCompany}
              onEditCompany={handleEditCompany}
              onToggleCompany={handleToggleCompany}
            />
          </div>
        </div>
      </main>

      {selectedCompany && (
        <div
          onClick={() => setSelectedCompany(null)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15,23,42,0.45)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 24,
            zIndex: 60,
          }}
        >
          <div
            onClick={(event) => event.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: 640,
              background: colors.bg.secondary,
              borderRadius: 16,
              border: `1px solid ${colors.border}`,
              padding: 24,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div>
                <h3 style={{ margin: 0, fontSize: 20 }}>{selectedCompany.name}</h3>
                <p style={{ margin: '6px 0 0', color: colors.text.secondary }}>{selectedCompany.sector || 'Sin sector'}</p>
              </div>
              <button
                onClick={() => setSelectedCompany(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: colors.text.secondary }}
              >
                <X size={20} />
              </button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 12 }}>
              {[
                ['RUC', selectedCompany.ruc || '-'],
                ['Email', selectedCompany.contact_email || '-'],
                ['Telefono', selectedCompany.contact_phone || '-'],
                ['Ciudad', selectedCompany.city || '-'],
                ['Estado', selectedCompany.state || '-'],
                ['Sitio web', selectedCompany.website || '-'],
                ['Plan', selectedCompany.plan],
                ['Estatus', selectedCompany.status],
              ].map(([label, value]) => (
                <div key={label} style={{ padding: 14, borderRadius: 10, background: colors.bg.primary, border: `1px solid ${colors.border}` }}>
                  <div style={{ fontSize: 12, color: colors.text.tertiary, marginBottom: 4 }}>{label}</div>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>{value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <CompanyFormModal
        mode={currentMode}
        open={isCreateOpen}
        companyForm={companyForm}
        isSubmitting={isSubmitting}
        error={formError}
        onClose={closeFormModal}
        onChange={handleFormChange}
        onSubmit={handleSubmitCompany}
      />
    </div>
  );
}
