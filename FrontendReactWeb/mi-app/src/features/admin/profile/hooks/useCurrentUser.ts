'use client';

import { useState, useEffect } from 'react';

export interface CurrentUser {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
  phone?: string;
  department?: string;
}

const mockUser: CurrentUser = {
  id: '1',
  name: 'Admin Demo',
  email: 'admin@billnova.com',
  role: 'Administrador',
  phone: '+1 (555) 123-4567',
  department: 'Administración',
  avatar: undefined,
};

export function useCurrentUser() {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // TODO: Aquí iría la llamada a la API real para obtener el usuario actual
        // const response = await fetch('/api/user/me');
        // const data = await response.json();
        // setUser(data);
        
        // Por ahora usamos datos mock
        setUser(mockUser);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar usuario');
        setUser(mockUser); // Fallback a mock
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  return { user, loading, error };
}
