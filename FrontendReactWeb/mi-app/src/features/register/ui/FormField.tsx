"use client";

import { FieldIcon } from "./FieldIcon";
import { PasswordStrengthBar } from "./PasswordStrengthBar";
import { FIELD_ICONS } from "../data/constants";

interface FormFieldProps {
  name: string;
  label: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
  value: string;
  error?: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

export function FormField({
  name,
  label,
  type = "text",
  placeholder,
  required,
  value,
  error,
  onChange,
}: FormFieldProps) {
  const isTextarea = type === "textarea";
  const isPassword = type === "password";
  const iconName = FIELD_ICONS[name] ?? "user";

  return (
    <div className="field">
      <label htmlFor={name} className="field-label">
        {label}
        {required && <span className="req">*</span>}
      </label>

      <div className="field-wrap">
        <span className="field-icon" aria-hidden>
          <FieldIcon name={iconName} />
        </span>

        {isTextarea ? (
          <textarea
            id={name}
            name={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            required={required}
            rows={3}
            className={`input${error ? " err" : ""}`}
          />
        ) : (
          <input
            id={name}
            name={name}
            type={type}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            required={required}
            autoComplete={name}
            className={`input${error ? " err" : value ? " ok" : ""}`}
          />
        )}
      </div>

      {isPassword && <PasswordStrengthBar password={value} />}

      <p className={`field-err${error ? " show" : ""}`} role="alert">
        {error}
      </p>
    </div>
  );
}