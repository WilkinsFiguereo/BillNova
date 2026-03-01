import type { PasswordStrength, RegisterPayload } from "../types/register.types";

type ValidationErrors = Partial<Record<keyof RegisterPayload, string>>;

export function validateRegisterForm(v: RegisterPayload): ValidationErrors {
  const err: ValidationErrors = {};

  if (!v.name.trim()) err.name = "El nombre es requerido";
  else if (v.name.trim().length < 2) err.name = "Minimo 2 caracteres";

  if (!v.gmail.trim()) err.gmail = "El Gmail es requerido";
  else if (!/^[^\s@]+@gmail\.com$/i.test(v.gmail.trim())) err.gmail = "Debe ser un correo Gmail valido";

  if (!v.username.trim()) err.username = "El nombre de usuario es requerido";
  else if (v.username.trim().length < 3) err.username = "Minimo 3 caracteres";
  else if (!/^[a-zA-Z0-9._-]+$/.test(v.username.trim())) err.username = "Solo letras, numeros, punto, guion y guion bajo";

  if (!v.password) err.password = "La contrasena es requerida";
  else if (v.password.length < 10) err.password = "Minimo 10 caracteres";
  else if (!/(?=.*[a-z])/.test(v.password)) err.password = "Debe incluir al menos una minuscula";
  else if (!/(?=.*[A-Z])/.test(v.password)) err.password = "Debe incluir al menos una mayuscula";
  else if (!/(?=.*[0-9])/.test(v.password)) err.password = "Debe incluir al menos un numero";
  else if (!/(?=.*[^a-zA-Z0-9])/.test(v.password)) err.password = "Debe incluir al menos un caracter especial";
  else if (/\s/.test(v.password)) err.password = "No debe incluir espacios";

  return err;
}

export function getPasswordStrength(password: string): PasswordStrength {
  if (!password) return 0;
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^a-zA-Z0-9]/.test(password)) score++;
  return Math.min(score, 4) as PasswordStrength;
}