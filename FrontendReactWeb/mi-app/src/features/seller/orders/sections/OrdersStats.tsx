"use client";
// src/feature/orders/sections/OrdersStats.tsx

import { Order } from "../types/order.types";
import T from "../theme/ordersTheme";
import StatCard from "../ui/StatCard";

interface Props {
  orders: Order[];
}

export default function OrdersStats({ orders }: Props) {
  const pending   = orders.filter((o) => o.status === "pending").length;
  const sent      = orders.filter((o) => o.status === "sent").length;
  const delivered = orders.filter((o) => o.status === "delivered").length;
  const revenue   = orders
    .filter((o) => o.status !== "cancelled")
    .reduce((acc, o) => acc + o.total, 0);

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 14, marginBottom: 24 }}>
      <StatCard label="Ingresos est." value={`RD$ ${revenue.toLocaleString()}`} icon="💰" accent={T.brand400} trend="pedidos activos" />
      <StatCard label="Pendientes"    value={pending}                           icon="⏳" accent={T.warn}     trend="por procesar"   />
      <StatCard label="En camino"     value={sent}                              icon="🚚" accent={T.brand400} trend="enviados"        />
      <StatCard label="Entregados"    value={delivered}                         icon="✅" accent={T.success}  trend="completados"    />
    </div>
  );
}