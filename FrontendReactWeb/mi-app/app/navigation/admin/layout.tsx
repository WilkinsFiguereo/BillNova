"use client";

import { useEffect } from "react";
import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { getStoredAuthState } from "@/features/auth/login";

export default function AdminLayout({ children }: { children: ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    const user = getStoredAuthState();
    if (!user) router.replace("/login");
  }, [router]);

  return children;
}
