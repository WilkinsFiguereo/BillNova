"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { getStoredAuthState } from "@/features/auth/login/data/storage";
import { getLandingRouteForRole, normalizeUserRole } from "@/features/auth/session/roleRoutes";

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
      const destination = getLandingRouteForRole(normalizeUserRole(stored.role));
      router.replace(destination);
    }
  }, [router, pathname]);

  return <>{children}</>;
}
