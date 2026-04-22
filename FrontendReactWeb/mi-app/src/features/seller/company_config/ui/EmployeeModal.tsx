"use client";

import { useState, FormEvent } from "react";
import { X } from "lucide-react";
import { Employee } from "../types/company.types";
import T from "@/features/seller/company_config/theme/appTheme";

interface Props {
  employee?: Employee | null;
  onClose: () => void;
  onSave: (emp: Employee) => void;
}

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "9px 12px",
  borderRadius: 8, border: `1px solid ${T.border}`,
  fontSize: 13, color: T.text1, background: T.bgCard,
  outline: "none", fontFamily: "inherit",
};

const labelStyle: React.CSSProperties = {
  fontSize: 12, fontWeight: 600, color: T.text2,
  marginBottom: 5, display: "block",
};

export default function EmployeeModal({ employee, onClose, onSave }: Props) {
  const isEdit = Boolean(employee);

  const [form, setForm] = useState({
    name: employee?.name ?? "",
    email: employee?.email ?? "",
    phone: employee?.phone ?? "",
    password: "",
  });

  const set = (key: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const emp: Employee = {
      id: employee?.id ?? `EMP-${Date.now()}`,
      status: employee?.status ?? "disabled",
      name: form.name,
      email: form.email,
      role: "Trabajador",
      phone: form.phone,
      password: isEdit ? undefined : form.password,
    };
    onSave(emp);
    onClose();
  };

  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, zIndex: 500,
      background: "rgba(15,23,42,.45)",
      display: "flex", alignItems: "center", justifyContent: "center", padding: 16,
    }}>
      <div onClick={(e) => e.stopPropagation()} style={{
        background: T.bgCard, borderRadius: 16,
        width: "100%", maxWidth: 440,
        boxShadow: "0 24px 64px rgba(0,0,0,.2)", overflow: "hidden",
      }}>
        <div style={{ background: T.brand600, padding: "18px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ fontSize: 17, fontWeight: 700, color: "#fff" }}>
            {isEdit ? "Editar Trabajador" : "Nuevo Trabajador"}
          </div>
          <button onClick={onClose} style={{ background: "rgba(255,255,255,.15)", border: "none", borderRadius: 8, width: 32, height: 32, cursor: "pointer", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: "20px 24px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <div style={{ gridColumn: "1 / -1" }}>
              <label style={labelStyle}>Nombre completo</label>
              <input style={inputStyle} value={form.name} onChange={set("name")} required />
            </div>

            <div style={{ gridColumn: "1 / -1" }}>
              <label style={labelStyle}>Correo electronico</label>
              <input style={inputStyle} type="email" value={form.email} onChange={set("email")} required />
            </div>

            <div>
              <label style={labelStyle}>Rol</label>
              <div style={{ ...inputStyle, background: T.bgAlt, color: T.text2 }}>Trabajador</div>
            </div>

            <div>
              <label style={labelStyle}>Telefono</label>
              <input style={inputStyle} value={form.phone} onChange={set("phone")} />
            </div>

            {!isEdit ? (
              <div style={{ gridColumn: "1 / -1" }}>
                <label style={labelStyle}>Contrasena temporal</label>
                <input style={inputStyle} type="text" value={form.password} onChange={set("password")} required />
              </div>
            ) : null}
          </div>

          <p style={{ marginTop: 14, marginBottom: 0, fontSize: 12, color: T.text3 }}>
            El trabajador se crea inactivo y recibira un correo con sus credenciales.
          </p>

          <div style={{ display: "flex", gap: 10, marginTop: 20, justifyContent: "flex-end" }}>
            <button type="button" onClick={onClose} style={{
              padding: "9px 20px", borderRadius: 8, border: `1px solid ${T.border}`,
              background: T.bgAlt, fontSize: 13, fontWeight: 600, color: T.text2,
              cursor: "pointer", fontFamily: "inherit",
            }}>
              Cancelar
            </button>
            <button type="submit" style={{
              padding: "9px 20px", borderRadius: 8, border: "none",
              background: T.brand600, fontSize: 13, fontWeight: 600, color: "#fff",
              cursor: "pointer", fontFamily: "inherit",
            }}>
              {isEdit ? "Guardar cambios" : "Agregar trabajador"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
