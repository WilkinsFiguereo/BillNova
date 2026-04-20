'use client';

import { useCallback, useEffect, useState } from 'react';
import { getStoredAuthState, persistAuthState } from '@/features/auth';
import { ODOO_URL } from '@/lib/odooApi';

export interface CurrentUser {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
  phone?: string;
  department?: string;
  billnovaUserId?: number;
  resUserId?: number;
}

type ResUserResponse = {
  data?: {
    id: number;
    name: string;
    email: string;
  };
};

type BillnovaUsersResponse = {
  data?: Array<{
    id: number;
    name: string;
    email: string;
    phone?: string;
    role?: string;
    res_user_id?: number;
  }>;
};

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    cache: 'no-store',
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `HTTP ${response.status}`);
  }

  return response.json() as Promise<T>;
}

function getRoleLabel(role?: string) {
  switch ((role || '').toLowerCase()) {
    case 'admin':
      return 'Administrador';
    case 'moderation':
      return 'Moderacion';
    case 'seller':
      return 'Vendedor';
    case 'user':
      return 'Usuario';
    default:
      return role || 'Administrador';
  }
}

export function useCurrentUser() {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const authUser = getStoredAuthState();
      if (!authUser?.uid) {
        throw new Error('No hay una sesion activa para cargar el perfil.');
      }

      const [resUserResponse, billnovaUsersResponse] = await Promise.all([
        fetchJson<ResUserResponse>(`${ODOO_URL}/api/users/${authUser.uid}`),
        fetchJson<BillnovaUsersResponse>(`${ODOO_URL}/api/billnova-users`),
      ]);

      const billnovaUser = (billnovaUsersResponse.data || []).find(
        (candidate) => candidate.res_user_id === authUser.uid,
      );

      const currentUser: CurrentUser = {
        id: String(authUser.uid),
        resUserId: authUser.uid,
        billnovaUserId: billnovaUser?.id,
        name: billnovaUser?.name || resUserResponse.data?.name || authUser.name,
        email: billnovaUser?.email || resUserResponse.data?.email || authUser.email,
        role: getRoleLabel(billnovaUser?.role || authUser.role),
        phone: billnovaUser?.phone,
        department: 'Administracion',
      };

      setUser(currentUser);
      persistAuthState(
        {
          ...authUser,
          name: currentUser.name,
          email: currentUser.email,
        },
        false,
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar usuario');
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { user, loading, error, refresh };
}
