import { type LucideIcon } from "lucide-react";

export type CompanySize = 'micro' | 'small' | 'medium' | 'large';
export type IndustryType = 'technology' | 'finance' | 'retail' | 'health' | 'education' | 'manufacturing' | 'services' | 'other';
export type FormStatus = 'idle' | 'loading' | 'success' | 'error';
export type BusinessType = 'products' | 'services' | '';
export type PricingType = 'unique' | 'monthly' | 'weekly' | 'annual';

export interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  pricingType: PricingType;
}

export interface CompanyFormData {
  companyName: string;
  taxId: string;
  industryType: IndustryType | '';
  companySize: CompanySize | '';
  foundedYear: string;
  website: string;
  adminFullName: string;
  adminEmail: string;
  adminPhone: string;
  adminPosition: string;
  country: string;
  state: string;
  city: string;
  address: string;
  postalCode: string;
  password: string;
  confirmPassword: string;
  acceptTerms: boolean;
  acceptMarketing: boolean;
  businessType: BusinessType;
  services: Service[];
}

export interface FormStep {
  id: number;
  title: string;
  subtitle: string;
  icon: LucideIcon;
}

export interface FieldError {
  field: keyof CompanyFormData;
  message: string;
}

export interface PasswordStrength {
  score: number;
  label: string;
  color: string;
  percent: number;
}

export interface CompanyRegisterResponse {
  ok: boolean;
  company_id?: number;
  user_id?: number;
  billnova_user_id?: number;
  error?: string;
  missing?: string[];
}
