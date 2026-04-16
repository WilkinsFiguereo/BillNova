import type { AuthRole } from "./types/auth.types";

export const AUTH_ENTRY_ROUTE = "/navigation/auth/register/page";

const ROLE_LANDING_ROUTES: Record<AuthRole, string> = {
  admin: "/navigation/admin/users",
  moderation: "/navigation/moderation/companies",
  seller: "/navigation/seller/dashboard",
  user: "/navigation/seller/dashboard",
};

export function getLandingRouteForRole(role?: AuthRole | null) {
  if (!role) return ROLE_LANDING_ROUTES.seller;
  return ROLE_LANDING_ROUTES[role] ?? ROLE_LANDING_ROUTES.seller;
}
