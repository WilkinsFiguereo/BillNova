import type { PasswordStrength, RegisterPayload } from "../types/register.types";

type ValidationErrors = Partial<Record<keyof RegisterPayload, string>>;

export function validateRegisterForm(v: RegisterPayload): ValidationErrors {
  const err: ValidationErrors = {};
  if (!v.name.trim()) err.name = "El nombre es requerido";
  else if (v.name.trim().length < 2) err.name = "Minimo 2 caracteres";

  if (!v.email.trim()) err.email = "El correo es requerido";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.email.trim())) err.email = "Debe ser un correo valido";

  if (!v.username.trim()) err.username = "El nombre de usuario es requerido";
  else if (v.username.trim().length < 3) err.username = "Minimo 3 caracteres";
  else if (!/^[a-zA-Z0-9._-]+$/.test(v.username.trim())) err.username = "Solo letras, numeros, punto, guion y guion bajo";

  if (!v.password) err.password = "La contrasena es requerida";
  else if (!/^\d{6,}$/.test(v.password)) err.password = "Debe tener al menos 6 digitos";

  return err;
}

export function getPasswordStrength(password: string): PasswordStrength {
  if (!password) return 0;
  let score = 0;
  if (password.length >= 6) score++;
  if (password.length >= 8) score++;
  if (password.length >= 10) score++;
  if (/\d/.test(password)) score++;
  return Math.min(score, 4) as PasswordStrength;
}