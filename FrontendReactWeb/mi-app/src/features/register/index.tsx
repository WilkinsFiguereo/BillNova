"use client";

<<<<<<< HEAD
/* ═══════════════════════════════════════════
   REGISTER FEATURE — Página Principal
   Punto de entrada público de la feature.
   Importa desde aquí, no desde subcarpetas.
═══════════════════════════════════════════ */

import { useRegister }              from "./hooks/useRegister";
import { RegisterFormSection }      from "./sections/RegisterFormSection";
import { RegisterSuccessSection }   from "./sections/RegisterSuccessSection";

/* ── Re-exports públicos de la feature ── */
export { useRegister }            from "./hooks/useRegister";
export { registerApi }            from "./data/api";
export type { RegisterPayload }   from "./types/register.types";

/* ── Página principal de la feature ── */
=======
import { useRegister } from "./hooks/useRegister";
import { RegisterFormSection } from "./sections/RegisterFormSection";
import { RegisterSuccessSection } from "./sections/RegisterSuccessSection";

export { useRegister } from "./hooks/useRegister";
export { registerApi } from "./data/api";
export type { RegisterPayload } from "./types/register.types";

>>>>>>> d5a70c78988b43655bd9da58bea46a376cb4ef8a
export function RegisterPage() {
  const { state, handleChange, handleSubmit } = useRegister();

  return (
<<<<<<< HEAD
    <main className="min-h-screen bg-[#080b12] flex items-center justify-center p-4 relative overflow-hidden">

      {/* ── Fondo: grid sutil ── */}
      <div
        aria-hidden
        className="fixed inset-0 pointer-events-none opacity-[0.025]"
        style={{
          backgroundImage:
            "linear-gradient(#4f8ef7 1px, transparent 1px), linear-gradient(90deg, #4f8ef7 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      {/* ── Fondo: glow radial ── */}
      <div
        aria-hidden
        className="fixed top-[-20%] left-[60%] w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(79,142,247,0.06) 0%, transparent 70%)",
        }}
      />

      <div className="w-full max-w-xl relative z-10">

        {/* ── Header ── */}
        <header className="mb-8 text-center">
          {/* Logomark */}
          <div className="inline-flex items-center gap-2 mb-6">
            <div className="w-8 h-8 bg-[#4f8ef7] rounded-[2px] flex items-center justify-center">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path
                  d="M7 1L13 4v6L7 13 1 10V4L7 1z"
                  stroke="#080b12"
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <span className="text-[#e4ebf5] text-sm font-semibold tracking-widest uppercase">
              MyApp
            </span>
          </div>

          <p className="text-[#4f8ef7] text-[10px] tracking-[0.3em] uppercase mb-2 font-medium">
            Nueva cuenta
          </p>
          <h1 className="text-[#e4ebf5] text-2xl font-light tracking-tight">
            Crear acceso a la plataforma
          </h1>
          <p className="text-[#7a8fa8] text-sm mt-1.5">
            Completa los datos para conectarte con Odoo
          </p>
        </header>

        {/* ── Card ── */}
        <div className="bg-[#0d1117] border border-[#1a2235] rounded-[2px] p-7 sm:p-9 relative">

          {/* Borde superior accent */}
          <span className="absolute top-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-[#4f8ef7]/40 to-transparent" />

          {state.success ? (
            <RegisterSuccessSection />
          ) : (
            <RegisterFormSection
              state={state}
              onChange={handleChange}
              onSubmit={handleSubmit}
            />
          )}
        </div>

        {/* ── Footer ── */}
        <p className="text-center text-[10px] text-[#1a2235] mt-5 tracking-widest uppercase">
          Powered by{" "}
          <span className="text-[#3d5166]">Odoo</span>
        </p>
      </div>
=======
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
                <RegisterFormSection state={state} onChange={handleChange} onSubmit={handleSubmit} />
              )}
            </div>
          </div>
        </div>
      </section>
>>>>>>> d5a70c78988b43655bd9da58bea46a376cb4ef8a
    </main>
  );
}