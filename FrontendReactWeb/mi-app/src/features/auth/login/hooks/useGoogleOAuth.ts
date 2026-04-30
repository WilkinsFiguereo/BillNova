"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { authApi } from "../data/api";
import { persistAuthState } from "../data/storage";
import type { SessionResponse, UserRole } from "../types/auth.types";
import { getLandingRouteForRole, normalizeUserRole } from "@/features/auth/session/roleRoutes";
import { syncCompanyIdWithCurrentUser } from "@/features/seller/shared/companySession";
import { getOdooUrl } from "@/lib/odooApi";

interface UseGoogleOAuthOptions {
  rememberMe?: boolean;
}

function getSingle(value: string | null): string | undefined {
  return value && value.length > 0 ? value : undefined;
}

function completeGoogleLogin({
  rememberMe,
  setError,
  setIsLoading,
}: {
  rememberMe: boolean;
  setError: (value: string | null) => void;
  setIsLoading: (value: boolean) => void;
}) {
  return (payload?: Record<string, unknown>) => {
    console.log("[Google OAuth][web] finishGoogleLogin payload:", payload);
    const ok = typeof payload?.ok === "number" ? String(payload.ok) : String(payload?.ok ?? "");
    const sessionToken = typeof payload?.session_token === "string" ? payload.session_token : undefined;
    const uidRaw = typeof payload?.uid === "number" || typeof payload?.uid === "string" ? String(payload.uid) : undefined;
    const login = typeof payload?.login === "string" ? payload.login : undefined;
    const name = typeof payload?.name === "string" ? payload.name : undefined;
    const email = typeof payload?.email === "string" ? payload.email : undefined;
    const role = typeof payload?.role === "string" ? payload.role : undefined;
    const companyIdRaw =
      typeof payload?.company_id === "number" || typeof payload?.company_id === "string"
        ? String(payload.company_id)
        : undefined;
    const serverError = typeof payload?.error === "string" ? payload.error : undefined;

    if (ok === "1" && sessionToken && uidRaw && login) {
      const userRole: UserRole = normalizeUserRole(role);
      const companyId = companyIdRaw ? Number(companyIdRaw) : undefined;
      const landingRoute = getLandingRouteForRole(userRole);

      console.log("[Google OAuth][web] payload valid, persisting session", {
        uid: uidRaw,
        login,
        email,
        role: userRole,
        companyId,
        landingRoute,
      });

      persistAuthState(
        {
          uid: Number(uidRaw),
          email: email ?? login,
          name: name ?? login,
          role: userRole,
          companyId,
          sessionToken,
        },
        rememberMe,
      );
      syncCompanyIdWithCurrentUser(companyId);
      setIsLoading(false);
      if (typeof window !== "undefined") {
        console.log("[Google OAuth][web] redirecting to landing route:", landingRoute);
        window.location.assign(landingRoute);
      }
      return true;
    }

    console.warn("[Google OAuth][web] invalid payload for login", {
      ok,
      hasSessionToken: Boolean(sessionToken),
      hasUid: Boolean(uidRaw),
      hasLogin: Boolean(login),
      serverError,
    });
    setError(serverError ?? "No se pudo completar la autenticacion con Google.");
    setIsLoading(false);
    return false;
  };
}

function buildGooglePayloadFromSession(session: SessionResponse): Record<string, unknown> | null {
  if (!session.ok || !session.uid || !session.session_token || !session.email) {
    return null;
  }

  return {
    ok: 1,
    uid: session.uid,
    login: session.email,
    name: session.name ?? session.email,
    email: session.email,
    role: session.role,
    company_id: session.company_id,
    session_token: session.session_token,
  };
}

