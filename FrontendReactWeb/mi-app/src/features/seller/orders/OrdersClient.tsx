"use client";

// src/feature/orders/OrdersClient.tsx



import { useState, useCallback } from "react";

import { Order, OrderStatus } from "./types/order.types";

import T from "./theme/ordersTheme";



import { useOrders }       from "./hooks/useOrders";

import { useOrderFilters } from "./hooks/useOrderFilters";



import OrdersHeader  from "./sections/OrdersHeader";

import OrdersStats   from "./sections/OrdersStats";

import OrdersFilters from "./sections/OrdersFilters";

import OrdersTable   from "./sections/OrdersTable";

import Toast         from "./ui/Toast";

import DetailModal   from "./ui/DetailModal";
import NewOrderModal from "./ui/NewOrderModal";

import { Sidebar } from "../dashboard/dashboards";
import { NAV_ITEMS } from "../dashboard/data/chart.data";
import { dashboardTheme, globalStyles } from "../dashboard/theme/dashboard.theme";



type ToastType = "success" | "error" | "warning" | "info";



interface ToastState {

  msg:  string;

  type: ToastType;

}



const TOAST_MSG: Record<OrderStatus, string> = {

  sent:      "Marcado como enviado",

  delivered: "Marcado como entregado",

  pending:   "Vuelto a pendiente",

  cancelled: "Envio cancelado",

};



export default function OrdersClient() {

  const { orders, loading, error, updateStatus, removeOrder, reload, createNewOrder } = useOrders();

  const { filter, setFilter, search, setSearch, filtered, counts } =

    useOrderFilters(orders);



  const [toast,  setToast]  = useState<ToastState | null>(null);

  const [detail, setDetail] = useState<Order | null>(null);
  const [newOpen, setNewOpen] = useState(false);



  const showToast = useCallback((msg: string, type: ToastType = "success") => {

    setToast({ msg, type });

    setTimeout(() => setToast(null), 2800);

  }, []);



  const handleStatus = useCallback((id: string, status: OrderStatus) => {

    updateStatus(id, status);

    showToast(TOAST_MSG[status], status === "cancelled" ? "error" : "success");

  }, [updateStatus, showToast]);



  const handleDelete = useCallback((id: string) => {

    removeOrder(id);

    showToast("Pedido eliminado", "error");

  }, [removeOrder, showToast]);

  const handleCreate = useCallback(async (payload: {
    client: string;
    product: string;
    qty: number;
    price_unit: number;
    phone?: string;
    address?: string;
    email?: string;
  }) => {
    const res = await createNewOrder(payload);
    if (res.ok) {
      showToast("Pedido creado", "success");
    } else {
      showToast("No se pudo crear el pedido", "error");
    }
    return res;
  }, [createNewOrder, showToast]);



  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
        background: T.bgMain,
        color: T.text1,
      }}
    >
      <style>{globalStyles(dashboardTheme)}</style>
      <Sidebar navItems={NAV_ITEMS} />

      <main style={{ flex: 1, overflow: "auto", padding: "32px" }}>
        <OrdersHeader totalOrders={orders.length} onNew={() => setNewOpen(true)} />
        {loading && (
          <div style={{ background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 12, padding: "16px 20px", marginBottom: 16 }}>
            Cargando pedidos...
          </div>
        )}
        {error && (
          <div style={{ background: "#FEE2E2", border: "1px solid #EF4444", borderRadius: 12, padding: "12px 16px", marginBottom: 16, color: "#991B1B", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
            <span>{error}</span>
            <button
              onClick={() => reload()}
              style={{
                background: "#EF4444",
                color: "#fff",
                border: "none",
                borderRadius: 8,
                padding: "6px 12px",
                fontSize: 12,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Reintentar
            </button>
          </div>
        )}
        <OrdersStats  orders={orders} />
        <OrdersFilters
          counts={counts}
          filter={filter}   setFilter={setFilter}
          search={search}   setSearch={setSearch}
        />
        <OrdersTable
          orders={filtered}
          onStatus={handleStatus}
          onDelete={handleDelete}
          onView={setDetail}
        />
      </main>

      {toast  && <Toast msg={toast.msg} type={toast.type} />}

      <DetailModal
        order={detail}
        onClose={() => setDetail(null)}
        onStatus={(id, st) => { handleStatus(id, st); setDetail(null); }}
      />

      {newOpen && (
        <NewOrderModal
          onClose={() => setNewOpen(false)}
          onCreate={handleCreate}
        />
      )}
    </div>
  );


}
