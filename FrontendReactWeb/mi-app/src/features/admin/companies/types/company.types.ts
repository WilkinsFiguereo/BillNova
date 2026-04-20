export type CompanyStatus = 'Activa' | 'Pendiente' | 'Inactiva';
export type CompanyPlan = 'Starter' | 'Business' | 'Premium';

export interface Company {
  id: number;
  active?: boolean;
  name: string;
  email?: string;
  ruc?: string;
  sector?: string;
  website?: string;
  contact_name?: string;
  contact_email?: string;
  contact_phone?: string;
  city?: string;
  state?: string;
  address?: string;
  status: CompanyStatus;
  plan: CompanyPlan;
  revenue?: number;
  createdAt?: string;
}

export interface CompanyStats {
  totalCompanies: number;
  activeCompanies: number;
  pendingCompanies: number;
}

export interface CompaniesData {
  companies: Company[];
  stats: CompanyStats;
}
