import type { FieldConfig } from "../types/register.types";

export const REGISTER_FIELDS: FieldConfig[] = [
  {
    name: "name",
    label: "Nombre",
    type: "text",
    placeholder: "Juan Perez",
    required: true,
    colSpan: "full",
  },
  {
    name: "gmail",
    label: "Gmail",
    type: "email",
    placeholder: "usuario@gmail.com",
    required: true,
    colSpan: "full",
  },
  {
    name: "username",
    label: "Nombre de usuario",
    type: "text",
    placeholder: "juan.perez",
    required: true,
    colSpan: "full",
  },
  {
    name: "password",
    label: "Contrasena",
    type: "password",
    placeholder: "Minimo 10 caracteres",
    required: true,
    colSpan: "full",
  },
];

export const FIELD_ICONS: Record<string, string> = {
  name: "user",
  gmail: "mail",
  username: "at-sign",
  password: "lock",
};