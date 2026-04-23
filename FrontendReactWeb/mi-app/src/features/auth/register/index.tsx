"use client";

import { useGoogleOAuth } from "../login";
import { useRegister } from "./hooks/useRegister";
import { RegisterFormSection } from "./sections/RegisterFormSection";
import { RegisterSuccessSection } from "./sections/RegisterSuccessSection";

export { useRegister } from "./hooks/useRegister";
export { registerApi } from "./data/api";
export type { RegisterPayload } from "./types/register.types";

export function RegisterPage() {
  const { state, handleChange, handleSubmit } = useRegister();
  const { googleLoading, googleError, startGoogleOAuth } = useGoogleOAuth();

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
            <span className="hero-badge-text">Onboarding seguro</span>
          </div>
          <h1 className="hero-title">
            Crea tu operacion <em>instaladora</em> en minutos.
          </h1>
          <p className="hero-desc">
            Registra la empresa y define el administrador principal con una base segura para escalar en BillNova.
          </p>

          <div className="stats">
            <div className="stat">
              <p className="stat-value">99.9%</p>
              <p className="stat-label">Session uptime</p>
            </div>
            <div className="stat">
              <p className="stat-value">
                &lt;2<sub>min</sub>
              </p>
              <p className="stat-label">Setup promedio</p>
            </div>
          </div>

          <div className="features">
            <p className="feature">
              <span className="feature-check" aria-hidden>
                <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                  <path d="M2 6l2.5 2.5L10 3" stroke="#34D399" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              Alta empresa + admin en una sola pantalla
            </p>
            <p className="feature">
              <span className="feature-check" aria-hidden>
                <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                  <path d="M2 6l2.5 2.5L10 3" stroke="#34D399" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              Validacion en tiempo real y control de errores
            </p>
          </div>
        </div>

        <p className="left-foot">Powered by Odoo</p>
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
              <span>Registro</span>
              <span className="fh-step-line" />
              <span>RF-04</span>
            </div>
            <h2 className="fh-title">Empresa instaladora + admin</h2>
            <p className="fh-sub">Completa los datos clave para habilitar tu espacio en BillNova.</p>
          </header>

          <div className="card">
            <div className="card-accent" aria-hidden />
            <div className="card-body">
              {state.success ? (
                <RegisterSuccessSection />
              ) : (
                <RegisterFormSection
                  state={state}
                  onChange={handleChange}
                  onSubmit={handleSubmit}
                  onGoogleClick={startGoogleOAuth}
                  googleLoading={googleLoading}
                  googleError={googleError}
                />
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
