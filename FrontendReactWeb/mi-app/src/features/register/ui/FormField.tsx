"use client";

<<<<<<< HEAD
/* ─────────────────────────────────────────
   REGISTER FEATURE — UI / FormField
   Campo atómico reutilizable
───────────────────────────────────────── */

import { FieldIcon } from "./FieldIcon";
import { PasswordStrengthBar } from "./PasswordStrengthBar";
import { inputBase, labelBase } from "../theme/register.theme";
=======
import { FieldIcon } from "./FieldIcon";
>>>>>>> d5a70c78988b43655bd9da58bea46a376cb4ef8a
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
<<<<<<< HEAD
    case "login":
=======
    case "username":
>>>>>>> d5a70c78988b43655bd9da58bea46a376cb4ef8a
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
<<<<<<< HEAD
  const isTextarea  = type === "textarea";
  const isPassword  = type === "password";
  const iconName    = FIELD_ICONS[name] ?? "user";
  const borderColor = error ? "border-[#f47c7c] focus:border-[#f47c7c] focus:ring-[#f47c7c]/20" : "";

  return (
    <div className="flex flex-col gap-0">
      <label htmlFor={name} className={labelBase}>
        {label}
        {required && <span className="text-[#4f8ef7] ml-1">*</span>}
      </label>

      <div className="relative">
        {/* Icon */}
        <span className="absolute left-3 top-3 text-[#3d5166] transition-colors duration-200 pointer-events-none [input:focus~&]:text-[#4f8ef7]">
=======
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
>>>>>>> d5a70c78988b43655bd9da58bea46a376cb4ef8a
          <FieldIcon name={iconName} />
        </span>

        {isTextarea ? (
          <textarea
            id={name}
            name={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
<<<<<<< HEAD
            rows={3}
            className={`${inputBase} ${borderColor}`}
=======
            required={required}
            rows={3}
            className={`input${error ? " err" : ""}`}
>>>>>>> d5a70c78988b43655bd9da58bea46a376cb4ef8a
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
<<<<<<< HEAD
            className={`${inputBase} ${borderColor}`}
=======
            className={`input${error ? " err" : value ? " ok" : ""}`}
>>>>>>> d5a70c78988b43655bd9da58bea46a376cb4ef8a
          />
        )}
      </div>

<<<<<<< HEAD
      {/* Password strength */}
      {isPassword && <PasswordStrengthBar password={value} />}

      {/* Error */}
      {error && (
        <p role="alert" className="mt-1.5 flex items-center gap-1 text-[11px] text-[#f47c7c]">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
            <circle cx="6" cy="6" r="5" stroke="#f47c7c" strokeWidth="1.2" />
            <path d="M6 3.5v3M6 7.5v.5" stroke="#f47c7c" strokeWidth="1.2" strokeLinecap="round" />
          </svg>
          {error}
        </p>
      )}
=======
      <p className={`field-err${error ? " show" : ""}`} role="alert">
        {error}
      </p>
>>>>>>> d5a70c78988b43655bd9da58bea46a376cb4ef8a
    </div>
  );
}
