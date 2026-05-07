"use client";

import React, { useEffect, useState } from "react";
import { colors, font, radius } from "../theme/tokens";
import {
  apiCreateBillnovaUser,
  apiCreateResUser,
  apiGetBillnovaUser,
  apiGetResUser,
  apiUpdateBillnovaUser,
  apiUpdateResUser,
} from "../data/userApi";
import type { AdminUserType } from "../types/user.types";

type Mode = "create" | "edit" | "view";

interface UserFormProps {
  mode: Mode;
  userType: AdminUserType;
  userId?: number;
  onSubmit: () => Promise<void>;
  onCancel: () => void;
}

interface FormData {
  name: string;
  login: string;
  email: string;
  password: string;
  role: string;
  active: boolean;
  phone: string;
  address: string;
  isMobileUser: boolean;
}

const NAME_MAX_LENGTH = 50;
const LOGIN_MAX_LENGTH = 20;
const PASSWORD_MAX_LENGTH = 20;
const PHONE_MAX_LENGTH = 20;
const ADDRESS_MAX_LENGTH = 150;

const EMPTY: FormData = {
  name: "",
  login: "",
  email: "",
  password: "",
  role: "",
  active: true,
  phone: "",
  address: "",
  isMobileUser: false,
};

const RES_ROLES = ["admin", "moderation", "seller", "user"] as const;
const BILLNOVA_ROLES = ["admin", "moderation", "seller", "user"] as const;

const label: React.CSSProperties = {
  display: "block",
  fontSize: font.sizes.sm,
  fontWeight: font.weights.medium,
  color: colors.text.secondary,
  marginBottom: 6,
  letterSpacing: "0.04em",
  textTransform: "uppercase",
};

const inputStyle = (disabled: boolean): React.CSSProperties => ({
  width: "100%",
  padding: "9px 12px",
  background: disabled ? colors.bg.tertiary : colors.bg.secondary,
  border: `1px solid ${colors.border}`,
  borderRadius: radius.md,
  color: disabled ? colors.text.tertiary : colors.text.primary,
  fontSize: font.sizes.base,
  fontFamily: font.family,
  outline: "none",
  boxSizing: "border-box",
  cursor: disabled ? "not-allowed" : "text",
  transition: "border-color .15s",
});

const btn = (variant: "primary" | "ghost"): React.CSSProperties => ({
  padding: "9px 20px",
  borderRadius: radius.md,
  fontSize: font.sizes.base,
  fontWeight: font.weights.semibold,
  fontFamily: font.family,
  cursor: "pointer",
  border: variant === "primary" ? "none" : `1px solid ${colors.border}`,
  background: variant === "primary" ? colors.accent : "transparent",
  color: variant === "primary" ? "#fff" : colors.text.secondary,
});

function normalizeRole(role: string) {
  const normalized = role.trim().toLowerCase();
  return normalized || "user";
}

