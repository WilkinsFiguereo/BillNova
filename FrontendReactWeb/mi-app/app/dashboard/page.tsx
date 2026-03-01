"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useDeviceSessions, useSession } from "@/features/auth";

export default function DashboardPage() {
  const router = useRouter();
  const { user, isLoading, logout } = useSession();
  const { sessions, isLoading: loadingSessions, error, revoke } = useDeviceSessions();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) router.replace("/login");
  }, [isLoading, router, user]);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await logout();
    router.replace("/login");
  };

  const handleRevoke = async (sessionId: number) => {
    await revoke(sessionId);
  };

  if (isLoading) {
    return <main className="auth-page text-[#e4ebf5] flex items-center justify-center">Cargando sesion...</main>;
  }
  if (!user) return null;

  return (
    <main className="auth-page p-6">
      <div className="auth-card max-w-4xl mx-auto">
        <p className="auth-eyebrow">RF-07 / RF-08</p>
        <h1 className="auth-heading">Sesion activa</h1>
        <p className="auth-subheading">{user.name} ({user.email})</p>

        <div className="mt-5">
          <button onClick={handleLogout} disabled={isLoggingOut} className="auth-btn">
            {isLoggingOut ? "Cerrando sesion..." : "Cerrar sesion segura"}
          </button>
        </div>

        <div className="mt-8">
          <h2 className="auth-heading text-xl">Sesiones y dispositivos</h2>
          {loadingSessions && <p className="auth-subheading">Cargando sesiones...</p>}
          {error && <p className="auth-error">{error}</p>}

          <div className="mt-4 grid gap-3">
            {sessions.map((s) => (
              <div key={s.id} className="auth-note flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm text-[#dbe8ff]">{s.user_agent || "Dispositivo"}</p>
                  <p className="text-xs text-[#8ea8cb]">IP: {s.ip_address || "N/A"} | Expira: {s.expires_at || "N/A"}</p>
                </div>
                {!s.is_current ? (
                  <button className="auth-link" onClick={() => handleRevoke(s.id)}>
                    Cerrar sesion remota
                  </button>
                ) : (
                  <span className="text-xs text-[#9ce5b9]">Sesion actual</span>
                )}
              </div>
            ))}
            {!loadingSessions && sessions.length === 0 && <p className="auth-subheading">No hay otras sesiones activas.</p>}
          </div>
        </div>
      </div>
    </main>
  );
}
