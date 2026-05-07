import type { PasswordStrength, RegisterPayload } from "../types/register.types";

type ValidationErrors = Partial<Record<keyof RegisterPayload, string>>;

const REGISTER_NAME_MAX_LENGTH = 50;
const REGISTER_LOGIN_MAX_LENGTH = 20;
const REGISTER_PASSWORD_MAX_LENGTH = 20;
const REGISTER_PHONE_MAX_LENGTH = 20;
const REGISTER_ADDRESS_MAX_LENGTH = 150;

export function validateRegisterForm(v: RegisterPayload): ValidationErrors {
  const err: ValidationErrors = {};

  if (!v.name.trim()) {
    err.name = "El nombre es requerido";
  } else if (v.name.trim().length < 2) {
    err.name = "Minimo 2 caracteres";
  } else if (v.name.trim().length > REGISTER_NAME_MAX_LENGTH) {
    err.name = `Maximo ${REGISTER_NAME_MAX_LENGTH} caracteres`;
  }

  if (!v.login.trim()) {
    err.login = "El usuario es requerido";
  } else if (v.login.trim().length < 3) {
    err.login = "Minimo 3 caracteres";
  } else if (v.login.trim().length > REGISTER_LOGIN_MAX_LENGTH) {
    err.login = `Maximo ${REGISTER_LOGIN_MAX_LENGTH} caracteres`;
  } else if (!/^[a-zA-Z0-9._@-]+$/.test(v.login)) {
    err.login = "Solo letras, numeros y ._@-";
  }

  if (!v.email.trim()) {
    err.email = "El email es requerido";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.email)) {
    err.email = "Email invalido";
  }

  if (!v.password) {
    err.password = "La contrasena es requerida";
  } else if (v.password.length < 8) {
    err.password = "Minimo 8 caracteres";
  } else if (v.password.length > REGISTER_PASSWORD_MAX_LENGTH) {
    err.password = `Maximo ${REGISTER_PASSWORD_MAX_LENGTH} caracteres`;
  } else if (!/(?=.*[A-Z])/.test(v.password)) {
    err.password = "Debe incluir al menos una mayuscula";
  } else if (!/(?=.*[0-9])/.test(v.password)) {
    err.password = "Debe incluir al menos un numero";
  }

  if (v.phone && v.phone.length > REGISTER_PHONE_MAX_LENGTH) {
    err.phone = `Maximo ${REGISTER_PHONE_MAX_LENGTH} caracteres`;
  } else if (v.phone && !/^\+?[\d\s\-()]{7,15}$/.test(v.phone)) {
    err.phone = "Telefono invalido";
  }

  if (v.address && v.address.length > REGISTER_ADDRESS_MAX_LENGTH) {
    err.address = `Maximo ${REGISTER_ADDRESS_MAX_LENGTH} caracteres`;
  }

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
