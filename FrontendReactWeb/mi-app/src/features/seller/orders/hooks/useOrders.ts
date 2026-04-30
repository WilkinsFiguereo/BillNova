"use client";
// src/feature/orders/hooks/useOrders.ts

import { useState, useCallback, useEffect } from "react";
import { getOrderStateForStatus, Order, OrderStatus } from "../types/order.types";
import { fetchOrders, updateOrderStatus, deleteOrder, createOrder } from "../data/orderService";
import mockOrders from "../data/mockOrders";

export function useOrders() {
  const [orders, setOrders]     = useState<Order[]>([]);
  const [loading, setLoading]   = useState<boolean>(false);
  const [error,   setError]     = useState<string | null>(null);

  const loadOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchOrders();
      setOrders(data);
    } catch (err) {
      console.error(err);
      setOrders(mockOrders);
      setError("No se pudieron cargar pedidos reales, mostrando demo.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadOrders();
  }, [loadOrders]);

  const updateStatus = useCallback(async (id: string, status: OrderStatus) => {
    setOrders((prev) =>
      prev.map((o) => (
        o.id === id
          ? { ...o, status, orderState: getOrderStateForStatus(status) }
          : o
      ))
    );
    try {
      await updateOrderStatus(id, status);
    } catch (err) {
      console.error(err);
      setError("No se pudo actualizar estado.");
    }
  }, []);

  const removeOrder = useCallback(async (id: string) => {
    setOrders((prev) => prev.filter((o) => o.id !== id));
    try {
      await deleteOrder(id);
    } catch (err) {
      console.error(err);
      setError("No se pudo eliminar el pedido.");
    }
  }, []);

  const addOrder = useCallback((order: Order) => {
    setOrders((prev) => [order, ...prev]);
  }, []);

  const createNewOrder = useCallback(async (payload: {
    client: string;
    product: string;
    qty: number;
    price_unit: number;
    phone?: string;
    address?: string;
    email?: string;
  }) => {
    try {
      const created = await createOrder(payload);
      setOrders((prev) => [created, ...prev]);
      return { ok: true as const, order: created };
    } catch (err) {
      console.error(err);
      setError("No se pudo crear el pedido.");
      return { ok: false as const };
    }
  }, []);

  return { orders, loading, error, updateStatus, removeOrder, addOrder, createNewOrder, reload: loadOrders };
}
