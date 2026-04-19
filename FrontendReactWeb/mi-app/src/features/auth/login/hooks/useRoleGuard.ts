"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { UserRole } from "../types/auth.types";
import { getStoredAuthState } from "../data/storage";
import { getLandingRouteForRole } from "@/features/auth/session/roleRoutes";

function hasRequiredRole(userRole: UserRole, requiredRole: UserRole): boolean {
  if (requiredRole === "seller") return userRole === "seller" || userRole === "gerente";
  return userRole === requiredRole;
}

export function useRoleGuard(requiredRole: UserRole) {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const lastCheckedRoleRef = useRef<UserRole | null>(null);

  useEffect(() => {
    if (lastCheckedRoleRef.current === requiredRole) return;
    lastCheckedRoleRef.current = requiredRole;

    const cached = getStoredAuthState();
    
    if (!cached?.uid || !cached?.sessionToken) {
      setReady(false);
      setIsLoading(false);
      router.replace("/navigation/welcome");
      return;
    }

    const userRole = cached.role || "seller";
    const userRoute = getLandingRouteForRole(userRole);

    if (!hasRequiredRole(userRole, requiredRole)) {
      setReady(false);
      setIsLoading(false);
      router.replace(userRoute);
      return;
    }

    setReady(true);
    setIsLoading(false);
  }, [requiredRole, router]);

  return { isLoading, hasAccess: ready };
}

export function getUserRoleRoute(role: UserRole | undefined): string {
  return getLandingRouteForRole(role);
}
