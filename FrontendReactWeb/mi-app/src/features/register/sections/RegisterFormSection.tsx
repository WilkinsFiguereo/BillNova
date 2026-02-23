"use client";

/* ─────────────────────────────────────────
   REGISTER FEATURE — Sections / RegisterFormSection
   Sección principal del formulario
───────────────────────────────────────── */

import { FormField }        from "../ui/FormField";
import { SubmitButton }     from "../ui/SubmitButton";
import { ServerErrorAlert } from "../ui/ServerErrorAlert";
import { REGISTER_FIELDS }  from "../data/constants";
import type { RegisterFormState } from "../types/register.types";

interface RegisterFormSectionProps {
  state: RegisterFormState;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}

export function RegisterFormSection({ state, onChange, onSubmit }: RegisterFormSectionProps) {
  const { values, errors, isLoading, serverError } = state;

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-5">
      {/* Grid de campos generado desde constants */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {REGISTER_FIELDS.map((field) => (
          <div
            key={field.name}
            className={field.colSpan === "full" ? "sm:col-span-2" : ""}
          >
            <FormField
              name={field.name}
              label={field.label}
              type={field.type}
              placeholder={field.placeholder}
              required={field.required}
              value={values[field.name] ?? ""}
              error={errors[field.name]}
              onChange={onChange}
            />
          </div>
        ))}
      </div>

      {/* Error servidor */}
      {serverError && <ServerErrorAlert message={serverError} />}

      {/* Submit */}
      <div className="pt-1">
        <SubmitButton isLoading={isLoading} />
      </div>

      {/* Login link */}
      <p className="text-center text-xs text-[#3d5166]">
        ¿Ya tienes cuenta?{" "}
        <a
          href="/login"
          className="text-[#4f8ef7] hover:text-[#6ba3ff] transition-colors underline underline-offset-2"
        >
          Inicia sesión
        </a>
      </p>
    </form>
  );
}