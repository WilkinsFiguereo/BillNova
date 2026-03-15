import { CompanyFormData, FormStep, IndustryType, CompanySize } from '../types/companyRegister.types';

export const FORM_STEPS: FormStep[] = [
  { id: 1, title: 'Empresa',   subtitle: 'Datos generales',     icon: '🏢' },
  { id: 2, title: 'Contacto',  subtitle: 'Responsable admin',   icon: '👤' },
  { id: 3, title: 'Dirección', subtitle: 'Ubicación fiscal',    icon: '📍' },
  { id: 4, title: 'Acceso',    subtitle: 'Seguridad de cuenta', icon: '🔐' },
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

export const COMPANY_SIZE_OPTIONS: { label: string; value: CompanySize; range: string; emoji: string }[] = [
  { label: 'Micro',   value: 'micro',  range: '1–10 empleados',   emoji: '🌱' },
  { label: 'Pequeña', value: 'small',  range: '11–50 empleados',  emoji: '🏪' },
  { label: 'Mediana', value: 'medium', range: '51–200 empleados', emoji: '🏬' },
  { label: 'Grande',  value: 'large',  range: '200+ empleados',   emoji: '🏭' },
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
};