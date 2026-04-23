import { useState, useCallback } from 'react';
import { useAuthContext } from '../../../core/providers/AuthProvider';
import type { LoginPayload, RegisterPayload } from '../types/auth.types';

export function useLogin() {
  const { login, isLoading } = useAuthContext();
  const [error, setError] = useState<string | null>(null);
  const [errorCode, setErrorCode] = useState<string | null>(null);
  const [verificationEmail, setVerificationEmail] = useState('');

  const handleLogin = useCallback(async (payload: LoginPayload) => {
    setError(null);
    setErrorCode(null);
    setVerificationEmail('');

    const result = await login(payload);
    if (!result.ok) {
      setError(result.error ?? 'Error al iniciar sesion');
      setErrorCode(result.code ?? null);
      setVerificationEmail(result.email ?? payload.login);
    }
    return result;
  }, [login]);

  return {
    handleLogin,
    isLoading,
    error,
    errorCode,
    verificationEmail,
    clearError: () => {
      setError(null);
      setErrorCode(null);
      setVerificationEmail('');
    },
  };
}

export function useRegister() {
  const { register, isLoading } = useAuthContext();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState('');
  const [message, setMessage] = useState<string | null>(null);

  const handleRegister = useCallback(async (payload: RegisterPayload) => {
    setError(null);
    setSuccess(false);
    setMessage(null);

    const result = await register(payload);
    if (result.ok) {
      setSuccess(true);
      setVerificationEmail(result.email ?? payload.email);
      setMessage(result.message ?? null);
    } else {
      setError(result.error ?? 'Error al registrarse');
    }
    return result;
  }, [register]);

  return {
    handleRegister,
    isLoading,
    error,
    success,
    verificationEmail,
    message,
    clearError: () => {
      setError(null);
      setMessage(null);
    },
  };
}

export function useLogout() {
  const { logout } = useAuthContext();
  return { logout };
}

export function useAuth() {
  return useAuthContext();
}
