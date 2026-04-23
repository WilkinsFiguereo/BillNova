"use client";

import { FormField } from "../ui/FormField";
import { SubmitButton } from "../ui/SubmitButton";
import { ServerErrorAlert } from "../ui/ServerErrorAlert";
import { REGISTER_FIELDS } from "../data/constants";
import type { RegisterFormState } from "../types/register.types";

interface RegisterFormSectionProps {
  state: RegisterFormState;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  onGoogleClick: () => void;
  googleLoading: boolean;
  googleError?: string | null;
}

export function RegisterFormSection({
  state,
  onChange,
  onSubmit,
  onGoogleClick,
  googleLoading,
  googleError,
}: RegisterFormSectionProps) {
  const { values, errors, isLoading, serverError } = state;

  return (
    <form onSubmit={onSubmit} noValidate className="form">
      <div>
        <div className="section-head">
          <p className="section-title">Registro</p>
          <span className="section-opt">Datos de acceso</span>
        </div>

        <div className="grid-1">
          {REGISTER_FIELDS.map((field) => (
            <div key={field.name} className={field.colSpan === "full" ? "span-2" : undefined}>
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
      </div>

      {serverError && <ServerErrorAlert message={serverError} />}
      {googleError && <ServerErrorAlert message={googleError} />}

      <SubmitButton isLoading={isLoading} />

      <button
        type="button"
        onClick={onGoogleClick}
        disabled={googleLoading}
        className="btn-submit"
        style={{
          marginTop: "0.9rem",
          background: "#fff",
          color: "#101828",
          border: "1px solid rgba(16, 24, 40, 0.12)",
          boxShadow: "none",
        }}
      >
        {googleLoading ? "Abriendo Google..." : "Continuar con Google"}
      </button>

      <p className="terms">
        Ya tienes cuenta? <a href="/navigation/auth/login">Inicia sesion</a>
      </p>
    </form>
  );
}