export function useGoogleOAuth(options: UseGoogleOAuthOptions = {}) {
  const { rememberMe = true } = options;
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const allowedOrigins = useMemo(() => {
    if (typeof window === "undefined") return [];

    const origins = new Set<string>([window.location.origin]);
    try {
      origins.add(new URL(getOdooUrl()).origin);
    } catch {
      // ignore invalid env config
    }
    const values = Array.from(origins);
    console.log("[Google OAuth][web] allowed origins:", values);
    return values;
  }, []);
  const finishGoogleLogin = useMemo(
    () => completeGoogleLogin({ rememberMe, setError, setIsLoading }),
    [rememberMe],
  );

  const recoverGoogleSession = useCallback(async () => {
    try {
      console.log("[Google OAuth][web] attempting session recovery from backend");
      const session = await authApi.getSession();
      console.log("[Google OAuth][web] session recovery response", session);
      const payload = buildGooglePayloadFromSession(session);
      if (payload) {
        return finishGoogleLogin(payload);
      }
    } catch (error) {
      console.warn("[Google OAuth][web] session recovery failed", error);
    }

    setIsLoading(false);
    return false;
  }, [finishGoogleLogin]);

  const callbackParams = useMemo(() => {
    const ok = searchParams.get("ok");
    const sessionToken = getSingle(searchParams.get("session_token"));
    const uid = getSingle(searchParams.get("uid"));
    const login = getSingle(searchParams.get("login"));
    const name = getSingle(searchParams.get("name"));
    const email = getSingle(searchParams.get("email"));
    const role = getSingle(searchParams.get("role"));
    const companyId = getSingle(searchParams.get("company_id"));
    const serverError = getSingle(searchParams.get("error"));

    return {
      ok,
      sessionToken,
      uid,
      login,
      name,
      email,
      role,
      companyId,
      serverError,
    };
  }, [searchParams]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleMessage = (event: MessageEvent) => {
      console.log("[Google OAuth][web] message received", {
        origin: event.origin,
        data: event.data,
      });

      if (!allowedOrigins.includes(event.origin)) {
        console.warn("[Google OAuth][web] ignored message from unexpected origin", {
          origin: event.origin,
          allowedOrigins,
        });
        return;
      }
      if (!event.data || event.data.type !== "billnova-google-oauth-result") {
        console.warn("[Google OAuth][web] ignored message with unexpected payload", event.data);
        return;
      }

      console.log("[Google OAuth][web] processing popup payload");
       if (!finishGoogleLogin(event.data.payload)) {
         console.warn("[Google OAuth][web] finishGoogleLogin failed, attempting session recovery");
         // No redirigir a Odoo, intentar recuperar sesión desde nuestro backend
         void recoverGoogleSession();
       }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [allowedOrigins, finishGoogleLogin]);

  useEffect(() => {
    console.log("[Google OAuth][web] callback params changed", callbackParams);
    if (!callbackParams.ok && !callbackParams.serverError) return;

    if (
      callbackParams.ok === "1" &&
      callbackParams.sessionToken &&
      callbackParams.uid &&
      callbackParams.login
    ) {
      finishGoogleLogin({
        ok: callbackParams.ok,
        session_token: callbackParams.sessionToken,
        uid: callbackParams.uid,
        login: callbackParams.login,
        name: callbackParams.name,
        email: callbackParams.email,
        role: callbackParams.role,
        company_id: callbackParams.companyId,
      });
      return;
    }

    console.warn("[Google OAuth][web] callback params invalid", callbackParams);
    setError(callbackParams.serverError ?? "No se pudo completar la autenticacion con Google.");
    setIsLoading(false);
    router.replace(pathname);
  }, [callbackParams, finishGoogleLogin, pathname, router]);

  const startGoogleOAuth = useCallback(async () => {
    if (typeof window === "undefined") return;

    setError(null);
    setIsLoading(true);

    try {
      const redirectUri = `${window.location.origin}${pathname}`;
      console.log("[Google OAuth][web] starting flow", {
        pathname,
        redirectUri,
      });
      const response = await authApi.googleAuthorizeUrl(redirectUri);
      console.log("[Google OAuth][web] authorize-url response", response);

      if (!response.ok || !response.auth_url) {
        setError(response.error ?? "No se pudo iniciar Google OAuth.");
        setIsLoading(false);
        return;
      }

      const popup = window.open(
        response.auth_url,
        "billnova-google-oauth",
        "popup=yes,width=520,height=720,menubar=no,toolbar=no,location=yes,status=no,resizable=yes,scrollbars=yes",
      );

       if (!popup) {
         console.warn("[Google OAuth][web] popup blocked, attempting session recovery");
         setIsLoading(false);
         void recoverGoogleSession();
         return;
       }

      console.log("[Google OAuth][web] popup opened successfully");
      const poll = window.setInterval(() => {
        if (!popup.closed) return;
        window.clearInterval(poll);
        console.log("[Google OAuth][web] popup closed before flow completed");
        void recoverGoogleSession();
      }, 500);
    } catch (error) {
      console.error("[Google OAuth][web] start flow failed", error);
      setError("No se pudo conectar con el servidor.");
      setIsLoading(false);
    }
  }, [pathname, recoverGoogleSession]);

  return {
    googleLoading: isLoading,
    googleError: error,
    startGoogleOAuth,
    clearGoogleError: () => setError(null),
  };
}
