import type { FieldConfig } from "../types/register.types";

export const REGISTER_FIELDS: FieldConfig[] = [
  { name: "name", label: "Nombre completo", type: "text", placeholder: "Tu nombre", required: true },
  { name: "username", label: "Usuario", type: "text", placeholder: "usuario", required: true },
  { name: "email", label: "Correo", type: "email", placeholder: "correo@empresa.com", required: true },
  { name: "password", label: "Contrasena", type: "password", placeholder: "******", required: true },
  { name: "phone", label: "Telefono", type: "tel", placeholder: "809-555-0000", required: false },
  {
    name: "address",
    label: "Direccion",
    type: "textarea",
    placeholder: "Direccion de la empresa",
    required: false,
    colSpan: "full",
  },
];

export const FIELD_ICONS: Record<string, string> = {
  name: "user",
  username: "at-sign",
  email: "mail",
  password: "lock",
  phone: "phone",
  address: "map-pin",
};
