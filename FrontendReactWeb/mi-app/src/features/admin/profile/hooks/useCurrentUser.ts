'use client';

import { useEffect, useState } from 'react';
import { getStoredAuthState } from '@/features/auth/login/data/storage';

export interface CurrentUser {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
  phone?: string;
  department?: string;
}

export function useCurrentUser() {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        setLoading(true);
        setError(null);

        const stored = getStoredAuthState();
        setUser({
          id: String(stored?.uid ?? 1),
          name: stored?.name ?? 'Admin Demo',
          email: stored?.email ?? 'admin@billnova.com',
          role: stored?.role ?? 'admin',
          phone: '(809) 555-0101',
          department: 'Operaciones',
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar usuario');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    void loadUser();
  }, []);

  return { user, loading, error };
}
