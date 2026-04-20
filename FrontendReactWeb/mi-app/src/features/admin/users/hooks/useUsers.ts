"use client";
import { useState, useEffect, useCallback } from "react";
import {
  apiGetResUsers,
  apiGetBillnovaUsers,
  apiGetResUser,
  apiGetBillnovaUser,
  apiDeleteResUser,
  apiDeleteBillnovaUser,
} from "../data/userApi";
import type { ResUser, BillnovaUser } from "../types/user.types";

export function useUsers() {
  const [resUsers,      setResUsers]      = useState<ResUser[]>([]);
  const [billnovaUsers, setBillnovaUsers] = useState<BillnovaUser[]>([]);
  const [loading,       setLoading]       = useState(true);
  const [error,         setError]         = useState<string | null>(null);
  const [deleting,      setDeleting]      = useState<number | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [res, bill] = await Promise.all([
        apiGetResUsers(),
        apiGetBillnovaUsers(),
      ]);
      setResUsers(res);
      setBillnovaUsers(bill);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al cargar usuarios.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const getUser = useCallback(async (id: number, userType: "res" | "billnova"): Promise<ResUser | BillnovaUser | null> => {
    try {
      if (userType === "res") {
        return await apiGetResUser(id);
      } else {
        return await apiGetBillnovaUser(id);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al obtener usuario.");
      return null;
    }
  }, []);

  const removeUser = useCallback(async (id: number) => {
    setDeleting(id);
    try {
      const isRes = resUsers.some(u => u.id === id);
      if (isRes) {
        await apiDeleteResUser(id);
        setResUsers(prev => prev.map(u => u.id === id ? { ...u, active: false } : u));
      } else {
        await apiDeleteBillnovaUser(id);
        setBillnovaUsers(prev => prev.map(u => u.id === id ? { ...u, active: false } : u));
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al deshabilitar usuario.");
    } finally {
      setDeleting(null);
    }
  }, [resUsers]);

  return {
    resUsers,
    billnovaUsers,
    loading,
    error,
    deleting,
    refresh: fetch,
    getUser,
    removeUser,
  };
}
