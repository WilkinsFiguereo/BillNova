"use client";

import Link from "next/link";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { BrandLogo } from "@/components/BrandLogo";
import { useVerifyEmail } from "@/features/auth/login";

function VerifyEmailForm() {
  const search = useSearchParams();
  const initialEmail = search.get("email") ?? "";
  const initialToken = search.get("token") ?? "";
  const {
    email,
    cooldown,
    isLoading,
    isResending,
    error,
    message,
    setEmail,
    verify,
    resend,
  } = useVerifyEmail(initialEmail, initialToken);

  return (
    <main className="page">
      <section className="left">
        <div className="left-shape-1" aria-hidden />
        <div className="left-shape-2" aria-hidden />
        <div className="left-shape-3" aria-hidden />
        <div className="left-pattern" aria-hidden />

        <div className="brand">
          <div className="brand-icon" aria-hidden>
            <BrandLogo size={40} priority className="brand-logo-image" />
          </div>
          <p className="brand-name">
            Bill<span>Nova</span>
          </p>
        </div>

        <div className="hero">
          <div className="hero-badge">
            <span className="hero-badge-dot" />
            <span className="hero-badge-text">Verificacion</span>
          </div>
          <h1 className="hero-title">
            Activa tu <em>cuenta</em> desde el correo.
          </h1>
          <p className="hero-desc">
            Odoo te envio un mensaje con un boton de verificacion. Cuando abras el enlace, podras activar tu usuario desde esta pantalla.
          </p>
        </div>

        <p className="left-foot">RF-03 Verificacion</p>
      </section>

      <section className="right">
        <div className="form-wrap">
          <div className="mob-brand">
            <div className="mob-brand-icon" aria-hidden>
              <BrandLogo size={32} className="brand-logo-image" />
            </div>
            <p className="mob-brand-name">
              Bill<span>Nova</span>
            </p>
          </div>

          <header className="fh">
            <div className="fh-step">
              <span>Verificar</span>
              <span className="fh-step-line" />
              <span>RF-03</span>
            </div>
            <h2 className="fh-title">Verifica tu correo</h2>
            <p className="fh-sub">Usa el enlace recibido por email o solicita uno nuevo.</p>
          </header>

          <div className="card">
            <div className="card-accent" aria-hidden />
            <div className="card-body">
              <div className="field">
                <label className="field-label" htmlFor="email">Email</label>
                <div className="field-wrap">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input"
                    placeholder="tu@email.com"
                  />
                </div>
              </div>

              <div className="info-box" style={{ marginTop: 16, marginBottom: 16 }}>
                <p className="info-box-text">
                  {initialToken
                    ? "El enlace de activacion ya esta cargado. Presiona el boton para confirmar tu cuenta."
                    : "Si aun no abriste el correo, puedes reenviarlo desde aqui."}
                </p>
              </div>

              <button type="button" onClick={verify} disabled={isLoading} className="btn-submit">
                {isLoading ? "Verificando..." : "Activar mi cuenta"}
              </button>

              <button
                type="button"
                onClick={resend}
                disabled={isResending || cooldown > 0}
                className="btn-submit"
                style={{
                  width: "100%",
                  marginTop: 10,
                  background: "transparent",
                  color: "var(--text-300)",
                  border: "1px solid var(--border)",
                  boxShadow: "none",
                }}
              >
                {cooldown > 0 ? `Reenviar en ${cooldown}s` : isResending ? "Reenviando..." : "Reenviar correo"}
              </button>

              {error && <p className="field-err show">{error}</p>}
              {message && <p style={{ color: "#34D399", fontSize: 12, marginTop: 8 }}>{message}</p>}

              <p className="terms" style={{ marginTop: "1rem" }}>
                <Link href="/navigation/auth/register">Volver al registro</Link> ·{" "}
                <Link href="/navigation/auth/login">Ir a login</Link>
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div style={{ padding: 40, textAlign: "center" }}>Cargando...</div>}>
      <VerifyEmailForm />
    </Suspense>
  );
}
