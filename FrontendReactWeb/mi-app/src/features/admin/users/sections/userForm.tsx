"use client";
import React, { useState, useEffect } from "react";
import { colors, font, radius } from "../theme/tokens";
import {
  apiCreateResUser,
  apiUpdateResUser,
  apiGetResUser,
  apiCreateBillnovaUser,
  apiUpdateBillnovaUser,
  apiGetBillnovaUser,
} from "../data/userApi";

// ── Types ────────────────────────────────────────────────────────────────────

type Mode     = "create" | "edit" | "view";
type UserType = "res" | "billnova";

interface UserFormProps {
  mode:      Mode;
  userType:  UserType;
  userId?:   number;
  onSubmit:  () => Promise<void>;
  onCancel:  () => void;
}

interface FormData {
  name:   string;
  email:  string;
  role:   string;
  active: boolean;
}

const EMPTY: FormData = { name: "", email: "", role: "", active: true };

const RES_ROLES      = ["admin", "editor", "viewer"] as const;
const BILLNOVA_ROLES = ["admin", "billing", "support", "viewer"] as const;

// ── Styles ───────────────────────────────────────────────────────────────────

const label: React.CSSProperties = {
  display:      "block",
  fontSize:     font.sizes.sm,
  fontWeight:   font.weights.medium,
  color:        colors.text.secondary,
  marginBottom: 6,
  letterSpacing: "0.04em",
  textTransform: "uppercase",
};

const input = (disabled: boolean): React.CSSProperties => ({
  width:           "100%",
  padding:         "9px 12px",
  background:      disabled ? colors.bg.tertiary : colors.bg.secondary,
  border:          `1px solid ${colors.border}`,
  borderRadius:    radius.md,
  color:           disabled ? colors.text.tertiary : colors.text.primary,
  fontSize:        font.sizes.base,
  fontFamily:      font.family,
  outline:         "none",
  boxSizing:       "border-box",
  cursor:          disabled ? "not-allowed" : "text",
  transition:      "border-color .15s",
});

const btn = (variant: "primary" | "ghost"): React.CSSProperties => ({
  padding:      "9px 20px",
  borderRadius: radius.md,
  fontSize:     font.sizes.base,
  fontWeight:   font.weights.semibold,
  fontFamily:   font.family,
  cursor:       "pointer",
  border:       variant === "primary" ? "none" : `1px solid ${colors.border}`,
  background:   variant === "primary" ? colors.accent : "transparent",
  color:        variant === "primary" ? "#fff" : colors.text.secondary,
  transition:   "opacity .15s",
});

// ── Component ────────────────────────────────────────────────────────────────

export function UserForm({ mode, userType, userId, onSubmit, onCancel }: UserFormProps) {
  const [form,      setForm]      = useState<FormData>(EMPTY);
  const [saving,    setSaving]    = useState(false);
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState<string | null>(null);

  const isView    = mode === "view";
  const isCreate  = mode === "create";
  const roles     = userType === "res" ? RES_ROLES : BILLNOVA_ROLES;

  // Load user data when editing or viewing
  useEffect(() => {
    if ((mode === "edit" || mode === "view") && userId && userType) {
      setLoading(true);
      setError(null);
      (async () => {
        try {
          const user = userType === "res" 
            ? await apiGetResUser(userId)
            : await apiGetBillnovaUser(userId);
          
          if (user) {
            setForm({
              name: user.name,
              email: user.email,
              role: user.role,
              active: user.active,
            });
          }
        } catch (err: unknown) {
          setError(err instanceof Error ? err.message : "Error al cargar usuario.");
        } finally {
          setLoading(false);
        }
      })();
    } else if (isCreate) {
      setForm(EMPTY);
    }
  }, [mode, userId, userType, isCreate]);

  const set = (field: keyof FormData, value: string | boolean) =>
    setForm(prev => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!form.name.trim() || !form.email.trim() || !form.role) {
      setError("Nombre, email y rol son obligatorios.");
      return;
    }

    setSaving(true);
    try {
      if (userType === "res") {
        isCreate
          ? await apiCreateResUser(form)
          : await apiUpdateResUser(userId!, { ...form });
      } else {
        isCreate
          ? await apiCreateBillnovaUser(form)
          : await apiUpdateBillnovaUser(userId!, { ...form });
      }
      await onSubmit();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al guardar.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{
        textAlign: "center",
        padding: "24px",
        color: colors.text.tertiary,
        fontSize: font.sizes.base,
      }}>
        Cargando datos...
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>

      {/* Name */}
      <div>
        <label style={label}>Nombre</label>
        <input
          style={input(isView)}
          value={form.name}
          disabled={isView}
          placeholder="Nombre completo"
          onChange={e => set("name", e.target.value)}
        />
      </div>

      {/* Email */}
      <div>
        <label style={label}>Correo electrónico</label>
        <input
          type="email"
          style={input(isView)}
          value={form.email}
          disabled={isView}
          placeholder="usuario@ejemplo.com"
          onChange={e => set("email", e.target.value)}
        />
      </div>

      {/* Role */}
      <div>
        <label style={label}>Rol</label>
        <select
          style={{ ...input(isView), cursor: isView ? "not-allowed" : "pointer" }}
          value={form.role}
          disabled={isView}
          onChange={e => set("role", e.target.value)}
        >
          <option value="">— Seleccionar rol —</option>
          {roles.map(r => (
            <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>
          ))}
        </select>
      </div>

      {/* Active toggle */}
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <label style={{ ...label, margin: 0 }}>Activo</label>
        <input
          type="checkbox"
          checked={form.active}
          disabled={isView}
          onChange={e => set("active", e.target.checked)}
          style={{ width: 16, height: 16, accentColor: colors.accent, cursor: isView ? "not-allowed" : "pointer" }}
        />
      </div>

      {/* Error */}
      {error && (
        <p style={{
          margin:       0,
          fontSize:     font.sizes.sm,
          color:        colors.error,
          background:   colors.error + "18",
          padding:      "8px 12px",
          borderRadius: radius.md,
          border:       `1px solid ${colors.error}44`,
        }}>
          {error}
        </p>
      )}

      {/* Actions */}
      {!isView && (
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 4 }}>
          <button type="button" style={btn("ghost")} onClick={onCancel} disabled={saving}>
            Cancelar
          </button>
          <button type="submit" style={{ ...btn("primary"), opacity: saving ? 0.6 : 1 }} disabled={saving}>
            {saving ? "Guardando…" : isCreate ? "Crear usuario" : "Guardar cambios"}
          </button>
        </div>
      )}

      {isView && (
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <button type="button" style={btn("ghost")} onClick={onCancel}>
            Cerrar
          </button>
        </div>
      )}
    </form>
  );
}