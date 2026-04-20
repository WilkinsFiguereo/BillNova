'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';
import { useCurrentUser } from '@/features/admin/profile/hooks/useCurrentUser';
import { clearStoredAuthState } from '@/features/auth/login/data/storage';
import { colors } from '@/features/admin/users/theme/tokens';

export function UserProfileSidebarSection() {
  const { user } = useCurrentUser();
  const router = useRouter();

  const initials = user?.name
    .split(' ')
    .slice(0, 2)
    .map(n => n[0])
    .join('')
    .toUpperCase() || 'AD';

  const handleLogout = async () => {
    try {
      const stored = localStorage.getItem("billnova.auth.user");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed?.user?.sessionToken) {
          await fetch(`${process.env.NEXT_PUBLIC_ODOO_URL || 'http://localhost:8079'}/api/auth/logout`, {
            method: "POST",
            credentials: "include",
            headers: { "X-Auth-Session": parsed.user.sessionToken },
          });
        }
      }
    } catch {
    } finally {
      clearStoredAuthState();
      document.cookie.split(";").forEach((c) => {
        document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
      });
      router.replace("/navigation/auth/login");
    }
  };

  return (
    <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
      <Link href="/navigation/admin/profile/page" style={{ textDecoration: 'none' }}>
        <div
          style={{
            padding: '12px',
            background: colors.bg.tertiary,
            borderRadius: 12,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLDivElement).style.background = colors.primarySoft || '#DBEAFE';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLDivElement).style.background = colors.bg.tertiary;
          }}
        >
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              background: `linear-gradient(135deg, ${colors.accent}, #818cf8)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 13,
              color: 'white',
              fontWeight: 700,
              flexShrink: 0,
            }}
          >
            {initials}
          </div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: colors.text.primary }}>
              {user?.name || 'Admin Demo'}
            </div>
            <div style={{ fontSize: 10, color: colors.text.tertiary }}>
              {user?.role || 'Administrador'}
            </div>
          </div>
        </div>
      </Link>
      <div
        onClick={handleLogout}
        style={{
          padding: '10px 12px',
          background: '#FEF2F2',
          borderRadius: 10,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          cursor: 'pointer',
          transition: 'all 0.2s ease',
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLDivElement).style.background = '#FEE2E2';
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLDivElement).style.background = '#FEF2F2';
        }}
      >
        <LogOut size={16} color="#DC2626" />
        <span style={{ fontSize: 12, fontWeight: 500, color: '#DC2626' }}>
          Cerrar sesión
        </span>
      </div>
    </div>
  );
}
