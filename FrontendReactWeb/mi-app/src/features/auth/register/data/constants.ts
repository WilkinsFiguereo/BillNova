import type { FieldConfig } from "../types/register.types";

export const REGISTER_FIELDS: FieldConfig[] = [
  {
    name: "name",
    label: "Nombre completo",
    type: "text",
    placeholder: "Juan Garcia",
    required: true,
    colSpan: "half",
    maxLength: 50,
  },
  {
    name: "login",
    label: "Usuario",
    type: "text",
    placeholder: "juan.garcia",
    required: true,
    colSpan: "half",
    maxLength: 20,
  },
  {
    name: "email",
    label: "Correo electronico",
    type: "email",
    placeholder: "juan@empresa.com",
    required: true,
    colSpan: "half",
  },
  {
    name: "password",
    label: "Contrasena",
    type: "password",
    placeholder: "••••••••",
    required: true,
    colSpan: "half",
    maxLength: 20,
  },
  {
    name: "phone",
    label: "Telefono",
    type: "tel",
    placeholder: "+34 600 000 000",
    required: false,
    colSpan: "full",
    maxLength: 20,
  },
  {
    name: "address",
    label: "Direccion",
    type: "textarea",
    placeholder: "Calle Principal 123, Ciudad",
    required: false,
    colSpan: "full",
    maxLength: 150,
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
