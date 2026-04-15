<<<<<<< HEAD:FrontendReactWeb/mi-app/src/features/auth/register/data/validators.ts
/* ─────────────────────────────────────────
   REGISTER FEATURE — Data / Validators
   Reglas de validación del formulario
───────────────────────────────────────── */

import type { RegisterPayload, PasswordStrength } from "../types/register.types";
=======
import type { PasswordStrength, RegisterPayload } from "../types/register.types";
>>>>>>> dff76de22c0a24dc5ae37d61aec817b910d4b235:FrontendReactWeb/mi-app/src/features/register/data/validators.ts

type ValidationErrors = Partial<Record<keyof RegisterPayload, string>>;

export function validateRegisterForm(v: RegisterPayload): ValidationErrors {
  const err: ValidationErrors = {};
<<<<<<< HEAD:FrontendReactWeb/mi-app/src/features/auth/register/data/validators.ts

  /* name */
  if (!v.name.trim())
    err.name = "El nombre es requerido";
  else if (v.name.trim().length < 2)
    err.name = "Mínimo 2 caracteres";

  /* login */
  if (!v.login.trim())
    err.login = "El usuario es requerido";
  else if (v.login.length < 3)
    err.login = "Mínimo 3 caracteres";
  else if (!/^[a-zA-Z0-9._@-]+$/.test(v.login))
    err.login = "Solo letras, números y ._@-";

  /* email */
  if (!v.email.trim())
    err.email = "El email es requerido";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.email))
    err.email = "Email inválido";

  /* password */
  if (!v.password)
    err.password = "La contraseña es requerida";
  else if (v.password.length < 8)
    err.password = "Mínimo 8 caracteres";
  else if (!/(?=.*[A-Z])/.test(v.password))
    err.password = "Debe incluir al menos una mayúscula";
  else if (!/(?=.*[0-9])/.test(v.password))
    err.password = "Debe incluir al menos un número";

  /* phone (opcional) */
  if (v.phone && !/^\+?[\d\s\-()]{7,15}$/.test(v.phone))
    err.phone = "Teléfono inválido";
=======
  if (!v.name.trim()) err.name = "El nombre es requerido";
  else if (v.name.trim().length < 2) err.name = "Minimo 2 caracteres";

  if (!v.email.trim()) err.email = "El correo es requerido";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.email.trim())) err.email = "Debe ser un correo valido";

  if (!v.username.trim()) err.username = "El nombre de usuario es requerido";
  else if (v.username.trim().length < 3) err.username = "Minimo 3 caracteres";
  else if (!/^[a-zA-Z0-9._-]+$/.test(v.username.trim())) err.username = "Solo letras, numeros, punto, guion y guion bajo";

  if (!v.password) err.password = "La contrasena es requerida";
  else if (!/^\d{6,}$/.test(v.password)) err.password = "Debe tener al menos 6 digitos";
>>>>>>> dff76de22c0a24dc5ae37d61aec817b910d4b235:FrontendReactWeb/mi-app/src/features/register/data/validators.ts

  return err;
}

<<<<<<< HEAD:FrontendReactWeb/mi-app/src/features/auth/register/data/validators.ts
/** Calcula fortaleza de contraseña 0-4 */
export function getPasswordStrength(password: string): PasswordStrength {
  if (!password) return 0;
  let score = 0;
  if (password.length >= 8)  score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^a-zA-Z0-9]/.test(password)) score++;
  return Math.min(score, 4) as PasswordStrength;
}
=======
export function getPasswordStrength(password: string): PasswordStrength {
  if (!password) return 0;
  let score = 0;
  if (password.length >= 6) score++;
  if (password.length >= 8) score++;
  if (password.length >= 10) score++;
  if (/\d/.test(password)) score++;
  return Math.min(score, 4) as PasswordStrength;
}
>>>>>>> dff76de22c0a24dc5ae37d61aec817b910d4b235:FrontendReactWeb/mi-app/src/features/register/data/validators.ts
