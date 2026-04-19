import type { UserRole } from "@/features/auth/login/types/auth.types";

export const ROLE_LANDING_ROUTES: Record<UserRole, string> = {
  admin: "/navigation/admin/dashboard/page",
  moderator: "/navigation/moderation/dashboard/page",
  seller: "/navigation/seller/dashboard/page",
  gerente: "/navigation/seller/dashboard/page",
};

export function getLandingRouteForRole(role: UserRole | undefined): string {
  if (!role) return ROLE_LANDING_ROUTES.seller;
  return ROLE_LANDING_ROUTES[role] ?? ROLE_LANDING_ROUTES.seller;
}

