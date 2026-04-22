import type { UserRole } from "@/features/auth/login/types/auth.types";

export const ROLE_LANDING_ROUTES: Record<UserRole, string> = {
  admin: "/navigation/admin/dashboard/page",
  moderator: "/navigation/moderation/dashboard/page",
  seller: "/navigation/seller/dashboard/page",
  gerente: "/navigation/seller/dashboard/page",
  worker: "/navigation/seller/dashboard/page",
};

export function normalizeUserRole(role: unknown): UserRole {
  if (typeof role !== "string") return "seller";
  const normalized = role.trim().toLowerCase();

  const aliases: Record<string, UserRole> = {
    admin: "admin",
    administrator: "admin",
    superadmin: "admin",

    moderator: "moderator",
    mod: "moderator",
    moderation: "moderator",

    seller: "seller",
    sales: "seller",

    gerente: "gerente",
    manager: "gerente",

    worker: "worker",
    trabajador: "worker",
  };

  return aliases[normalized] ?? "seller";
}

export function getLandingRouteForRole(role: unknown): string {
  return ROLE_LANDING_ROUTES[normalizeUserRole(role)];
}
