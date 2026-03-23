"use client";

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
        Al crear tu cuenta aceptas los términos de servicio.
      </p>
    </form>
  );
}
