import { type LucideIcon } from "lucide-react";

export type CompanySize = 'micro' | 'small' | 'medium' | 'large';
export type IndustryType = 'technology' | 'finance' | 'retail' | 'health' | 'education' | 'manufacturing' | 'services' | 'other';
export type FormStatus = 'idle' | 'loading' | 'success' | 'error';
export type CompanyType = 'productos' | 'servicios';
export type PaymentFrequency = 'unico' | 'semanal' | 'mensual' | 'anual';

export interface ProductItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
}

export interface ServiceItem {
  id: string;
  name: string;
  description: string;
  price: number;
  frequency: PaymentFrequency;
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
  companyType: CompanyType | '';
  products: ProductItem[];
  services: ServiceItem[];
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
