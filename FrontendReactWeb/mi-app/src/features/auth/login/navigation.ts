"use client";

import type { AuthRole } from "./types/auth.types";

export function getLandingRouteForRole(role?: AuthRole | null): string {
  switch (role) {
    case "admin":
      return "/navigation/admin/dashboard/page";
    case "moderation":
      return "/navigation/moderation/dashboard/page";
    case "seller":
      return "/navigation/seller/dashboard";
    case "user":
      return "/navigation/seller/dashboard";
    default:
      return "/navigation/moderation/dashboard/page";
  }
}
