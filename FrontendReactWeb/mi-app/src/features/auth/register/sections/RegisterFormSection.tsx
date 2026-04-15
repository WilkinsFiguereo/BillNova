<<<<<<< HEAD:FrontendReactWeb/mi-app/src/features/auth/register/sections/RegisterFormSection.tsx
﻿"use client";

=======
"use client";
>>>>>>> dff76de22c0a24dc5ae37d61aec817b910d4b235:FrontendReactWeb/mi-app/src/features/register/sections/RegisterFormSection.tsx
import Link from "next/link";
import { FormField } from "../ui/FormField";
import { SubmitButton } from "../ui/SubmitButton";
import { ServerErrorAlert } from "../ui/ServerErrorAlert";
import { REGISTER_FIELDS } from "../data/constants";
import type { RegisterFormState } from "../types/register.types";

interface RegisterFormSectionProps {
  state: RegisterFormState;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}

export function RegisterFormSection({ state, onChange, onSubmit }: RegisterFormSectionProps) {
  const { values, errors, isLoading, serverError } = state;

<<<<<<< HEAD:FrontendReactWeb/mi-app/src/features/auth/register/sections/RegisterFormSection.tsx
  return (
    <form onSubmit={onSubmit} noValidate className="space-y-5">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        {REGISTER_FIELDS.map((field) => (
          <div key={field.name} className={field.colSpan === "full" ? "sm:col-span-2" : ""}>
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

      {serverError && <ServerErrorAlert message={serverError} />}

      <div className="pt-1">
        <SubmitButton isLoading={isLoading} />
      </div>

      <p className="text-center text-xs text-[#3d5166]">
        ¿Ya tienes cuenta?{" "}
        <Link
          href="/login"
          className="text-[#4f8ef7] underline underline-offset-2 transition-colors hover:text-[#6ba3ff]"
        >
          Inicia sesión
        </Link>
=======
  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSubmit(e);
  };

  return (
    <form onSubmit={handleFormSubmit} noValidate className="form" method="post">
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
      <SubmitButton isLoading={isLoading} />

      <p className="terms">
        Ya tienes cuenta? <a href="/login">Inicia sesion</a>

>>>>>>> dff76de22c0a24dc5ae37d61aec817b910d4b235:FrontendReactWeb/mi-app/src/features/register/sections/RegisterFormSection.tsx
      </p>
    </form>
  );
}