export function UserForm({ mode, userType, userId, onSubmit, onCancel }: UserFormProps) {
  const [form, setForm] = useState<FormData>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isView = mode === "view";
  const isCreate = mode === "create";
  const roles = userType === "res" ? RES_ROLES : BILLNOVA_ROLES;

  useEffect(() => {
    let active = true;

    async function loadUser() {
      if ((mode !== "edit" && mode !== "view") || !userId) {
        setForm(EMPTY);
        setError(null);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        if (userType === "res") {
          const user = await apiGetResUser(userId);
          if (!active) return;
          setForm({
            name: user.name,
            login: user.login,
            email: user.email,
            password: "",
            role: user.role,
            active: user.active,
            phone: "",
            address: "",
            isMobileUser: false,
          });
        } else {
          const user = await apiGetBillnovaUser(userId);
          if (!active) return;
          setForm({
            name: user.name,
            login: user.login,
            email: user.email,
            password: "",
            role: user.role,
            active: user.active,
            phone: user.phone || "",
            address: user.address || "",
            isMobileUser: user.is_mobile_user ?? false,
          });
        }
      } catch (err: unknown) {
        if (active) {
          setError(err instanceof Error ? err.message : "Error al cargar usuario.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadUser();
    return () => {
      active = false;
    };
  }, [mode, userId, userType]);

  const setField = (field: keyof FormData, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setError(null);
  };

  const validate = () => {
    if (!form.name.trim() || !form.email.trim() || !form.role) {
      setError("Nombre, correo y rol son obligatorios.");
      return false;
    }
    if (form.name.trim().length > NAME_MAX_LENGTH) {
      setError(`Maximo ${NAME_MAX_LENGTH} caracteres en nombre.`);
      return false;
    }
    if (userType === "res" && (!form.login.trim() || form.login.trim().length > LOGIN_MAX_LENGTH)) {
      setError(`Usuario maximo ${LOGIN_MAX_LENGTH} caracteres.`);
      return false;
    }
    if (form.password.length > PASSWORD_MAX_LENGTH) {
      setError(`Contrasena maximo ${PASSWORD_MAX_LENGTH} caracteres.`);
      return false;
    }
    if (form.phone.length > PHONE_MAX_LENGTH) {
      setError(`Telefono maximo ${PHONE_MAX_LENGTH} caracteres.`);
      return false;
    }
    if (form.address.length > ADDRESS_MAX_LENGTH) {
      setError(`Direccion maximo ${ADDRESS_MAX_LENGTH} caracteres.`);
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validate()) return;

    setSaving(true);
    try {
      if (userType === "res") {
        if (isCreate) {
          await apiCreateResUser({
            name: form.name.trim(),
            login: form.login.trim().toLowerCase(),
            email: form.email.trim().toLowerCase(),
            password: form.password || undefined,
            role: normalizeRole(form.role),
            active: form.active,
          });
        } else if (userId) {
          await apiUpdateResUser(userId, {
            name: form.name.trim(),
            login: form.login.trim().toLowerCase(),
            email: form.email.trim().toLowerCase(),
            password: form.password || undefined,
            role: normalizeRole(form.role),
            active: form.active,
          });
        }
      } else {
        if (isCreate) {
          await apiCreateBillnovaUser({
            name: form.name.trim(),
            email: form.email.trim().toLowerCase(),
            password: form.password || undefined,
            role: normalizeRole(form.role),
            active: form.active,
            phone: form.phone.trim(),
            address: form.address.trim(),
            is_mobile_user: form.isMobileUser,
          });
        } else if (userId) {
          await apiUpdateBillnovaUser(userId, {
            name: form.name.trim(),
            email: form.email.trim().toLowerCase(),
            password: form.password || undefined,
            role: normalizeRole(form.role),
            active: form.active,
            phone: form.phone.trim(),
            address: form.address.trim(),
            is_mobile_user: form.isMobileUser,
          });
        }
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
      <div style={{ textAlign: "center", padding: "24px", color: colors.text.tertiary, fontSize: font.sizes.base }}>
        Cargando datos...
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
          gap: 14,
        }}
      >
        <div>
          <label style={label}>Nombre</label>
          <input
            style={inputStyle(isView)}
            value={form.name}
            disabled={isView}
            maxLength={NAME_MAX_LENGTH}
            placeholder="Nombre completo"
            onChange={(e) => setField("name", e.target.value)}
          />
        </div>

        {userType === "res" && (
          <div>
            <label style={label}>Usuario</label>
            <input
              style={inputStyle(isView)}
              value={form.login}
              disabled={isView}
              maxLength={LOGIN_MAX_LENGTH}
              placeholder="usuario"
              onChange={(e) => setField("login", e.target.value)}
            />
          </div>
        )}

        <div>
          <label style={label}>Correo</label>
          <input
            type="email"
            style={inputStyle(isView)}
            value={form.email}
            disabled={isView}
            placeholder="usuario@ejemplo.com"
            onChange={(e) => setField("email", e.target.value)}
          />
        </div>

        <div>
          <label style={label}>Rol</label>
          <select
            style={{ ...inputStyle(isView), cursor: isView ? "not-allowed" : "pointer" }}
            value={form.role}
            disabled={isView}
            onChange={(e) => setField("role", e.target.value)}
          >
            <option value="">Seleccionar rol</option>
            {roles.map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label style={label}>{isCreate ? "Contrasena" : "Nueva contrasena"}</label>
          <input
            type="password"
            style={inputStyle(isView)}
            value={form.password}
            disabled={isView}
            maxLength={PASSWORD_MAX_LENGTH}
            placeholder={isCreate ? "Contrasena" : "Dejar vacio para mantener"}
            onChange={(e) => setField("password", e.target.value)}
          />
        </div>

        {userType === "billnova" && (
          <>
            <div>
              <label style={label}>Telefono</label>
              <input
                style={inputStyle(isView)}
                value={form.phone}
                disabled={isView}
                maxLength={PHONE_MAX_LENGTH}
                placeholder="Telefono"
                onChange={(e) => setField("phone", e.target.value)}
              />
            </div>

            <div style={{ gridColumn: "1 / -1" }}>
              <label style={label}>Direccion</label>
              <textarea
                style={{ ...inputStyle(isView), minHeight: 88, resize: "vertical" }}
                value={form.address}
                disabled={isView}
                maxLength={ADDRESS_MAX_LENGTH}
                placeholder="Direccion"
                onChange={(e) => setField("address", e.target.value)}
              />
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <label style={{ ...label, margin: 0 }}>Usuario movil</label>
              <input
                type="checkbox"
                checked={form.isMobileUser}
                disabled={isView}
                onChange={(e) => setField("isMobileUser", e.target.checked)}
                style={{ width: 16, height: 16, accentColor: colors.accent, cursor: isView ? "not-allowed" : "pointer" }}
              />
            </div>
          </>
        )}

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <label style={{ ...label, margin: 0 }}>Activo</label>
          <input
            type="checkbox"
            checked={form.active}
            disabled={isView}
            onChange={(e) => setField("active", e.target.checked)}
            style={{ width: 16, height: 16, accentColor: colors.accent, cursor: isView ? "not-allowed" : "pointer" }}
          />
        </div>
      </div>

      {error && (
        <p
          style={{
            margin: 0,
            fontSize: font.sizes.sm,
            color: colors.error,
            background: colors.error + "18",
            padding: "8px 12px",
            borderRadius: radius.md,
            border: `1px solid ${colors.error}44`,
          }}
        >
          {error}
        </p>
      )}

      {!isView && (
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 4 }}>
          <button type="button" style={btn("ghost")} onClick={onCancel} disabled={saving}>
            Cancelar
          </button>
          <button type="submit" style={{ ...btn("primary"), opacity: saving ? 0.6 : 1 }} disabled={saving}>
            {saving ? "Guardando..." : isCreate ? "Crear usuario" : "Guardar cambios"}
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
