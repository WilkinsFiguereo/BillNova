"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useGoogleOAuth, useLogin } from "@/features/auth/login";
import { getStoredAuthState } from "@/features/auth/login/data/storage";
import { getUserRoleRoute } from "@/features/auth/login/hooks/useRoleGuard";

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const { values, errors, isLoading, serverError, errorCode, verificationEmail, onFieldChange, onSubmit } = useLogin();
  const { googleLoading, googleError, startGoogleOAuth } = useGoogleOAuth({
    rememberMe: values.rememberMe,
  });

  useEffect(() => {
    const cached = getStoredAuthState();
    if (cached?.uid) {
      router.replace(getUserRoleRoute(cached.role));
    }
  }, [router]);

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
                  <div className="field-wrap" style={{ position: "relative" }}>
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      value={values.password}
                      onChange={onFieldChange}
                      placeholder="Tu contrasena"
                      className={`input${errors.password ? " err" : values.password ? " ok" : ""}`}
                      style={{ paddingRight: 72 }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((current) => !current)}
                      style={{
                        position: "absolute",
                        right: 14,
                        top: "50%",
                        transform: "translateY(-50%)",
                        border: "none",
                        background: "transparent",
                        color: "#7a8fa8",
                        fontSize: 12,
                        fontWeight: 600,
                        cursor: "pointer",
                      }}
                    >
                      {showPassword ? "Ocultar" : "Ver"}
                    </button>
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

                {googleError && (
                  <div className="alert show">
                    <p className="alert-msg">{googleError}</p>
                  </div>
                )}

                {errorCode === "ACCOUNT_NOT_VERIFIED" && verificationEmail && (
                  <p className="fh-sub" style={{ marginTop: "-0.5rem" }}>
                    <Link href={`/navigation/auth/verify-email?email=${encodeURIComponent(verificationEmail)}`}>Verificar correo / reenviar email</Link>
                  </p>
                )}

                {errorCode === "ACCOUNT_DISABLED" && <p className="field-err show">Cuenta deshabilitada. Contacta soporte.</p>}

                <button type="submit" disabled={isLoading} className="btn-submit">
                  {isLoading ? "Validando..." : "Iniciar sesion"}
                </button>

                <button
                  type="button"
                  onClick={startGoogleOAuth}
                  disabled={googleLoading}
                  className="btn-submit"
                  style={{
                    marginTop: "0.85rem",
                    background: "#fff",
                    color: "#101828",
                    border: "1px solid rgba(16, 24, 40, 0.12)",
                    boxShadow: "none",
                  }}
                >
                  {googleLoading ? "Abriendo Google..." : "Continuar con Google"}
                </button>
              </form>

              <p className="terms" style={{ marginTop: "1rem" }}>
                <Link href="/navigation/auth/forgot-password">Olvidaste tu contrasena?</Link> · <Link href="/navigation/auth/register">Crear cuenta</Link>
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
