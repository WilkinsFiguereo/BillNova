import { Building2, Factory, Leaf, Lock, MapPin, Store, User, type LucideIcon, Package, Wrench } from "lucide-react";
import { CompanyFormData, FormStep, IndustryType, CompanySize } from '../types/companyRegister.types';

export const FORM_STEPS: FormStep[] = [
  { id: 1, title: 'Empresa',   subtitle: 'Datos generales',     icon: Building2 },
  { id: 2, title: 'Contacto',  subtitle: 'Responsable admin',   icon: User },
  { id: 3, title: 'Dirección', subtitle: 'Ubicación fiscal',    icon: MapPin },
  { id: 4, title: 'Acceso',    subtitle: 'Seguridad de cuenta', icon: Lock },
  { id: 5, title: 'Negocio',   subtitle: 'Tipo de venta',       icon: Store },
  { id: 6, title: 'Catálogo',  subtitle: 'Tus ofertas',         icon: Package },
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

export const BUSINESS_TYPE_OPTIONS: { label: string; value: CompanyFormData['businessType']; description: string; Icon: LucideIcon }[] = [
  { label: 'Productos', value: 'products', description: 'Vendo productos físicos o digitales', Icon: Package },
  { label: 'Servicios', value: 'services', description: 'Ofrezco servicios profesionales', Icon: Wrench },
];

export const PRICING_TYPE_OPTIONS: { label: string; value: CompanyFormData['services'][0]['pricingType'] }[] = [
  { label: 'Precio único', value: 'unique' },
  { label: 'Por hora', value: 'monthly' },
  { label: 'Semanal', value: 'weekly' },
  { label: 'Anual', value: 'annual' },
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
  businessType: '', services: [],
};