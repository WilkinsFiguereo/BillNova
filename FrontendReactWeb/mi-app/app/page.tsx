"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getStoredAuthState } from "@/features/auth/login/data/storage";
import { getLandingRouteForRole } from "@/features/auth/session/roleRoutes";

export default function HomePage() {
  redirect("/navigation/auth/login/page");
}
