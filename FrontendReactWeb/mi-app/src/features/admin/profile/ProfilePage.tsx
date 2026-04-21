'use client';

import React, { useState } from 'react';
import { ArrowLeft, Camera, Save, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCurrentUser } from './hooks/useCurrentUser';
import { useUpdateProfile } from './hooks/useUpdateProfile';
import { colors, font } from '../users/theme/tokens';

export function ProfilePage() {
  const router = useRouter();
  const { user, loading, refreshUser } = useCurrentUser();
  const { updateProfile, loading: saving } = useUpdateProfile();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    department: '',
  });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  React.useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        department: user.department || '',
      });
    }
  }, [user]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setSaveError(null);
    setSaveSuccess(false);
    try {
      const result = await updateProfile({
        name: formData.name,
        phone: formData.phone,
        avatar: avatarPreview || undefined,
      });
      if (result.ok) {
        setSaveSuccess(true);
        setIsEditing(false);
        setAvatarPreview(null);
        setTimeout(() => {
          refreshUser();
        }, 100);
        setTimeout(() => setSaveSuccess(false), 3000);
      } else {
        setSaveError(result.error || 'Error al guardar los cambios');
      }
    } catch (error) {
      console.error('Error al guardar perfil:', error);
      setSaveError('Error al guardar los cambios');
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: colors.bg.primary, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 40, height: 40, border: `3px solid ${colors.primarySoft}`, borderTopColor: colors.primary, borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
          <p style={{ color: colors.text.secondary }}>Cargando perfil...</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div style={{ minHeight: '100vh', background: colors.bg.primary, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: colors.text.secondary }}>Error al cargar el usuario</p>
      </div>
    );
  }

  const initials = user.name
    .split(' ')
    .slice(0, 2)
    .map(n => n[0])
    .join('')
    .toUpperCase();

  return (
    <div style={{ minHeight: '100vh', background: colors.bg.primary, fontFamily: font.family }}>
      {/* Topbar */}
      <div style={{
        background: colors.bg.secondary,
        borderBottom: `1px solid ${colors.border}`,
        padding: '16px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button
            onClick={() => router.back()}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 36,
              height: 36,
              borderRadius: 8,
              color: colors.text.secondary,
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = colors.bg.alt;
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = 'none';
            }}
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 style={{ fontSize: 18, fontWeight: 700, color: colors.text.primary, margin: 0 }}>Mi Perfil</h1>
            <p style={{ fontSize: 12, color: colors.text.tertiary, margin: '4px 0 0 0' }}>Gestiona tu información personal</p>
          </div>
        </div>

        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            style={{
              padding: '8px 16px',
              background: colors.primary,
              color: 'white',
              border: 'none',
              borderRadius: 8,
              cursor: 'pointer',
              fontSize: 14,
              fontWeight: 600,
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = colors.primaryHover;
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = colors.primary;
            }}
          >
            Editar
          </button>
        ) : (
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={handleSave}
              disabled={saving}
              style={{
                padding: '8px 16px',
                background: saving ? colors.text.tertiary : colors.success,
                color: 'white',
                border: 'none',
                borderRadius: 8,
                cursor: saving ? 'not-allowed' : 'pointer',
                fontSize: 14,
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <Save size={16} />
              {saving ? 'Guardando...' : 'Guardar'}
            </button>
            <button
              onClick={() => {
                setIsEditing(false);
                setAvatarPreview(null);
              }}
              style={{
                padding: '8px 16px',
                background: colors.bg.alt,
                color: colors.text.primary,
                border: `1px solid ${colors.border}`,
                borderRadius: 8,
                cursor: 'pointer',
                fontSize: 14,
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <X size={16} />
              Cancelar
            </button>
          </div>
        )}
      </div>

      {/* Contenido */}
      <div style={{ maxWidth: 800, margin: '32px auto', padding: '0 24px' }}>
        {/* Avatar Section */}
        <div style={{
          background: colors.bg.secondary,
          border: `1px solid ${colors.border}`,
          borderRadius: 12,
          padding: 32,
          marginBottom: 24,
          textAlign: 'center',
        }}>
          <div style={{
            width: 120,
            height: 120,
            margin: '0 auto 16px',
            borderRadius: '50%',
            background: avatarPreview || user?.avatar 
              ? `url(${avatarPreview || user?.avatar})` 
              : `linear-gradient(135deg, ${colors.primary}, #818cf8)`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 40,
            fontWeight: 700,
            color: 'white',
            position: 'relative',
            overflow: 'hidden',
          }}>
            {!avatarPreview && !user?.avatar && initials}

            {isEditing && (
              <label style={{
                position: 'absolute',
                inset: 0,
                background: 'rgba(0,0,0,0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                opacity: 0,
                transition: 'opacity 0.2s',
              }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLLabelElement).style.opacity = '1';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLLabelElement).style.opacity = '0';
                }}
              >
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  style={{ display: 'none' }}
                />
                <Camera size={32} color="white" />
              </label>
            )}
          </div>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: colors.text.primary, margin: '0 0 4px 0' }}>
            {user.name}
          </h2>
          <p style={{ fontSize: 13, color: colors.text.secondary, margin: 0 }}>
            {user.role}
          </p>
        </div>

        {/* Form Section */}
        {isEditing ? (
          <div style={{
            background: colors.bg.secondary,
            border: `1px solid ${colors.border}`,
            borderRadius: 12,
            padding: 24,
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {[
                { label: 'Nombre completo', name: 'name', type: 'text' },
                { label: 'Email', name: 'email', type: 'email' },
                { label: 'Teléfono', name: 'phone', type: 'tel' },
                { label: 'Departamento', name: 'department', type: 'text' },
              ].map(field => (
                <div key={field.name}>
                  <label style={{
                    display: 'block',
                    fontSize: 13,
                    fontWeight: 600,
                    color: colors.text.primary,
                    marginBottom: 6,
                  }}>
                    {field.label}
                  </label>
                  <input
                    type={field.type}
                    name={field.name}
                    value={formData[field.name as keyof typeof formData] || ''}
                    onChange={handleInputChange}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: `1px solid ${colors.border}`,
                      borderRadius: 8,
                      fontSize: 14,
                      fontFamily: 'inherit',
                      color: colors.text.primary,
                      background: colors.bg.primary,
                      boxSizing: 'border-box',
                      transition: 'border-color 0.2s',
                    }}
                    onFocus={(e) => {
                      (e.target as HTMLInputElement).style.borderColor = colors.primary;
                    }}
                    onBlur={(e) => {
                      (e.target as HTMLInputElement).style.borderColor = colors.border;
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div style={{
            background: colors.bg.secondary,
            border: `1px solid ${colors.border}`,
            borderRadius: 12,
            overflow: 'hidden',
          }}>
            {[
              { label: 'Email', value: user.email },
              { label: 'Teléfono', value: user.phone },
              { label: 'Departamento', value: user.department },
            ].map((item, index) => (
              <div
                key={item.label}
                style={{
                  padding: '16px 24px',
                  borderBottom: index < 2 ? `1px solid ${colors.border}` : 'none',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <span style={{ fontSize: 13, fontWeight: 600, color: colors.text.secondary }}>
                  {item.label}
                </span>
                <span style={{ fontSize: 14, color: colors.text.primary }}>
                  {item.value || '-'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {(saveSuccess || saveError) && (
        <div style={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          padding: '12px 20px',
          borderRadius: 8,
          background: saveSuccess ? colors.success : colors.error,
          color: 'white',
          fontSize: 14,
          fontWeight: 500,
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          zIndex: 1000,
        }}>
          {saveSuccess ? 'Perfil actualizado correctamente' : saveError}
        </div>
      )}
    </div>
  );
}
