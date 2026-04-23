"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getStoredAuthState } from "@/features/auth/login/data/storage";
import { ProfilePage } from "@/features/profile/ProfilePage";

export default function ProfileRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    const stored = getStoredAuthState();
    if (!stored?.uid || !stored?.sessionToken) {
      router.replace("/navigation/welcome");
      return;
    }
  }, [router]);

  return <ProfilePage />;
}