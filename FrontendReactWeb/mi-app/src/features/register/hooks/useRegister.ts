"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { registerApi } from "../../auth/register/data/api";
import { validateRegisterForm } from "../data/validators";
import type { RegisterFormState, RegisterPayload } from "../../auth/register/types/register.types";

const INITIAL_VALUES: RegisterPayload = {
  name: "",
  email: "",
  login: "",
  password: "",
};

const INITIAL_STATE: RegisterFormState = {
  values: INITIAL_VALUES,
  errors: {},
  isLoading: false,
  serverError: null,
  success: false,
};

export function useRegister() {
  const router = useRouter();
  const [state, setState] = useState<RegisterFormState>(INITIAL_STATE);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setState((prev) => ({
      ...prev,
      values: { ...prev.values, [name]: value },
      errors: { ...prev.errors, [name]: undefined },
      serverError: null,
    }));
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      console.info("[register] submit intercepted", state.values);

      const errors = validateRegisterForm(state.values);
      if (Object.keys(errors).length > 0) {
        console.warn("[register] validation errors", errors);
        setState((prev) => ({ ...prev, errors }));
        return;
      }

      setState((prev) => ({ ...prev, isLoading: true, serverError: null }));
      try {
        console.info("[register] calling register api");
        const res = await registerApi.register(state.values);
        console.info("[register] api response", res);

        if (res.ok) {
          setState((prev) => ({
            ...prev,
            isLoading: false,
            success: true,
            serverError: res.warning ?? null,
          }));
          const nextEmail = encodeURIComponent(state.values.email.trim().toLowerCase());
          const nextToken = res.dev_token ? `&token=${encodeURIComponent(res.dev_token)}` : "";
          setTimeout(() => router.push(`/navigation/auth/verify-email?email=${nextEmail}${nextToken}`), 1600);
        } else {
          setState((prev) => ({
            ...prev,
            isLoading: false,
            serverError: res.error ?? "Error al registrar la cuenta",
          }));
        }
      } catch (error) {
        console.error("[register] request failed", error);
        setState((prev) => ({
          ...prev,
          isLoading: false,
          serverError: "No se pudo conectar con el servidor.",
        }));
      }
    },
    [state.values, router],
  );

  return { state, handleChange, handleSubmit };
}
