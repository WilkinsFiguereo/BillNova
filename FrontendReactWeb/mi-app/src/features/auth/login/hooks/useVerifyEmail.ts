"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authApi } from "../data/api";

export function useVerifyEmail(initialEmail = "", initialToken = "") {
  const router = useRouter();
  const [email, setEmail] = useState(initialEmail);
  const [token, setToken] = useState(initialToken);
  const [cooldown, setCooldown] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (initialEmail) setEmail(initialEmail);
  }, [initialEmail]);

  useEffect(() => {
    if (initialToken) setToken(initialToken);
  }, [initialToken]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = window.setInterval(() => setCooldown((prev) => Math.max(0, prev - 1)), 1000);
    return () => window.clearInterval(timer);
  }, [cooldown]);

  const verify = useCallback(async () => {
    if (!email.trim() || !token.trim()) {
      setError("Abre el enlace que recibiste por correo o solicita uno nuevo.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setMessage(null);
    try {
      const res = await authApi.verifyEmail({ email, token });
      if (res.ok) {
        setMessage(res.message ?? "Correo verificado. Ya puedes iniciar sesion.");
        window.setTimeout(() => router.push("/navigation/auth/login"), 1400);
        return;
      }
      if (res.retry_after_seconds) setCooldown(res.retry_after_seconds);
      setError(res.error ?? "No se pudo verificar el correo.");
    } catch {
      setError("No se pudo conectar con el servidor.");
    } finally {
      setIsLoading(false);
    }
  }, [email, router, token]);

  const resend = useCallback(async () => {
    if (!email.trim()) {
      setError("Ingresa tu email para reenviar.");
      return;
    }
    if (cooldown > 0) return;

    setIsResending(true);
    setError(null);
    setMessage(null);
    try {
      const res = await authApi.resendVerificationCode(email);
      if (res.ok) {
        setMessage(res.message ?? "Correo de verificacion reenviado.");
        setCooldown(60);
        return;
      }
      if (res.retry_after_seconds) setCooldown(res.retry_after_seconds);
      setError(res.error ?? "No se pudo reenviar.");
    } catch {
      setError("No se pudo conectar con el servidor.");
    } finally {
      setIsResending(false);
    }
  }, [cooldown, email]);

  return {
    email,
    token,
    cooldown,
    isLoading,
    isResending,
    error,
    message,
    setEmail,
    setToken,
    verify,
    resend,
  };
}
