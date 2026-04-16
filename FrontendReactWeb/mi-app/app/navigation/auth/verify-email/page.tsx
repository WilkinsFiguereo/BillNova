"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useVerifyEmail } from "@/features/login/login";

export default function VerifyEmailPage() {
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
<<<<<<< HEAD
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
=======
    <main className="min-h-screen bg-[#080b12] text-[#e4ebf5] flex items-center justify-center p-4">
      <div className="w-full max-w-md border border-[#1a2235] bg-[#0d1117] p-8 rounded-[2px]">
        <p className="text-[11px] tracking-[0.2em] uppercase text-[#4f8ef7] mb-2">
          RF-03 / RF-04
        </p>
        <h1 className="text-2xl font-semibold mb-1">Verifica tu correo</h1>
        <p className="text-sm text-[#7a8fa8] mb-6">
          Ingresa el codigo OTP recibido por email.
        </p>

        <div className="space-y-4">
          <div>
            <label className="text-xs uppercase tracking-[0.18em] text-[#7a8fa8]">
              Email
            </label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              className="mt-1 w-full border border-[#1e2d42] bg-transparent p-3 text-sm outline-none focus:border-[#4f8ef7]"
            />
          </div>
          <div>
            <label className="text-xs uppercase tracking-[0.18em] text-[#7a8fa8]">
              Codigo
            </label>
            <input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              type="text"
              maxLength={8}
              placeholder="123456"
              className="mt-1 w-full border border-[#1e2d42] bg-transparent p-3 text-sm outline-none focus:border-[#4f8ef7]"
            />
          </div>

          <button
            type="button"
            onClick={verify}
            disabled={isLoading}
            className="w-full bg-[#4f8ef7] text-[#07101d] py-3 font-semibold disabled:opacity-60"
          >
            {isLoading ? "Verificando..." : "Verificar cuenta"}
          </button>

          <button
            type="button"
            onClick={resend}
            disabled={isResending || cooldown > 0}
            className="w-full border border-[#2a4063] py-3 text-[#9ec2ec] disabled:opacity-60"
          >
            {cooldown > 0
              ? `Reenviar en ${cooldown}s`
              : isResending
                ? "Reenviando..."
                : "Reenviar codigo"}
          </button>

          {error && <p className="text-sm text-[#f47c7c]">{error}</p>}
          {message && <p className="text-sm text-[#9ce5b9]">{message}</p>}
          {devCode && (
            <p className="text-xs text-[#9fb4d1]">
              Codigo de desarrollo: {devCode}
            </p>
          )}
>>>>>>> bb18ddb23a5877a401d5a6e8f1b5a9a64e48a0e9
        </div>

        <div className="hero">
          <div className="hero-badge">
            <span className="hero-badge-dot" />
            <span className="hero-badge-text">Verificación segura</span>
          </div>
          <h1 className="hero-title">
            Confirma tu <em>correo</em> para activar la cuenta.
          </h1>
          <p className="hero-desc">
            Te enviamos un código OTP para validar el acceso. Esto protege tu cuenta y tu empresa.
          </p>
        </div>

        <p className="left-foot">RF-03 Verificación</p>
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
              <span>Verificación</span>
              <span className="fh-step-line" />
              <span>RF-03</span>
            </div>
            <h2 className="fh-title">Verifica tu correo</h2>
            <p className="fh-sub">Ingresa el código OTP recibido por email.</p>
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
                <label className="field-label" htmlFor="code">Código</label>
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
                {cooldown > 0 ? `Reenviar en ${cooldown}s` : isResending ? "Reenviando..." : "Reenviar código"}
              </button>

              {error && <p className="field-err show">{error}</p>}
              {message && <p style={{ color: "#34D399", fontSize: 12, marginTop: 8 }}>{message}</p>}
              {devCode && <p style={{ color: "var(--text-300)", fontSize: 12, marginTop: 6 }}>Código de desarrollo: {devCode}</p>}

              <p className="terms" style={{ marginTop: "1rem" }}>
                <Link href="/navigation/auth/register">Volver al registro</Link>
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
