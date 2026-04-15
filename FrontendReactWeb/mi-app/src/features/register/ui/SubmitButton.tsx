"use client";

interface SubmitButtonProps {
  isLoading: boolean;
}

export function SubmitButton({ isLoading }: SubmitButtonProps) {

  console.log("🔄 SubmitButton render - isLoading:", isLoading);

  return (
    <button
      type="submit"
      disabled={isLoading}

      className="btn-submit"
      onClick={() => console.log("🟢 Botón presionado")}
    >
      {isLoading ? (
        <>
          <svg className="spin" width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden>
            <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.4" strokeOpacity="0.3" />
            <path d="M14 8A6 6 0 0 0 8 2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
          </svg>
          Creando cuenta...
        </>
      ) : (
        "Crear cuenta"
      )}
    </button>
  );
}