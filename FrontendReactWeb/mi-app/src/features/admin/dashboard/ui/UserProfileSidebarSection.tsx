'use client';

import Link from 'next/link';
import { useCurrentUser } from '@/features/profile/hooks/useCurrentUser';
import { colors } from '@/features/admin/users/theme/tokens';

export function UserProfileSidebarSection() {
  const { user } = useCurrentUser();

  const initials = user?.name
    .split(' ')
    .slice(0, 2)
    .map(n => n[0])
    .join('')
    .toUpperCase() || 'AD';

  const hasAvatar = user?.avatar;

  return (
    <Link href="/navigation/profile" style={{ textDecoration: 'none' }}>
      <div
        style={{
          marginTop: 'auto',
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
            background: hasAvatar 
              ? `url(${user.avatar})`
              : `linear-gradient(135deg, ${colors.accent}, #818cf8)`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 13,
            color: hasAvatar ? 'transparent' : 'white',
            fontWeight: 700,
            flexShrink: 0,
          }}
        >
          {!hasAvatar && initials}
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
  );
}
