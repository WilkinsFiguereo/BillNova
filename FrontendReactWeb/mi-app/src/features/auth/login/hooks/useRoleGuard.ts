"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { UserRole } from "../types/auth.types";
import { getStoredAuthState } from "../data/storage";

const ROLE_ROUTES: Record<UserRole, string> = {
  admin: "/navigation/admin/dashboard/page",
  moderator: "/navigation/moderation/dashboard/page",
  seller: "/navigation/seller/dashboard/page",
  gerente: "/navigation/seller/dashboard/page",
};

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
    
    if (!cached || !cached.uid) {
      router.replace("/navigation/auth/login/page");
      return;
    }

    const userRole = cached.role || "seller";
    const userRoute = ROLE_ROUTES[userRole] ?? ROLE_ROUTES.seller;

    if (!hasRequiredRole(userRole, requiredRole)) {
      router.replace(userRoute);
      return;
    }

    setReady(true);
    setIsLoading(false);
  }, [requiredRole, router]);

  return { isLoading, hasAccess: ready };
}

export function getUserRoleRoute(role: UserRole | undefined): string {
  if (!role) return "/navigation/auth/login/page";
  return ROLE_ROUTES[role] || "/navigation/auth/login/page";
}
