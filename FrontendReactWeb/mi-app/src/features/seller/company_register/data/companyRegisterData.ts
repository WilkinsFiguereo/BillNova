import { Building2, Factory, Leaf, Lock, MapPin, Store, User, Package, Wrench, type LucideIcon } from "lucide-react";
import { CompanyFormData, FormStep, IndustryType, CompanySize, CompanyType } from '../types/companyRegister.types';

export const FORM_STEPS: FormStep[] = [
  { id: 1, title: 'Empresa',   subtitle: 'Datos generales',        icon: Building2 },
  { id: 2, title: 'Tipo',      subtitle: 'Productos o Servicios',  icon: Package },
  { id: 3, title: 'Oferta',    subtitle: 'Tus productos/servicios', icon: Package },
  { id: 4, title: 'Contacto',  subtitle: 'Responsable admin',      icon: User },
  { id: 5, title: 'Dirección', subtitle: 'Ubicación fiscal',       icon: MapPin },
  { id: 6, title: 'Acceso',    subtitle: 'Seguridad de cuenta',    icon: Lock },
];

export const COMPANY_TYPE_OPTIONS: { label: string; value: CompanyType; icon: LucideIcon }[] = [
  { label: 'Productos', value: 'productos', icon: Package },
  { label: 'Servicios', value: 'servicios', icon: Wrench },
];

export const PAYMENT_FREQUENCY_OPTIONS = [
  { label: 'Pago Único', value: 'unico' },
  { label: 'Semanal', value: 'semanal' },
  { label: 'Mensual', value: 'mensual' },
  { label: 'Anual', value: 'anual' },
];

export const INDUSTRY_OPTIONS: { label: string; value: IndustryType }[] = [
  { label: 'Seleccionar sector...', value: '' as IndustryType },
  { label: 'Tecnología & Software',   value: 'technology'    },
  { label: 'Finanzas & Contabilidad', value: 'finance'       },
  { label: 'Comercio / Retail',       value: 'retail'        },
  { label: 'Salud & Farmacia',        value: 'health'        },
  { label: 'Educación',               value: 'education'     },
  { label: 'Manufactura',             value: 'manufacturing' },
  { label: 'Servicios profesionales', value: 'services'      },
  { label: 'Otro',                    value: 'other'         },
];

export const COMPANY_SIZE_OPTIONS: { label: string; value: CompanySize; range: string; Icon: LucideIcon }[] = [
  { label: 'Micro',   value: 'micro',  range: '1–10 empleados',   Icon: Leaf },
  { label: 'Pequeña', value: 'small',  range: '11–50 empleados',  Icon: Store },
  { label: 'Mediana', value: 'medium', range: '51–200 empleados', Icon: Building2 },
  { label: 'Grande',  value: 'large',  range: '200+ empleados',   Icon: Factory },
];

export const COUNTRY_OPTIONS = [
  'Argentina','Bolivia','Chile','Colombia','Costa Rica','Ecuador',
  'El Salvador','Guatemala','Honduras','México','Nicaragua','Panamá',
  'Paraguay','Perú','República Dominicana','Uruguay','Venezuela',
];

export const INITIAL_FORM_DATA: CompanyFormData = {
  companyName:'', taxId:'', industryType:'', companySize:'',
  foundedYear:'', website:'', adminFullName:'', adminEmail:'',
  adminPhone:'', adminPosition:'', country:'', state:'', city:'',
  address:'', postalCode:'', password:'', confirmPassword:'',
  acceptTerms: false, acceptMarketing: false,
  companyType: '', products: [], services: [],
};