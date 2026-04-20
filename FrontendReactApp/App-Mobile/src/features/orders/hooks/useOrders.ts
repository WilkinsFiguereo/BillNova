import { useEffect, useState, useCallback } from 'react';
import { ordersApi } from '../data/ordersApi';
import { normalizeOrderStatus, type Order, type FilterTab } from '../types/orders.types';
import { useIsFocused } from '@react-navigation/native';

function normalizeOrders(rawOrders: Order[]): Order[] {
  return rawOrders.map((order) => ({
    ...order,
    status: normalizeOrderStatus(order?.status),
  }));
}

export function useOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<FilterTab>('all');
  const [search, setSearch] = useState('');
  const isFocused = useIsFocused();

  useEffect(() => {
    if (!isFocused) return;

    let mounted = true;
    setLoading(true);

    ordersApi.getAll().then((res) => {
      if (!mounted) return;
      if (res.ok && res.data) {
        setOrders(normalizeOrders(res.data));
        setError(null);
      } else {
        setError(res.error ?? 'No se pudieron cargar los pedidos');
      }
      setLoading(false);
    });

    return () => { mounted = false; };
  }, [isFocused]);

  const filtered = orders.filter((o) => {
    const matchesFilter = activeFilter === 'all' || o.status === activeFilter;
    const matchesSearch = o.reference.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const cancelOrder = useCallback(async (orderId: string) => {
    const result = await ordersApi.cancel(orderId);
    if (result.ok) {
      setOrders(prev => prev.map(o => (o.id === orderId ? { ...o, status: 'cancelled' } : o)));
    } else {
      setError(result.error ?? 'No se pudo cancelar el pedido');
    }
    return result;
  }, []);

  return {
    orders: filtered,
    totalOrders: orders.length,
    loading,
    error,
    activeFilter,
    setActiveFilter,
    search,
    setSearch,
    cancelOrder,
  };
}
