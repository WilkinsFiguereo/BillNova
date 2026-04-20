"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { UserRole } from "../types/auth.types";
import { getStoredAuthState } from "../data/storage";
import { getLandingRouteForRole, normalizeUserRole } from "@/features/auth/session/roleRoutes";

function hasRequiredRole(userRole: UserRole, requiredRole: UserRole): boolean {
  if (requiredRole === "seller") return userRole === "seller" || userRole === "gerente";
  return userRole === requiredRole;
}

interface RoleGuardOptions {
  allowAnyAuthenticatedUser?: boolean;
}

export function useRoleGuard(requiredRole: UserRole, options?: RoleGuardOptions) {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const lastCheckedRoleRef = useRef<string | null>(null);
  const allowAnyAuthenticatedUser = options?.allowAnyAuthenticatedUser ?? false;

  useEffect(() => {
    const guardKey = `${requiredRole}:${allowAnyAuthenticatedUser ? "auth" : "strict"}`;
    if (lastCheckedRoleRef.current === guardKey) return;
    lastCheckedRoleRef.current = guardKey;

    const cached = getStoredAuthState();
    
    if (!cached?.uid || !cached?.sessionToken) {
      setReady(false);
      setIsLoading(false);
      router.replace("/navigation/welcome");
      return;
    }

    const userRole = normalizeUserRole(cached.role);
    const userRoute = getLandingRouteForRole(userRole);

    if (!allowAnyAuthenticatedUser && !hasRequiredRole(userRole, requiredRole)) {
      setReady(false);
      setIsLoading(false);
      router.replace(userRoute);
      return;
    }

    setReady(true);
    setIsLoading(false);
  }, [allowAnyAuthenticatedUser, requiredRole, router]);

  return { isLoading, hasAccess: ready };
}

export function getUserRoleRoute(role: UserRole | undefined): string {
  return getLandingRouteForRole(role);
}
