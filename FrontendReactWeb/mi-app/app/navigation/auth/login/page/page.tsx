"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLogin } from "@/features/auth/login";
import { getStoredAuthState } from "@/features/auth/login/data/storage";
import { getLandingRouteForRole } from "@/features/auth/login/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const ranRef = useRef(false);
  const { values, errors, isLoading, serverError, onFieldChange, onSubmit } = useLogin();

  useEffect(() => {
    if (ranRef.current) return;
    ranRef.current = true;

    const cached = getStoredAuthState();
    if (cached?.uid) {
      router.replace(getLandingRouteForRole(cached.role));
    } else {
      setReady(true);
    }
  }, [router]);

  if (!ready) {
    return (
      <main className="page">
        <section className="right">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh" }}>
            <p style={{ color: "#6b7280" }}>Verificando...</p>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="page">
      <section className="left">
        <div className="left-shape-1" aria-hidden />
        <div className="left-shape-2" aria-hidden />
        <div className="left-shape-3" aria-hidden />
        <div className="left-pattern" aria-hidden />
        <div className="brand">
          <div className="brand-icon" aria-hidden>
            <svg width="16" height="16" viewBox="0 0 14 14" fill="none">
              <path d="M7 1L13 4v6L7 13 1 10V4L7 1z" stroke="#fff" strokeWidth="1.4" strokeLinejoin="round" />
            </svg>
          </div>
          <p className="brand-name">Bill<span>Nova</span></p>
        </div>
        <div className="hero">
          <h1 className="hero-title">Ingresa a BillNova</h1>
        </div>
        <p className="left-foot">Login</p>
      </section>
      <section className="right">
        <div className="form-wrap">
          <div className="card">
            <div className="card-body">
              <form onSubmit={onSubmit} noValidate>
                <div className="field">
                  <label htmlFor="username">Usuario</label>
                  <input
                    id="username"
                    name="username"
                    type="text"
                    value={values.username}
                    onChange={onFieldChange}
                    placeholder="Usuario"
                  />
                </div>
                <div className="field">
                  <label htmlFor="password">Clave</label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    value={values.password}
                    onChange={onFieldChange}
                    placeholder="Clave"
                  />
                </div>
                {serverError && <p style={{ color: "red" }}>{serverError}</p>}
                <button type="submit" disabled={isLoading}>
                  {isLoading ? "Entrando..." : "Entrar"}
                </button>
              </form>
              <p><Link href="/register">Crear cuenta</Link></p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
