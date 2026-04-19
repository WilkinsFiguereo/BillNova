"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { getStoredAuthState } from "@/features/auth/login/data/storage";
import { getLandingRouteForRole } from "@/features/auth/session/roleRoutes";
import type { UserRole } from "@/features/auth/login/types/auth.types";

export function AuthSessionGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const stored = getStoredAuthState();

    if (!stored?.sessionToken) {
      return;
    }

    const isAuthRoute = pathname.startsWith("/navigation/auth/login");
    const isWelcome = pathname.startsWith("/navigation/welcome");
    const isRegister = pathname.startsWith("/navigation/auth/register");

    if (isAuthRoute || isWelcome || isRegister) {
      const role = (stored.role || "seller") as UserRole;
      const destination = getLandingRouteForRole(role);
      router.replace(destination);
    }
  }, [router, pathname]);

  return <>{children}</>;
}
