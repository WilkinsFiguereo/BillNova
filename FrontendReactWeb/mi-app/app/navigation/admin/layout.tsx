"use client";

import type { ReactNode } from "react";
import { useRoleGuard } from "@/features/auth/login/hooks/useRoleGuard";

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { isLoading, hasAccess } = useRoleGuard("admin");

  useEffect(() => {
    const user = getStoredAuthState();
    if (!user) router.replace("/navigation/auth/login/page");
  }, [router]);

  return children;
}
