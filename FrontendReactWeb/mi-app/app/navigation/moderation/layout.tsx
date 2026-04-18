"use client";

import type { ReactNode } from "react";
import { useRoleGuard } from "@/features/auth/login/hooks/useRoleGuard";

export default function ModerationLayout({ children }: { children: ReactNode }) {
  const { isLoading, hasAccess } = useRoleGuard("moderator");

  if (isLoading) {
    return (
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        background: "#f9fafb",
      }}>
        <div style={{ textAlign: "center" }}>
          <div style={{
            width: 40,
            height: 40,
            border: "3px solid #e5e7eb",
            borderTopColor: "#4f46e5",
            borderRadius: "50%",
            animation: "spin 1s linear infinite",
            margin: "0 auto 16px",
          }} />
          <p style={{ color: "#6b7280", fontSize: 14 }}>Verificando acceso...</p>
        </div>
      </div>
    );
  }

  if (!hasAccess) {
    return null;
  }

  return children;
}