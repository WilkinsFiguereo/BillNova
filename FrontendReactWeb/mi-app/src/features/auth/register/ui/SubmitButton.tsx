"use client";

<<<<<<< HEAD:FrontendReactWeb/mi-app/src/features/auth/register/ui/SubmitButton.tsx
/* ─────────────────────────────────────────
   REGISTER FEATURE — UI / SubmitButton
───────────────────────────────────────── */

=======
>>>>>>> dff76de22c0a24dc5ae37d61aec817b910d4b235:FrontendReactWeb/mi-app/src/features/register/ui/SubmitButton.tsx
interface SubmitButtonProps {
  isLoading: boolean;
}

export function SubmitButton({ isLoading }: SubmitButtonProps) {
<<<<<<< HEAD:FrontendReactWeb/mi-app/src/features/auth/register/ui/SubmitButton.tsx
=======

  console.log("🔄 SubmitButton render - isLoading:", isLoading);

>>>>>>> dff76de22c0a24dc5ae37d61aec817b910d4b235:FrontendReactWeb/mi-app/src/features/register/ui/SubmitButton.tsx
  return (
    <button
      type="submit"
      disabled={isLoading}
<<<<<<< HEAD:FrontendReactWeb/mi-app/src/features/auth/register/ui/SubmitButton.tsx
      className="
        w-full relative overflow-hidden group
        bg-[#4f8ef7] hover:bg-[#6ba3ff]
        text-[#080b12] text-sm font-bold tracking-[0.15em] uppercase
        py-3.5 rounded-[2px]
        transition-all duration-200
        disabled:opacity-40 disabled:cursor-not-allowed
        active:scale-[0.99]
      "
    >
      {/* Shine sweep */}
      <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out pointer-events-none" />

      <span className="relative flex items-center justify-center gap-2">
        {isLoading ? (
          <>
            <svg className="animate-spin w-4 h-4" viewBox="0 0 16 16" fill="none" aria-hidden>
              <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.25" />
              <path d="M14 8A6 6 0 0 0 8 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            Creando cuenta…
          </>
        ) : (
          <>
            Crear cuenta
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden className="transition-transform group-hover:translate-x-0.5">
              <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </>
        )}
      </span>
=======

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
>>>>>>> dff76de22c0a24dc5ae37d61aec817b910d4b235:FrontendReactWeb/mi-app/src/features/register/ui/SubmitButton.tsx
    </button>
  );
}