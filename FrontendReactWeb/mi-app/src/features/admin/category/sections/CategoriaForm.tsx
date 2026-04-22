// src/features/seller/category/sections/CategoriaForm.tsx

'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { CategoryFormValues, Category, DEFAULT_CATEGORY_COLOR, CATEGORY_ICON_OPTIONS } from '../types';
import { dashboardTheme as t } from '../theme/dashboard.theme';

interface CategoriaFormProps {
  isOpen: boolean;
  mode: 'create' | 'edit';
  category?: Category;
  onClose: () => void;
  onSubmit: (data: CategoryFormValues) => Promise<void>;
}

export function CategoriaForm({
  isOpen,
  mode,
  category,
  onClose,
  onSubmit,
}: CategoriaFormProps) {
  const isEditing = mode === 'edit';

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CategoryFormValues>({
    defaultValues: {
      name: category?.name || '',
      description: category?.description || '',
      color: category?.color || DEFAULT_CATEGORY_COLOR,
      icon: category?.icon || 'Package',
      isActive: category?.isActive ?? true,
    },
  });

  const selectedColor = watch('color');

  React.useEffect(() => {
    if (category && isEditing) {
      reset({
        name: category.name,
        description: category.description || '',
        color: category.color,
        icon: category.icon || 'Package',
        isActive: category.isActive,
      });
    } else if (!isEditing) {
      reset({
        name: '',
        description: '',
        color: DEFAULT_CATEGORY_COLOR,
        icon: 'Package',
        isActive: true,
      });
    }
  }, [category, isEditing, reset]);

  const onFormSubmit = async (data: CategoryFormValues) => {
    await onSubmit(data);
    reset();
  };

  if (!isOpen) return null;

  return (
    <>
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          background: '#00000088',
          zIndex: 50,
        }}
      />
      <div style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 51,
        width: '100%',
        maxWidth: 480,
        background: t.bgCard,
        borderRadius: 16,
        border: `1px solid ${t.border}`,
        boxShadow: '0 24px 64px #00000055',
        padding: '24px',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 20,
        }}>
          <h2 style={{
            fontSize: 18,
            fontWeight: 600,
            color: t.textPrimary,
          }}>
            {isEditing ? 'Editar Categoría' : 'Nueva Categoría'}
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: t.textSecondary,
              padding: 4,
            }}
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit(onFormSubmit)}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: t.textPrimary, marginBottom: 6 }}>
                Nombre de la categoría
              </label>
              <input
                {...register('name', { required: 'El nombre es obligatorio' })}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  background: 'white',
                  border: `1px solid ${errors.name ? t.error : t.border}`,
                  borderRadius: 10,
                  fontSize: 14,
                  color: t.textPrimary,
                  outline: 'none',
                }}
                placeholder="Ej: Electrónicos"
              />
              {errors.name && (
                <p style={{ fontSize: 12, color: t.error, marginTop: 4 }}>{errors.name.message}</p>
              )}
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: t.textPrimary, marginBottom: 6 }}>
                Descripción (opcional)
              </label>
              <textarea
                {...register('description')}
                rows={3}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  background: 'white',
                  border: `1px solid ${t.border}`,
                  borderRadius: 10,
                  fontSize: 14,
                  color: t.textPrimary,
                  outline: 'none',
                  resize: 'vertical',
                }}
                placeholder="Breve descripción de la categoría..."
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: t.textPrimary, marginBottom: 8 }}>
                  Color
                </label>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {['#1E3A8A', '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'].map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setValue('color', color)}
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 10,
                        border: selectedColor === color ? `2px solid ${t.textPrimary}` : '2px solid transparent',
                        backgroundColor: color,
                        cursor: 'pointer',
                        transform: selectedColor === color ? 'scale(1.1)' : 'scale(1)',
                        transition: 'all 0.2s',
                      }}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: t.textPrimary, marginBottom: 8 }}>
                  Icono
                </label>
                <select
                  {...register('icon')}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    background: 'white',
                    border: `1px solid ${t.border}`,
                    borderRadius: 10,
                    fontSize: 14,
                    color: t.textPrimary,
                    outline: 'none',
                  }}
                >
                  {CATEGORY_ICON_OPTIONS.map((icon) => (
                    <option key={icon} value={icon}>
                      {icon}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <input
                type="checkbox"
                {...register('isActive')}
                style={{ width: 18, height: 18, cursor: 'pointer' }}
              />
              <label style={{ fontSize: 13, color: t.textSecondary }}>
                Categoría activa (visible en el catálogo)
              </label>
            </div>
          </div>

          <div style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 10,
            marginTop: 24,
            paddingTop: 16,
            borderTop: `1px solid ${t.border}`,
          }}>
            <button
              type="button"
              className="btn-secondary"
              onClick={onClose}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Guardando...' : isEditing ? 'Guardar Cambios' : 'Crear Categoría'}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}