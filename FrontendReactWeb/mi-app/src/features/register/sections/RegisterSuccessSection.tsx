"use client";

export function RegisterSuccessSection() {
  return (
    <div className="success-wrap show">
      <div className="success-ring" aria-hidden>
        <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
          <path d="M5.5 13l5 5L20.5 8" stroke="#10B981" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>

      <h3 className="success-title">Cuenta creada exitosamente</h3>
      <p className="success-sub">Redirigiendo al inicio de sesion...</p>

      <div className="progress-line" aria-hidden>
        <div className="progress-fill" />
      </div>
    </div>
  );
}