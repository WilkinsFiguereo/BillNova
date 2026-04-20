'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Camera, Save, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCurrentUser } from './hooks/useCurrentUser';
import { colors, font } from '../users/theme/tokens';

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('No se pudo leer la imagen.'));
    reader.onloadend = () => resolve(String(reader.result ?? ''));
    reader.readAsDataURL(file);
  });
}

type ProfileFormData = {
  name: string;
  email: string;
  phone: string;
  department: string;
  address: string;
};

export function ProfilePage() {
  const router = useRouter();
  const { user, loading, saving, error, updateProfile, updateAvatar, clearAvatar } = useCurrentUser();

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<ProfileFormData>({
    name: '',
    email: '',
    phone: '',
    department: '',
    address: '',
  });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  useEffect(() => {
    const syncUser = () => {
      if (!user) return;
      setFormData({
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        department: user.department || '',
        address: user.address || '',
      });
      setAvatarPreview(user.avatar ?? null);
      setAvatarFile(null);
    };
    syncUser();
  }, [user]);

  const avatarUrl = useMemo(() => avatarPreview || user?.avatar || null, [avatarPreview, user?.avatar]);

  const initials = useMemo(() => {
    const base = user?.name || '';
    return base
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  }, [user?.name]);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setAvatarFile(file);
      const dataUrl = await readFileAsDataUrl(file);
      setAvatarPreview(dataUrl);
    } catch (err) {
      console.error(err);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const cancelEdit = () => {
    if (!user) return;
    setIsEditing(false);
    setFormData({
      name: user.name,
      email: user.email,
      phone: user.phone || '',
      department: user.department || '',
      address: user.address || '',
    });
    setAvatarPreview(user.avatar ?? null);
    setAvatarFile(null);
  };

  const handleSave = async () => {
    try {
      await updateProfile({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        department: formData.department,
      });

      if (avatarFile && avatarPreview) {
        await updateAvatar(avatarPreview);
      }

      setIsEditing(false);
      setAvatarFile(null);
    } catch (err) {
      console.error('Error al guardar perfil:', err);
    }
  };

  if (loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          background: colors.bg.primary,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              width: 40,
              height: 40,
              border: `3px solid ${colors.primarySoft}`,
              borderTopColor: colors.primary,
              borderRadius: '50%',
              animation: 'spin 0.8s linear infinite',
              margin: '0 auto 16px',
            }}
          />
          <p style={{ color: colors.text.secondary }}>Cargando perfil...</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div
        style={{
          minHeight: '100vh',
          background: colors.bg.primary,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <p style={{ color: colors.text.secondary }}>{error || 'Error al cargar el usuario'}</p>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: colors.bg.primary, fontFamily: font.family }}>
      <div
        style={{
          background: colors.bg.secondary,
          borderBottom: `1px solid ${colors.border}`,
          padding: '16px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
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
            <p style={{ fontSize: 12, color: colors.text.tertiary, margin: '4px 0 0 0' }}>
              Gestiona tu información personal
            </p>
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
          >
            Editar
          </button>
        ) : (
          <div style={{ display: 'flex', gap: 10 }}>
            <button
              onClick={cancelEdit}
              disabled={saving}
              style={{
                padding: '8px 16px',
                background: colors.bg.alt,
                color: colors.text.primary,
                border: `1px solid ${colors.border}`,
                borderRadius: 8,
                cursor: saving ? 'not-allowed' : 'pointer',
                fontSize: 14,
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                opacity: saving ? 0.6 : 1,
              }}
            >
              <X size={16} />
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              style={{
                padding: '8px 16px',
                background: colors.primary,
                color: 'white',
                border: 'none',
                borderRadius: 8,
                cursor: saving ? 'not-allowed' : 'pointer',
                fontSize: 14,
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                opacity: saving ? 0.8 : 1,
              }}
            >
              <Save size={16} />
              {saving ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        )}
      </div>

      <div style={{ maxWidth: 800, margin: '32px auto', padding: '0 24px' }}>
        {error && (
          <div
            style={{
              marginBottom: 16,
              padding: '12px 14px',
              background: 'rgba(239,68,68,0.08)',
              border: '1px solid rgba(239,68,68,0.25)',
              borderRadius: 10,
              color: colors.text.primary,
              fontSize: 13,
            }}
          >
            {error}
          </div>
        )}

        <div
          style={{
            background: colors.bg.secondary,
            border: `1px solid ${colors.border}`,
            borderRadius: 12,
            padding: 32,
            marginBottom: 24,
            textAlign: 'center',
          }}
        >
          <div
            style={{
              width: 120,
              height: 120,
              margin: '0 auto 16px',
              borderRadius: '50%',
              background: avatarUrl
                ? `url(${avatarUrl})`
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
            }}
          >
            {!avatarUrl && initials}

            {isEditing && (
              <label
                style={{
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
                <input type="file" accept="image/*" onChange={handleAvatarChange} style={{ display: 'none' }} />
                <Camera size={32} color="white" />
              </label>
            )}
          </div>

          {isEditing && avatarUrl && (
            <button
              type="button"
              onClick={async () => {
                try {
                  await clearAvatar();
                  setAvatarPreview(null);
                  setAvatarFile(null);
                } catch (err) {
                  console.error(err);
                }
              }}
              disabled={saving}
              style={{
                marginTop: 10,
                padding: '8px 12px',
                borderRadius: 8,
                border: `1px solid ${colors.border}`,
                background: colors.bg.alt,
                cursor: saving ? 'not-allowed' : 'pointer',
                fontSize: 13,
                fontWeight: 600,
                color: colors.text.primary,
                opacity: saving ? 0.6 : 1,
              }}
            >
              Quitar foto
            </button>
          )}

          <h2 style={{ fontSize: 20, fontWeight: 700, color: colors.text.primary, margin: '16px 0 4px 0' }}>
            {user.name}
          </h2>
          <p style={{ fontSize: 13, color: colors.text.secondary, margin: 0 }}>{user.role}</p>
        </div>

        {isEditing ? (
          <div
            style={{
              background: colors.bg.secondary,
              border: `1px solid ${colors.border}`,
              borderRadius: 12,
              padding: 24,
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {[
                { label: 'Nombre completo', name: 'name' as const, type: 'text' as const },
                { label: 'Email', name: 'email' as const, type: 'email' as const },
                { label: 'Teléfono', name: 'phone' as const, type: 'tel' as const },
                { label: 'Departamento', name: 'department' as const, type: 'text' as const },
                { label: 'Dirección', name: 'address' as const, type: 'text' as const },
              ].map((field) => (
                <div key={field.name}>
                  <label
                    style={{
                      display: 'block',
                      fontSize: 13,
                      fontWeight: 600,
                      color: colors.text.primary,
                      marginBottom: 6,
                    }}
                  >
                    {field.label}
                  </label>
                  <input
                    type={field.type}
                    name={field.name}
                    value={formData[field.name] || ''}
                    onChange={handleInputChange}
                    disabled={saving}
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
                      opacity: saving ? 0.85 : 1,
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
          <div
            style={{
              background: colors.bg.secondary,
              border: `1px solid ${colors.border}`,
              borderRadius: 12,
              overflow: 'hidden',
            }}
          >
            {[
              { label: 'Email', value: user.email },
              { label: 'Teléfono', value: user.phone },
              { label: 'Departamento', value: user.department },
              { label: 'Dirección', value: user.address },
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
                <span style={{ fontSize: 13, fontWeight: 600, color: colors.text.secondary }}>{item.label}</span>
                <span style={{ fontSize: 14, color: colors.text.primary }}>{item.value || '-'}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

