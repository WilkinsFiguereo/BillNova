"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRoleGuard } from "@/features/auth/login/hooks/useRoleGuard";

export default function ModeratorAdminLayout({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const { isLoading, hasAccess } = useRoleGuard("admin");

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;
  if (isLoading) return null;
  if (!hasAccess) return null;

  return children;
}
