import type { Stat, TrustBadge, FeaturePill } from "../types";

export const stats: Stat[] = [
  { value: "10K+",  label: "Empresas" },
  { value: "2M+",   label: "Facturas" },
  { value: "99.9%", label: "Uptime"   },
  { value: "RD$",   label: "DOP"      },
];

export const featurePills: FeaturePill[] = [
  { label: "Facturación DGII" },
  { label: "ITBIS & ISR"      },
  { label: "Reportes"         },
  { label: "Inventario"       },
  { label: "Nómina"           },
  { label: "Multi-empresa"    },
];

export const trustBadges: TrustBadge[] = [
  { icon: "🔐", label: "SSL 256" },
  { icon: "🏛️", label: "DGII"    },
  { icon: "☁️", label: "Cloud"   },
  { icon: "🇩🇴", label: "RD"     },
];

export const routes = {
  login:    "/navigation/auth/login",
  register: "/navigation/auth/register",
} as const;