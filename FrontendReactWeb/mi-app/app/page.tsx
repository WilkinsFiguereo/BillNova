"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getStoredAuthState } from "@/features/auth/login/data/storage";
import { getLandingRouteForRole } from "@/features/auth/session/roleRoutes";

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    const stored = getStoredAuthState();

    if (!stored?.sessionToken) {
      router.replace("/navigation/welcome");
      return;
    }

    const role = stored.role || "seller";
    const destination = getLandingRouteForRole(role);
    router.replace(destination);
  }, [router]);

  return null;
}
