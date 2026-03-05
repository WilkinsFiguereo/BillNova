"use client";

import { FieldIcon } from "./FieldIcon";
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

function getAutoComplete(name: string, type: string): string {
  if (type === "password") return "new-password";
  switch (name) {
    case "name":
      return "name";
    case "username":
      return "username";
    case "email":
      return "email";
    case "phone":
      return "tel";
    case "address":
      return "street-address";
    default:
      return "on";
  }
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
            autoComplete={getAutoComplete(name, type)}
            className={`input${error ? " err" : value ? " ok" : ""}`}
          />
        )}
      </div>

      <p className={`field-err${error ? " show" : ""}`} role="alert">
        {error}
      </p>
    </div>
  );
}
