"use client";

import { getStoredAuthState, updateStoredAuthState } from "@/features/auth/login/data/storage";

const COMPANY_KEY_PREFIX = "billnova.company_id.user";
const BUSINESS_TYPE_KEY_PREFIX = "billnova.business_type.user";
const LEGACY_COMPANY_KEY = "billnova_company_id";
const LEGACY_FALLBACK_KEY = "company_id";

function isBrowser() {
  return typeof window !== "undefined";
}

function parseCompanyId(value: string | null | undefined): number | null {
  const id = value ? Number(value) : NaN;
  return Number.isFinite(id) && id > 0 ? id : null;
}

function getScopedCompanyKey(userId: number) {
  return `${COMPANY_KEY_PREFIX}.${userId}`;
}

function getScopedBusinessTypeKey(userId: number) {
  return `${BUSINESS_TYPE_KEY_PREFIX}.${userId}`;
}

export function getActiveAuthUserId(): number | null {
  return getStoredAuthState()?.uid ?? null;
}

export function getStoredCompanyIdForUser(userId?: number | null): number | null {
  if (!isBrowser() || !userId) return null;

  const scopedKey = getScopedCompanyKey(userId);
  const sessionValue = parseCompanyId(window.sessionStorage.getItem(scopedKey));
  const localValue = parseCompanyId(window.localStorage.getItem(scopedKey));

  return sessionValue ?? localValue;
}

export function getActiveCompanyId(): number | null {
  const authUserId = getActiveAuthUserId();
  const scopedCompanyId = getStoredCompanyIdForUser(authUserId);
  const authCompanyId = getStoredAuthState()?.companyId;
  const normalizedAuthCompanyId =
    typeof authCompanyId === "number" && Number.isFinite(authCompanyId) && authCompanyId > 0
      ? authCompanyId
      : null;

  // La sesion autenticada es la fuente de verdad. Si el storage quedo desactualizado,
  // lo sincronizamos para evitar enviar company_id de otra empresa.
  if (normalizedAuthCompanyId) {
    if (authUserId && scopedCompanyId !== normalizedAuthCompanyId) {
      setStoredCompanyIdForUser(normalizedAuthCompanyId, authUserId);
    }
    return normalizedAuthCompanyId;
  }

  return scopedCompanyId;
}

export function getStoredBusinessTypeForUser(userId?: number | null): string | null {
  if (!isBrowser() || !userId) return null;

  const scopedKey = getScopedBusinessTypeKey(userId);
  const sessionValue = window.sessionStorage.getItem(scopedKey);
  const localValue = window.localStorage.getItem(scopedKey);
  return sessionValue ?? localValue ?? null;
}

export function getActiveBusinessType(): string | null {
  return getStoredBusinessTypeForUser(getActiveAuthUserId());
}

export function setStoredCompanyIdForUser(companyId: number, userId?: number | null) {
  if (!isBrowser() || !userId || !Number.isFinite(companyId) || companyId <= 0) return;

  const scopedKey = getScopedCompanyKey(userId);
  const serialized = String(companyId);

  window.sessionStorage.setItem(scopedKey, serialized);
  window.localStorage.setItem(scopedKey, serialized);

  // Limpia claves globales antiguas para evitar mezclar empresas entre cuentas.
  window.sessionStorage.removeItem(LEGACY_COMPANY_KEY);
  window.localStorage.removeItem(LEGACY_COMPANY_KEY);
  window.localStorage.removeItem(LEGACY_FALLBACK_KEY);
}

export function clearStoredCompanyIdForUser(userId?: number | null) {
  if (!isBrowser()) return;

  if (userId) {
    const scopedKey = getScopedCompanyKey(userId);
    const businessTypeKey = getScopedBusinessTypeKey(userId);
    window.sessionStorage.removeItem(scopedKey);
    window.localStorage.removeItem(scopedKey);
    window.sessionStorage.removeItem(businessTypeKey);
    window.localStorage.removeItem(businessTypeKey);
  }

  window.sessionStorage.removeItem(LEGACY_COMPANY_KEY);
  window.localStorage.removeItem(LEGACY_COMPANY_KEY);
  window.localStorage.removeItem(LEGACY_FALLBACK_KEY);
}

export function syncCompanyIdWithCurrentUser(companyId?: number | null) {
  const userId = getActiveAuthUserId();
  if (!userId) return;

  if (companyId && companyId > 0) {
    setStoredCompanyIdForUser(companyId, userId);
    updateStoredAuthState((user) =>
      user.uid === userId
        ? {
            ...user,
            companyId,
          }
        : user,
    );
    return;
  }

  clearStoredCompanyIdForUser(userId);
  updateStoredAuthState((user) =>
    user.uid === userId
      ? {
          ...user,
          companyId: undefined,
        }
      : user,
  );
}

export function syncBusinessTypeWithCurrentUser(businessType?: string | null) {
  const userId = getActiveAuthUserId();
  if (!isBrowser() || !userId) return;

  const scopedKey = getScopedBusinessTypeKey(userId);
  if (businessType) {
    window.sessionStorage.setItem(scopedKey, businessType);
    window.localStorage.setItem(scopedKey, businessType);
    return;
  }

  window.sessionStorage.removeItem(scopedKey);
  window.localStorage.removeItem(scopedKey);
}

export function hasCompanyForCurrentUser(): boolean {
  return getActiveCompanyId() !== null;
}
