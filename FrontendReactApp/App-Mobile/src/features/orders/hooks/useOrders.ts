import { useEffect, useState } from 'react';
import { ordersApi } from '../data/ordersApi';
import type { Order, FilterTab } from '../types/orders.types';

export function useOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<FilterTab>('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    let mounted = true;
    setLoading(true);

    ordersApi.getAll().then((res) => {
      if (!mounted) return;
      if (res.ok && res.data) {
        setOrders(res.data);
      } else {
        setError(res.error ?? 'No se pudieron cargar los pedidos');
      }
      setLoading(false);
    });

    return () => { mounted = false; };
  }, []);

  const filtered = orders.filter((o) => {
    const matchesFilter = activeFilter === 'all' || o.status === activeFilter;
    const matchesSearch = o.reference.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return { orders: filtered, totalOrders: orders.length, loading, error, activeFilter, setActiveFilter, search, setSearch };
}