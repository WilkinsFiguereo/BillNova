"use client";

import { useState, FormEvent } from "react";
import { X } from "lucide-react";
import T from "../theme/ordersTheme";

interface Props {
  onClose: () => void;
  onCreate: (payload: {
    client: string;
    product: string;
    qty: number;
    price_unit: number;
    phone?: string;
    address?: string;
    email?: string;
  }) => Promise<{ ok: boolean }>;
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "9px 12px",
  borderRadius: 8,
  border: `1px solid ${T.border}`,
  fontSize: 13,
  color: T.text1,
  background: T.bgCard,
  outline: "none",
  fontFamily: "inherit",
};

const labelStyle: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 600,
  color: T.text2,
  marginBottom: 5,
  display: "block",
};

export default function NewOrderModal({ onClose, onCreate }: Props) {
  const [form, setForm] = useState({
    client: "",
    product: "",
    qty: 1,
    price_unit: 0,
    phone: "",
    address: "",
    email: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = (key: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.type === "number" ? Number(e.target.value) : e.target.value;
      setForm((prev) => ({ ...prev, [key]: value }));
      setError(null);
    };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.client.trim() || !form.product.trim() || form.qty <= 0) {
      setError("Cliente, producto y cantidad son requeridos.");
      return;
    }
    setLoading(true);
    const res = await onCreate({
      client: form.client.trim(),
      product: form.product.trim(),
      qty: Number(form.qty),
      price_unit: Number(form.price_unit || 0),
      phone: form.phone.trim() || undefined,
      address: form.address.trim() || undefined,
      email: form.email.trim() || undefined,
    });
    setLoading(false);
    if (res.ok) onClose();
    else setError("No se pudo crear el pedido.");
  };

  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, zIndex: 500,
      background: "rgba(15,23,42,.45)",
      display: "flex", alignItems: "center", justifyContent: "center", padding: 16,
    }}>
      <div onClick={(e) => e.stopPropagation()} style={{
        background: T.bgCard, borderRadius: 16,
        width: "100%", maxWidth: 540,
        boxShadow: "0 24px 64px rgba(0,0,0,.2)", overflow: "hidden",
      }}>
        <div style={{ background: T.brand600, padding: "18px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ fontSize: 17, fontWeight: 700, color: "#fff" }}>
            Nuevo Pedido
          </div>
          <button onClick={onClose} style={{ background: "rgba(255,255,255,.15)", border: "none", borderRadius: 8, width: 32, height: 32, cursor: "pointer", color: "#fff", fontSize: 16, fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center" }}><X size={16} /></button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: "20px 24px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <div style={{ gridColumn: "1 / -1" }}>
              <label style={labelStyle}>Cliente</label>
              <input style={inputStyle} value={form.client} onChange={set("client")} required />
            </div>

            <div style={{ gridColumn: "1 / -1" }}>
              <label style={labelStyle}>Producto</label>
              <input style={inputStyle} value={form.product} onChange={set("product")} required />
            </div>

            <div>
              <label style={labelStyle}>Cantidad</label>
              <input style={inputStyle} type="number" min={1} value={form.qty} onChange={set("qty")} required />
            </div>

            <div>
              <label style={labelStyle}>Precio unitario</label>
              <input style={inputStyle} type="number" min={0} step="0.01" value={form.price_unit} onChange={set("price_unit")} />
            </div>

            <div>
              <label style={labelStyle}>Teléfono</label>
              <input style={inputStyle} value={form.phone} onChange={set("phone")} />
            </div>

            <div>
              <label style={labelStyle}>Correo</label>
              <input style={inputStyle} type="email" value={form.email} onChange={set("email")} />
            </div>

            <div style={{ gridColumn: "1 / -1" }}>
              <label style={labelStyle}>Dirección</label>
              <input style={inputStyle} value={form.address} onChange={set("address")} />
            </div>
          </div>

          {error && (
            <div style={{ marginTop: 12, background: "#FEE2E2", color: "#991B1B", borderRadius: 8, padding: "8px 10px", fontSize: 12 }}>
              {error}
            </div>
          )}

          <div style={{ display: "flex", gap: 10, marginTop: 20, justifyContent: "flex-end" }}>
            <button type="button" onClick={onClose} style={{
              padding: "9px 20px", borderRadius: 8, border: `1px solid ${T.border}`,
              background: T.bgAlt, fontSize: 13, fontWeight: 600, color: T.text2,
              cursor: "pointer", fontFamily: "inherit",
            }}>
              Cancelar
            </button>
            <button type="submit" disabled={loading} style={{
              padding: "9px 20px", borderRadius: 8, border: "none",
              background: loading ? T.brand400 : T.brand600, fontSize: 13, fontWeight: 600, color: "#fff",
              cursor: loading ? "not-allowed" : "pointer", fontFamily: "inherit",
            }}>
              {loading ? "Creando..." : "Crear pedido"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
