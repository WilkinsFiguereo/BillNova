import type { UserRole } from "./types/auth.types";

export const AUTH_ENTRY_ROUTE = "/navigation/auth/register/page";

const ROLE_LANDING_ROUTES: Record<UserRole, string> = {
  admin: "/navigation/admin/dashboard/page",
  moderator: "/navigation/moderation/dashboard/page",
  seller: "/navigation/seller/dashboard/page",
  gerente: "/navigation/seller/dashboard/page",
};

export function getLandingRouteForRole(role?: UserRole | null) {
  if (!role) return ROLE_LANDING_ROUTES.seller;
  return ROLE_LANDING_ROUTES[role] ?? ROLE_LANDING_ROUTES.seller;
}
