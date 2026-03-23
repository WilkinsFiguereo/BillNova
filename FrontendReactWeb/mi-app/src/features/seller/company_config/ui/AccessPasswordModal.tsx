"use client";

import { useState, FormEvent } from "react";
import { X, Lock } from "lucide-react";
import T from "@/features/seller/company_config/theme/appTheme";

interface Props {
  onClose: () => void;
  onConfirm: (password: string) => void;
  isLoading?: boolean;
  error?: string | null;
}

export default function AccessPasswordModal({ onClose, onConfirm, isLoading, error }: Props) {
  const [password, setPassword] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onConfirm(password);
  };

  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, zIndex: 500,
      background: "rgba(15,23,42,.45)",
      display: "flex", alignItems: "center", justifyContent: "center", padding: 16,
    }}>
      <div onClick={(e) => e.stopPropagation()} style={{
        background: T.bgCard, borderRadius: 16,
        width: "100%", maxWidth: 420,
        boxShadow: "0 24px 64px rgba(0,0,0,.2)", overflow: "hidden",
      }}>
        <div style={{ background: T.brand600, padding: "18px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ fontSize: 17, fontWeight: 700, color: "#fff", display: "flex", alignItems: "center", gap: 8 }}>
            <Lock size={16} /> Acceso requerido
          </div>
          <button onClick={onClose} style={{ background: "rgba(255,255,255,.15)", border: "none", borderRadius: 8, width: 32, height: 32, cursor: "pointer", color: "#fff", fontSize: 16, fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center" }}><X size={16} /></button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: "20px 24px" }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: T.text2, marginBottom: 6, display: "block" }}>
            Contraseña de acceso
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{
              width: "100%", padding: "9px 12px",
              borderRadius: 8, border: `1px solid ${T.border}`,
              fontSize: 13, color: T.text1, background: T.bgCard,
              outline: "none", fontFamily: "inherit", marginBottom: 10,
            }}
          />

          {error && (
            <div style={{
              background: T.errorBg, color: T.error,
              borderRadius: 8, padding: "8px 10px", fontSize: 12, marginBottom: 10,
            }}>
              {error}
            </div>
          )}

          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <button type="button" onClick={onClose} style={{
              padding: "9px 20px", borderRadius: 8, border: `1px solid ${T.border}`,
              background: T.bgAlt, fontSize: 13, fontWeight: 600, color: T.text2,
              cursor: "pointer", fontFamily: "inherit",
            }}>
              Cancelar
            </button>
            <button type="submit" disabled={isLoading} style={{
              padding: "9px 20px", borderRadius: 8, border: "none",
              background: isLoading ? T.brand400 : T.brand600, fontSize: 13, fontWeight: 600, color: "#fff",
              cursor: isLoading ? "not-allowed" : "pointer", fontFamily: "inherit",
            }}>
              {isLoading ? "Validando..." : "Continuar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
