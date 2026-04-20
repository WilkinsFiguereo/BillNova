"use client";
import { useWelcomeNav } from "../hooks/useWelcomeNav";

export function CtaButtons() {
  const { goToLogin, goToRegister } = useWelcomeNav();

  return (
    <div className="cta-stack">
      <button className="btn-login" onClick={goToLogin}>
        → Iniciar sesión en mi empresa
      </button>
      <button className="btn-register" onClick={goToRegister}>
        + Crear cuenta nueva
      </button>
    </div>
  );
}