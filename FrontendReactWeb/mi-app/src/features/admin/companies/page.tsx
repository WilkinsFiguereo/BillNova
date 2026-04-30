'use client';

import React, { useMemo, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { colors, font } from '../users/theme/tokens';
import { AdminSidebar } from '../dashboard/ui/AdminSidebar';
import { ADMIN_NAV_ITEMS } from '../dashboard/data/adminNavigation.data';
import { useDashboard, type CompanyUpdatePayload } from './hooks/useDashboard';
import { FilterBar } from './ui/FilterBar';
import { StatsSection } from './sections/StatsSection';
import { ListaEmpresasSection } from './sections/ListaEmpresasSection';
import { GraficasSection } from './sections/GraficasSection';
import { TopEmpresasSection } from './sections/TopEmpresasSection';
import type { Company } from './types/company.types';

type Notice = { type: 'success' | 'error'; message: string } | null;

type CompanyFormState = {
  name: string;
  ruc: string;
  sector: string;
  website: string;
  business_type: string;
  company_size: string;
  contact_name: string;
  contact_email: string;
  contact_phone: string;
  admin_full_name: string;
  admin_email: string;
  admin_phone: string;
  admin_position: string;
  address_city: string;
  address_state: string;
  full_address: string;
  access_password: string;
  confirm_password: string;
};

function emptyForm(company?: Company | null): CompanyFormState {
  return {
    name: company?.name ?? '',
    ruc: company?.ruc ?? '',
    sector: company?.sector ?? '',
    website: company?.website ?? '',
    business_type: company?.business_type ?? '',
    company_size: company?.company_size ?? '',
    contact_name: company?.contact_name ?? '',
    contact_email: company?.contact_email ?? '',
    contact_phone: company?.contact_phone ?? '',
    admin_full_name: company?.admin_full_name ?? '',
    admin_email: company?.admin_email ?? '',
    admin_phone: company?.admin_phone ?? '',
    admin_position: company?.admin_position ?? '',
    address_city: company?.city ?? '',
    address_state: company?.state ?? '',
    full_address: company?.address ?? '',
    access_password: '',
    confirm_password: '',
  };
}

function Field({
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
}) {
  return (
    <label style={{ display: 'grid', gap: 6 }}>
      <span style={{ fontSize: font.sizes.sm, color: colors.text.secondary, fontWeight: 600 }}>{label}</span>
      <input
        value={value}
        type={type}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        style={{
          border: `1px solid ${colors.border}`,
          borderRadius: 10,
          padding: '11px 12px',
          fontSize: font.sizes.base,
          color: colors.text.primary,
          background: '#fff',
          outline: 'none',
        }}
      />
    </label>
  );
}

function Modal({
  open,
  title,
  children,
  onClose,
}: {
  open: boolean;
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  if (!open) return null;

  return (
    <>
      <div
        onClick={onClose}
        style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.45)', zIndex: 40 }}
      />
      <div
        style={{
          position: 'fixed',
          inset: '50% auto auto 50%',
          transform: 'translate(-50%, -50%)',
          width: 'min(760px, calc(100vw - 32px))',
          maxHeight: 'calc(100vh - 48px)',
          overflow: 'auto',
          background: '#fff',
          borderRadius: 20,
          border: `1px solid ${colors.border}`,
          boxShadow: '0 30px 80px rgba(15, 23, 42, 0.22)',
          padding: 24,
          zIndex: 41,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ margin: 0, fontSize: font.sizes.xl, fontWeight: font.weights.bold }}>{title}</h2>
          <button
            onClick={onClose}
            style={{ border: 'none', background: 'transparent', fontSize: 22, cursor: 'pointer', color: colors.text.tertiary }}
          >
            x
          </button>
        </div>
        {children}
      </div>
    </>
  );
}

export default function CompaniesPage() {
  const {
    companies,
    filteredCompanies,
    stats,
    isLoading,
    error,
    refresh,
    setSearchQuery,
    updateCompany,
    deleteCompany,
  } = useDashboard();
  const [searchInput, setSearchInput] = useState('');
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [deletingCompany, setDeletingCompany] = useState<Company | null>(null);
  const [form, setForm] = useState<CompanyFormState>(emptyForm());
  const [notice, setNotice] = useState<Notice>(null);
  const [saving, setSaving] = useState(false);
  const [removing, setRemoving] = useState(false);

  const totalRevenue = useMemo(
    () => filteredCompanies.reduce((sum, company) => sum + (company.revenue ?? 0), 0),
    [filteredCompanies],
  );

  const handleSearch = (query: string) => {
    setSearchInput(query);
    setSearchQuery(query);
  };

  const openEditModal = (company: Company) => {
    setEditingCompany(company);
    setForm(emptyForm(company));
  };

  const handleSave = async () => {
    if (!editingCompany) return;
    if (!form.name.trim()) {
      setNotice({ type: 'error', message: 'El nombre de la empresa es requerido.' });
      return;
    }
    if ((form.access_password || form.confirm_password) && form.access_password !== form.confirm_password) {
      setNotice({ type: 'error', message: 'La nueva clave de acceso y su confirmacion no coinciden.' });
      return;
    }

    const payload: CompanyUpdatePayload = {
      name: form.name.trim(),
      ruc: form.ruc.trim(),
      sector: form.sector.trim(),
      website: form.website.trim(),
      business_type: form.business_type.trim(),
      company_size: form.company_size.trim(),
      contact_name: form.contact_name.trim(),
      contact_email: form.contact_email.trim(),
      contact_phone: form.contact_phone.trim(),
      admin_full_name: form.admin_full_name.trim(),
      admin_email: form.admin_email.trim(),
      admin_phone: form.admin_phone.trim(),
      admin_position: form.admin_position.trim(),
      address_city: form.address_city.trim(),
      address_state: form.address_state.trim(),
      full_address: form.full_address.trim(),
    };

    if (form.access_password.trim()) {
      payload.access_password = form.access_password.trim();
      payload.confirm_password = form.confirm_password.trim();
    }

    try {
      setSaving(true);
      const result = await updateCompany(editingCompany.id, payload);
      setEditingCompany(null);
      setNotice({
        type: 'success',
        message: result.warning ?? 'Empresa actualizada correctamente.',
      });
    } catch (err) {
      setNotice({
        type: 'error',
        message: err instanceof Error ? err.message : 'No se pudo actualizar la empresa.',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingCompany) return;
    try {
      setRemoving(true);
      const result = await deleteCompany(deletingCompany.id);
      setDeletingCompany(null);
      setNotice({
        type: 'success',
        message: result.warning ?? (result.archived ? 'Empresa archivada correctamente.' : 'Empresa eliminada correctamente.'),
      });
    } catch (err) {
      setNotice({
        type: 'error',
        message: err instanceof Error ? err.message : 'No se pudo eliminar la empresa.',
      });
    } finally {
      setRemoving(false);
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

      <main style={{ flex: 1, overflow: 'auto', padding: '32px 36px' }}>
        <div style={{ maxWidth: 1120, margin: '0 auto' }}>
          <div style={{ marginBottom: '32px' }}>
            <h1 style={{ fontSize: font.sizes['2xl'], fontWeight: font.weights.bold, marginBottom: 8 }}>
              Administrar empresas
            </h1>
            <p style={{ fontSize: font.sizes.base, color: colors.text.secondary }}>
              Edita datos, cambia la clave de acceso y elimina empresas desde el panel admin.
            </p>
          </div>

          {notice ? (
            <div
              style={{
                marginBottom: 20,
                padding: '14px 16px',
                borderRadius: 12,
                background: notice.type === 'success' ? '#DCFCE7' : '#FEE2E2',
                color: notice.type === 'success' ? '#166534' : '#991B1B',
                border: `1px solid ${notice.type === 'success' ? '#86EFAC' : '#FCA5A5'}`,
              }}
            >
              {notice.message}
            </div>
          ) : null}

          <div
            style={{
              display: 'flex',
              gap: '16px',
              marginBottom: '32px',
              alignItems: 'center',
              flexWrap: 'wrap',
            }}
          >
            <div style={{ flex: 1, minWidth: 220 }}>
              <FilterBar searchQuery={searchInput} onSearchChange={handleSearch} placeholder="Buscar empresas..." />
            </div>
            <button
              onClick={() => void refresh()}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '11px 16px',
                background: '#fff',
                color: colors.text.primary,
                border: `1px solid ${colors.border}`,
                borderRadius: 8,
                cursor: 'pointer',
              }}
            >
              <RefreshCw size={16} />
              Recargar
            </button>
          </div>

          <div
            style={{
              marginBottom: 24,
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: 16,
            }}
          >
            <div style={{ background: '#fff', border: `1px solid ${colors.border}`, borderRadius: 16, padding: 18 }}>
              <div style={{ fontSize: font.sizes.sm, color: colors.text.secondary, marginBottom: 8 }}>Empresas visibles</div>
              <div style={{ fontSize: font.sizes.xl, fontWeight: font.weights.bold }}>{filteredCompanies.length}</div>
            </div>
            <div style={{ background: '#fff', border: `1px solid ${colors.border}`, borderRadius: 16, padding: 18 }}>
              <div style={{ fontSize: font.sizes.sm, color: colors.text.secondary, marginBottom: 8 }}>Ingreso estimado</div>
              <div style={{ fontSize: font.sizes.xl, fontWeight: font.weights.bold }}>${totalRevenue.toLocaleString()}</div>
            </div>
          </div>

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
              onEdit={openEditModal}
              onDelete={setDeletingCompany}
            />
          </div>
        </div>
      </main>

      <Modal open={Boolean(editingCompany)} onClose={() => !saving && setEditingCompany(null)} title="Editar empresa">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 14 }}>
          <Field label="Nombre" value={form.name} onChange={(value) => setForm((prev) => ({ ...prev, name: value }))} />
          <Field label="RUC" value={form.ruc} onChange={(value) => setForm((prev) => ({ ...prev, ruc: value }))} />
          <Field label="Sector" value={form.sector} onChange={(value) => setForm((prev) => ({ ...prev, sector: value }))} />
          <Field label="Sitio web" value={form.website} onChange={(value) => setForm((prev) => ({ ...prev, website: value }))} />
          <Field label="Tipo de negocio" value={form.business_type} onChange={(value) => setForm((prev) => ({ ...prev, business_type: value }))} />
          <Field label="Tamano de empresa" value={form.company_size} onChange={(value) => setForm((prev) => ({ ...prev, company_size: value }))} />
          <Field label="Contacto" value={form.contact_name} onChange={(value) => setForm((prev) => ({ ...prev, contact_name: value }))} />
          <Field label="Correo contacto" value={form.contact_email} onChange={(value) => setForm((prev) => ({ ...prev, contact_email: value }))} type="email" />
          <Field label="Telefono contacto" value={form.contact_phone} onChange={(value) => setForm((prev) => ({ ...prev, contact_phone: value }))} />
          <Field label="Administrador" value={form.admin_full_name} onChange={(value) => setForm((prev) => ({ ...prev, admin_full_name: value }))} />
          <Field label="Correo admin" value={form.admin_email} onChange={(value) => setForm((prev) => ({ ...prev, admin_email: value }))} type="email" />
          <Field label="Telefono admin" value={form.admin_phone} onChange={(value) => setForm((prev) => ({ ...prev, admin_phone: value }))} />
          <Field label="Cargo admin" value={form.admin_position} onChange={(value) => setForm((prev) => ({ ...prev, admin_position: value }))} />
          <Field label="Ciudad" value={form.address_city} onChange={(value) => setForm((prev) => ({ ...prev, address_city: value }))} />
          <Field label="Estado" value={form.address_state} onChange={(value) => setForm((prev) => ({ ...prev, address_state: value }))} />
          <div style={{ gridColumn: '1 / -1' }}>
            <Field label="Direccion" value={form.full_address} onChange={(value) => setForm((prev) => ({ ...prev, full_address: value }))} />
          </div>
          <Field
            label="Nueva clave de acceso"
            value={form.access_password}
            onChange={(value) => setForm((prev) => ({ ...prev, access_password: value }))}
            type="password"
            placeholder="Dejar vacio para no cambiarla"
          />
          <Field
            label="Confirmar nueva clave"
            value={form.confirm_password}
            onChange={(value) => setForm((prev) => ({ ...prev, confirm_password: value }))}
            type="password"
            placeholder="Repite la clave"
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 22 }}>
          <button
            onClick={() => setEditingCompany(null)}
            disabled={saving}
            style={{
              padding: '10px 14px',
              borderRadius: 10,
              border: `1px solid ${colors.border}`,
              background: '#fff',
              cursor: saving ? 'not-allowed' : 'pointer',
            }}
          >
            Cancelar
          </button>
          <button
            onClick={() => void handleSave()}
            disabled={saving}
            style={{
              padding: '10px 14px',
              borderRadius: 10,
              border: 'none',
              background: colors.accent,
              color: '#fff',
              cursor: saving ? 'not-allowed' : 'pointer',
            }}
          >
            {saving ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </div>
      </Modal>

      <Modal open={Boolean(deletingCompany)} onClose={() => !removing && setDeletingCompany(null)} title="Eliminar empresa">
        <p style={{ margin: 0, color: colors.text.secondary, lineHeight: 1.6 }}>
          {`Vas a eliminar ${deletingCompany?.name ?? 'esta empresa'}. Si Odoo detecta dependencias, la empresa se archivara para no romper datos relacionados.`}
        </p>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 22 }}>
          <button
            onClick={() => setDeletingCompany(null)}
            disabled={removing}
            style={{
              padding: '10px 14px',
              borderRadius: 10,
              border: `1px solid ${colors.border}`,
              background: '#fff',
              cursor: removing ? 'not-allowed' : 'pointer',
            }}
          >
            Cancelar
          </button>
          <button
            onClick={() => void handleDelete()}
            disabled={removing}
            style={{
              padding: '10px 14px',
              borderRadius: 10,
              border: 'none',
              background: '#B91C1C',
              color: '#fff',
              cursor: removing ? 'not-allowed' : 'pointer',
            }}
          >
            {removing ? 'Eliminando...' : 'Eliminar empresa'}
          </button>
        </div>
      </Modal>
    </div>
  );
}
