// src/feature/company/types/company.types.ts

export type EmployeeStatus = "active" | "disabled";

export type EmployeeRole =
  | "Administrador"
  | "Vendedor"
  | "Trabajador"
  | "Almacen"
  | "Contabilidad"
  | "Soporte";

export interface Employee {
  id: string;
  name: string;
  email: string;
  role: EmployeeRole;
  phone: string;
  status: EmployeeStatus;
  password?: string;
}

export interface MonthlySale {
  month: string;
  sales: number;
  orders: number;
}

export interface Company {
  id: string;
  name: string;
  legalName: string;
  rnc: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  logoInitials: string;
  foundedYear: number;
  employees: Employee[];
  salesHistory: MonthlySale[];
}
