export type CompanyStatus = 'Activa' | 'Pendiente' | 'Inactiva';
export type CompanyPlan = 'Starter' | 'Business' | 'Premium';

export interface Company {
  id: number;
  name: string;
  ruc?: string;
  sector?: string;
  website?: string;
  business_type?: string;
  company_size?: string;
  contact_name?: string;
  contact_email?: string;
  contact_phone?: string;
  admin_full_name?: string;
  admin_email?: string;
  admin_phone?: string;
  admin_position?: string;
  city?: string;
  state?: string;
  address?: string;
  moderation_status?: 'pending' | 'approved' | 'rejected';
  moderation_reason?: string | null;
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
