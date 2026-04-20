"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useVerifyEmail } from "@/features/auth/login";

function VerifyEmailContent() {
  const search = useSearchParams();
  const initialEmail = search.get("email") ?? "";
  const {
    email,
    code,
    cooldown,
    isLoading,
    isResending,
    error,
    message,
    devCode,
    setEmail,
    setCode,
    verify,
    resend,
  } = useVerifyEmail(initialEmail);

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
            <span className="hero-badge-text">Verificacion segura</span>
          </div>
          <h1 className="hero-title">
            Confirma tu <em>correo</em> para activar la cuenta.
          </h1>
          <p className="hero-desc">
            Te enviamos un codigo OTP para validar el acceso. Esto protege tu cuenta y tu empresa.
          </p>
        </div>

        <p className="left-foot">RF-03 Verificacion</p>
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
              <span>Verificacion</span>
              <span className="fh-step-line" />
              <span>RF-03</span>
            </div>
            <h2 className="fh-title">Verifica tu correo</h2>
            <p className="fh-sub">Ingresa el codigo OTP recibido por email.</p>
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
                  />
                </div>
              </div>

              <div className="field">
                <label className="field-label" htmlFor="code">Codigo</label>
                <div className="field-wrap">
                  <input
                    id="code"
                    name="code"
                    type="text"
                    maxLength={8}
                    placeholder="123456"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="input"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={verify}
                disabled={isLoading}
                className="btn-submit"
              >
                {isLoading ? "Verificando..." : "Verificar cuenta"}
              </button>

              <button
                type="button"
                onClick={resend}
                disabled={isResending || cooldown > 0}
                className="btn-submit"
                style={{ width: "100%", marginTop: 10, background: "transparent", color: "var(--text-300)", border: "1px solid var(--stroke-200)" }}
              >
                {cooldown > 0 ? `Reenviar en ${cooldown}s` : isResending ? "Reenviando..." : "Reenviar codigo"}
              </button>

              {error && <p className="field-err show">{error}</p>}
              {message && <p style={{ color: "#34D399", fontSize: 12, marginTop: 8 }}>{message}</p>}
              {devCode && <p style={{ color: "var(--text-300)", fontSize: 12, marginTop: 6 }}>Codigo de desarrollo: {devCode}</p>}

              <p className="terms" style={{ marginTop: "1rem" }}>
                <Link href="/navigation/auth/register/page">Volver al registro</Link>
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
    <Suspense fallback={null}>
      <VerifyEmailContent />
    </Suspense>
  );
}
