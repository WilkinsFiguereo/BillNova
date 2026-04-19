"use client";

import React from "react";
import type { RegisterFormState } from "../types/register.types";

interface RegisterFormSectionProps {
  state: RegisterFormState;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}

export function RegisterFormSection({ state, onChange, onSubmit }: RegisterFormSectionProps) {
  const { values, errors, isLoading, serverError } = state;

  return (
    <form onSubmit={onSubmit} style={{ display: "grid", gap: 12 }}>
      <label style={{ display: "grid", gap: 6 }}>
        Nombre
        <input name="name" value={values.name} onChange={onChange} />
        {errors.name && <small style={{ color: "#DC2626" }}>{errors.name}</small>}
      </label>

      <label style={{ display: "grid", gap: 6 }}>
        Email
        <input name="email" type="email" value={values.email} onChange={onChange} />
        {errors.email && <small style={{ color: "#DC2626" }}>{errors.email}</small>}
      </label>

      <label style={{ display: "grid", gap: 6 }}>
        Usuario
        <input name="username" value={values.username} onChange={onChange} />
        {errors.username && <small style={{ color: "#DC2626" }}>{errors.username}</small>}
      </label>

      <label style={{ display: "grid", gap: 6 }}>
        Contraseña
        <input name="password" type="password" value={values.password} onChange={onChange} />
        {errors.password && <small style={{ color: "#DC2626" }}>{errors.password}</small>}
      </label>

      {serverError && (
        <div style={{ padding: 10, background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 10, color: "#991B1B" }}>
          {serverError}
        </div>
      )}

      <button type="submit" disabled={isLoading} style={{ padding: "10px 12px" }}>
        {isLoading ? "Enviando..." : "Crear cuenta"}
      </button>
    </form>
  );
}

