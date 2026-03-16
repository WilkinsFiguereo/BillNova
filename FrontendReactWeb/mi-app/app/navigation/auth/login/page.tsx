<<<<<<< HEAD
import Link from "next/link";

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-[#080b12] flex items-center justify-center p-4">
      <section className="w-full max-w-md rounded-[2px] border border-[#1a2235] bg-[#0d1117] p-8 text-center">
        <p className="mb-2 text-[10px] uppercase tracking-[0.3em] text-[#4f8ef7]">Acceso</p>
        <h1 className="mb-3 text-2xl font-light tracking-tight text-[#e4ebf5]">Login pendiente</h1>
        <p className="mb-6 text-sm text-[#7a8fa8]">
          La pantalla de inicio de sesión aún no está implementada.
        </p>
        <Link
          href="/register"
          className="inline-flex rounded-[2px] bg-[#4f8ef7] px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-[#080b12] transition-colors hover:bg-[#6ba3ff]"
        >
          Volver a registro
        </Link>
      </section>
    </main>
  );
}
=======
﻿"use client";

import Link from "next/link";
import { useLogin, useSession } from "@/features/auth";

export default function LoginPage() {
  const { user } = useSession();
  const { values, errors, isLoading, serverError, errorCode, verificationEmail, onFieldChange, onSubmit } = useLogin();

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
          <p className="brand-name">
            Bill<span>Nova</span>
          </p>
        </div>

        <div className="hero">
          <div className="hero-badge">
            <span className="hero-badge-dot" />
            <span className="hero-badge-text">Acceso seguro</span>
          </div>
          <h1 className="hero-title">
            Ingresa a tu <em>operacion</em> en BillNova.
          </h1>
          <p className="hero-desc">
            Controla instaladores, facturacion y sesiones con autenticacion reforzada desde un solo panel.
          </p>
        </div>

        <p className="left-foot">RF-05 Login</p>
      </section>

      <section className="right">
        <div className="form-wrap">
          <div className="mob-brand">
            <div className="mob-brand-icon" aria-hidden>
              <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
                <path d="M7 1L13 4v6L7 13 1 10V4L7 1z" stroke="#fff" strokeWidth="1.4" strokeLinejoin="round" />
              </svg>
            </div>
            <p className="mob-brand-name">
              Bill<span>Nova</span>
            </p>
          </div>

          <header className="fh">
            <div className="fh-step">
              <span>Inicio</span>
              <span className="fh-step-line" />
              <span>RF-05</span>
            </div>
            <h2 className="fh-title">Iniciar sesion</h2>
            <p className="fh-sub">Usuario + contrasena con persistencia de sesion.</p>
          </header>

          <div className="card">
            <div className="card-accent" aria-hidden />
            <div className="card-body">
              {user && (
                <div className="info-box" style={{ marginBottom: "0.875rem" }}>
                  <p className="info-box-text">
                    Sesion detectada para {user.email}. <Link href="/dashboard">Ir al panel</Link>
                  </p>
                </div>
              )}

              <form onSubmit={onSubmit} className="form" noValidate>
                <div className="field">
                  <label className="field-label" htmlFor="username">Usuario</label>
                  <div className="field-wrap">
                    <input
                      id="username"
                      name="username"
                      type="text"
                      value={values.username}
                      onChange={onFieldChange}
                      placeholder="usuario o correo"
                      className={`input${errors.username ? " err" : values.username ? " ok" : ""}`}
                    />
                  </div>
                  <p className={`field-err${errors.username ? " show" : ""}`}>{errors.username}</p>
                </div>

                <div className="field">
                  <label className="field-label" htmlFor="password">Contrasena</label>
                  <div className="field-wrap">
                    <input
                      id="password"
                      name="password"
                      type="password"
                      value={values.password}
                      onChange={onFieldChange}
                      placeholder="Tu contrasena"
                      className={`input${errors.password ? " err" : values.password ? " ok" : ""}`}
                    />
                  </div>
                  <p className={`field-err${errors.password ? " show" : ""}`}>{errors.password}</p>
                </div>

                <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.8rem", color: "var(--text-500)" }}>
                  <input name="rememberMe" type="checkbox" checked={values.rememberMe} onChange={onFieldChange} />
                  Recordarme
                </label>

                {serverError && (
                  <div className="alert show">
                    <p className="alert-msg">{serverError}</p>
                  </div>
                )}

                {errorCode === "ACCOUNT_NOT_VERIFIED" && verificationEmail && (
                  <p className="fh-sub" style={{ marginTop: "-0.5rem" }}>
                    <Link href={`/verify-email?email=${encodeURIComponent(verificationEmail)}`}>Verificar correo / reenviar codigo</Link>
                  </p>
                )}

                {errorCode === "ACCOUNT_DISABLED" && <p className="field-err show">Cuenta deshabilitada. Contacta soporte.</p>}

                <button type="submit" disabled={isLoading} className="btn-submit">
                  {isLoading ? "Validando..." : "Iniciar sesion"}
                </button>
              </form>

              <p className="terms" style={{ marginTop: "1rem" }}>
                <Link href="/forgot-password">Olvidaste tu contrasena?</Link> · <Link href="/register">Crear cuenta</Link>
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
>>>>>>> d5a70c78988b43655bd9da58bea46a376cb4ef8a
