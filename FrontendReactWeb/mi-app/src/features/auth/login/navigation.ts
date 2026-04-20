import type { UserRole } from "./types/auth.types";

export const AUTH_ENTRY_ROUTE = "/navigation/auth/register";

const ROLE_LANDING_ROUTES: Record<AuthRole, string> = {
  admin: "/navigation/admin/users/page",
  moderation: "/navigation/moderation/companies/page",
  seller: "/navigation/seller/dashboard/page",
  user: "/navigation/seller/dashboard/page",
};

export function getLandingRouteForRole(role?: UserRole | null) {
  if (!role) return ROLE_LANDING_ROUTES.seller;
  return ROLE_LANDING_ROUTES[role] ?? ROLE_LANDING_ROUTES.seller;
}
