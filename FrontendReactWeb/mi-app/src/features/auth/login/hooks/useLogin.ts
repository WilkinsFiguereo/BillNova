"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authApi } from "../data/api";
import { getRememberMeDefault, getRememberedEmail, persistAuthState } from "../data/storage";
import { validateLogin } from "../data/validators";
import type { LoginPayload, UserRole } from "../types/auth.types";
import { getLandingRouteForRole, normalizeUserRole } from "@/features/auth/session/roleRoutes";
import { syncCompanyIdWithCurrentUser } from "@/features/seller/shared/companySession";

type LoginErrors = Partial<Record<keyof LoginPayload, string>>;

const INITIAL_VALUES: LoginPayload = {
  username: "",
  password: "",
  rememberMe: false,
};

export function useLogin() {
  const router = useRouter();
  const [values, setValues] = useState<LoginPayload>(INITIAL_VALUES);
  const [errors, setErrors] = useState<LoginErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [errorCode, setErrorCode] = useState<string | null>(null);
  const [verificationEmail, setVerificationEmail] = useState<string>("");

  useEffect(() => {
    const remembered = getRememberMeDefault();
    const username = remembered ? getRememberedEmail() : "";
    if (remembered || username) {
      setValues((prev) => ({ ...prev, rememberMe: remembered, username }));
    }
  }, []);

  const onFieldChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, type, checked, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
    setServerError(null);
    setErrorCode(null);
    if (name === "username") setVerificationEmail("");
  }, []);

  const onSubmit = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const nextErrors = validateLogin(values);
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setIsLoading(true);
    setServerError(null);
    setErrorCode(null);

    try {
      const response = await authApi.login(values);
      if (response.ok && response.uid) {
        const sessionToken = response.session_token ?? response.session_id;
        let userRole: UserRole = normalizeUserRole(response.role);
        let companyId: number | undefined;

        try {
          const sessionRes = await authApi.getSession(sessionToken);
          console.log("[LOGIN] Session response:", sessionRes);
          if (sessionRes.ok) {
            userRole = normalizeUserRole(sessionRes.role ?? userRole);
            companyId = sessionRes.company_id;
          }
        } catch (e) {
          console.error("[LOGIN] GetSession error:", e);
        }

        console.log("[LOGIN] Final role:", userRole);

        persistAuthState(
          {
            uid: response.uid,
            email: values.username,
            name: values.username,
            role: userRole,
            companyId,
            sessionToken: sessionToken,
          },
          values.rememberMe,
        );
        syncCompanyIdWithCurrentUser(companyId);
        router.push(getLandingRouteForRole(userRole));
        return;
      }

      if (response.code === "ACCOUNT_NOT_VERIFIED") {
        const nextEmail = encodeURIComponent(response.email ?? values.username);
        router.push(`/navigation/auth/account-inactive?email=${nextEmail}`);
        return;
      }

      setErrorCode(response.code ?? null);
      setVerificationEmail(response.email ?? "");
      setServerError(response.error ?? "Credenciales invalidas.");
    } catch {
      setServerError("No se pudo conectar con el servidor.");
    } finally {
      setIsLoading(false);
    }
  }, [router, values]);

  return {
    values,
    errors,
    isLoading,
    serverError,
    errorCode,
    verificationEmail,
    onFieldChange,
    onSubmit,
  };
}
