// src/features/admin/category/page.tsx

'use client';

import React, { useState } from 'react';
import { useCategorias } from './hooks/useCategorias';
import { dashboardTheme as t, globalStyles } from './theme/dashboard.theme';
import { ADMIN_NAV_ITEMS } from '../dashboard/data/adminNavigation.data';
import { AdminSidebar } from '../dashboard/ui/AdminSidebar';

import { CategoriaHeader } from './sections/CategoriaHeader';
import { CategoriaTable } from './sections/CategoriaTable';
import { CategoriaForm } from './sections/CategoriaForm';
import { DeleteConfirm } from './sections/DeleteConfirm';

export default function CategoriaPage() {
  const {
    categories,
    stats,
    isLoading,
    error,
    createCategory,
    updateCategory,
    deleteCategory,
    toggleActive,
    searchTerm,
    setSearchTerm,
    openModal,
    closeModal,
    modalState,
  } = useCategorias();

  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; id: string; name: string }>({
    isOpen: false,
    id: '',
    name: '',
  });

  const handleEdit = (category: any) => {
    openModal('edit', category);
  };

  const handleDeleteClick = (id: string) => {
    const category = categories.find(c => c.id === id);
    setDeleteModal({ isOpen: true, id, name: category?.name || '' });
  };

  const confirmDelete = async () => {
    try {
      await deleteCategory(deleteModal.id);
      setDeleteModal({ isOpen: false, id: '', name: '' });
    } catch (err) {
      alert('No se pudo eliminar la categoría');
    }
  };

  const handleFormSubmit = async (data: any) => {
    if (modalState.mode === 'create') {
      await createCategory(data);
    } else if (modalState.mode === 'edit' && modalState.editingCategory) {
      await updateCategory({ ...data, id: modalState.editingCategory.id });
    }
  };

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
        background: t.bgMain,
        color: t.textPrimary,
      }}
    >
      <style>{globalStyles(t)}</style>

      <AdminSidebar navItems={ADMIN_NAV_ITEMS} />

      <main style={{ flex: 1, overflow: 'auto', padding: '32px' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <CategoriaHeader
            stats={stats}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            onCreateNew={() => openModal('create')}
          />

          {error && (
            <div style={{
              marginTop: 24,
              padding: 16,
              background: t.errorBg,
              color: t.error,
              borderRadius: 12,
            }}>
              {error}
            </div>
          )}

          <div style={{ marginTop: 32 }}>
            <CategoriaTable
              categories={categories}
              isLoading={isLoading}
              onEdit={handleEdit}
              onDelete={handleDeleteClick}
              onToggleActive={toggleActive}
            />
          </div>
        </div>
      </main>

      <CategoriaForm
        isOpen={modalState.isOpen}
        mode={modalState.mode}
        category={modalState.editingCategory}
        onClose={closeModal}
        onSubmit={handleFormSubmit}
      />

      <DeleteConfirm
        isOpen={deleteModal.isOpen}
        categoryName={deleteModal.name}
        onClose={() => setDeleteModal({ isOpen: false, id: '', name: '' })}
        onConfirm={confirmDelete}
      />
    </div>
  );
}