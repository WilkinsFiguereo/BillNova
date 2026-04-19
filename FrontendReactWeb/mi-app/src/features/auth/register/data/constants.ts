import type { FieldConfig } from "../types/register.types";

export const REGISTER_FIELDS: FieldConfig[] = [
  {
    name: "name",
    label: "Nombre completo",
    type: "text",
    placeholder: "Juan García",
    required: true,
    colSpan: "half",
  },
  {
    name: "login",
    label: "Usuario",
    type: "text",
    placeholder: "juan.garcia",
    required: true,
    colSpan: "half",
  },
  {
    name: "email",
    label: "Correo electrónico",
    type: "email",
    placeholder: "juan@empresa.com",
    required: true,
    colSpan: "half",
  },
  {
    name: "password",
    label: "Contraseña",
    type: "password",
    placeholder: "••••••••",
    required: true,
    colSpan: "half",
  },
  {
    name: "phone",
    label: "Teléfono",
    type: "tel",
    placeholder: "+1 809 000 0000",
    required: false,
    colSpan: "full",
  },
  {
    name: "address",
    label: "Dirección",
    type: "textarea",
    placeholder: "Calle Principal 123, Ciudad",
    required: false,
    colSpan: "full",
  },
];

export const FIELD_ICONS: Record<string, string> = {
  name: "user",
  login: "at-sign",
  email: "mail",
  password: "lock",
  phone: "phone",
  address: "map-pin",
};

