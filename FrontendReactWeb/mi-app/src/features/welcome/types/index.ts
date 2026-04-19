export type ActiveTab = "welcome" | "login" | "register";

export interface Benefit {
  icon: string;
  title: string;
  description: string;
}

export interface Stat {
  value: string;
  label: string;
}

export interface TrustBadge {
  icon: string;
  label: string;
}

export interface FeaturePill {
  label: string;
}