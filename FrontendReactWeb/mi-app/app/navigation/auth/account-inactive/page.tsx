"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function AccountInactivePage() {
  const router = useRouter();
  const search = useSearchParams();
  const email = search.get("email") ?? "";

  useEffect(() => {
    const timer = window.setTimeout(() => {
      router.replace("/navigation/welcome");
    }, 4000);
    return () => window.clearTimeout(timer);
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
            <span className="hero-badge-text">Activacion pendiente</span>
          </div>
          <h1 className="hero-title">
            Tu usuario aun no esta <em>activo</em>.
          </h1>
          <p className="hero-desc">
            Confirma el correo que te enviamos desde Odoo para terminar la activacion y luego podras iniciar sesion sin problema.
          </p>
        </div>

        <p className="left-foot">RF-06 Activacion</p>
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
              <span>Estado</span>
              <span className="fh-step-line" />
              <span>RF-06</span>
            </div>
            <h2 className="fh-title">Usuario no activo</h2>
            <p className="fh-sub">
              {email
                ? `Revisa el correo ${email} y usa el boton de verificacion para activar tu cuenta.`
                : "Revisa tu correo electronico y usa el boton de verificacion para activar tu cuenta."}
            </p>
          </header>

          <div className="card">
            <div className="card-accent" aria-hidden />
            <div className="card-body">
              <div className="info-box" style={{ marginBottom: 16 }}>
                <p className="info-box-text">
                  Si no encuentras el mensaje, puedes reenviarlo desde la pantalla de verificacion.
                </p>
              </div>

              <Link
                href={`/navigation/auth/verify-email${email ? `?email=${encodeURIComponent(email)}` : ""}`}
                className="btn-submit"
                style={{ textDecoration: "none" }}
              >
                Ir a verificar correo
              </Link>

              <p className="terms" style={{ marginTop: "1rem" }}>
                Seras redirigido al welcome automaticamente en unos segundos.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
