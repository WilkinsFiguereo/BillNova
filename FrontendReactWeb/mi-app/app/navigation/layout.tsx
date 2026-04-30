"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { getStoredAuthState } from "@/features/auth/login/data/storage";
import { getUserRoleRoute } from "@/features/auth/login/hooks/useRoleGuard";

const AUTH_OPTIONAL_ROUTE_PREFIXES = [
  "/navigation/privacy",
  "/navigation/terms",
];

const PUBLIC_ONLY_ROUTE_PREFIXES = [
  "/navigation/welcome",
  "/navigation/auth/login",
  "/navigation/auth/register",
  "/navigation/auth/forgot-password",
  "/navigation/auth/reset-password",
  "/navigation/auth/verify-email",
];

export default function NavigationLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [allowed, setAllowed] = useState(true);
  const [resolved, setResolved] = useState(false);

  useEffect(() => {
    const isAuthOptional = AUTH_OPTIONAL_ROUTE_PREFIXES.some((prefix) => pathname.startsWith(prefix));
    const isPublicOnly = PUBLIC_ONLY_ROUTE_PREFIXES.some((prefix) => pathname.startsWith(prefix));

    const stored = getStoredAuthState();
    const hasSession = Boolean(stored?.uid && stored?.sessionToken);

    if (hasSession) {
      if (isPublicOnly) {
        setAllowed(false);
        setResolved(true);
        router.replace(getUserRoleRoute(stored?.role));
        return;
      }

      setAllowed(true);
      setResolved(true);
      return;
    }

    if (isAuthOptional || isPublicOnly) {
      setAllowed(true);
      setResolved(true);
      return;
    }

    setAllowed(false);
    setResolved(true);
    router.replace("/navigation/welcome");
  }, [pathname, router]);

  if (!resolved) return null;
  if (!allowed) return null;
  return children;
}
