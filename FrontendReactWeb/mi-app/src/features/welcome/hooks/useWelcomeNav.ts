"use client";
import { useRouter } from "next/navigation";
import { routes } from "../data/constants";

export function useWelcomeNav() {
  const router = useRouter();

  const goToLogin    = () => router.push(routes.login);
  const goToRegister = () => router.push(routes.register);

  return { goToLogin, goToRegister };
}