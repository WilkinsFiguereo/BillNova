"use client";

import { useCallback, useEffect, useState } from "react";
import {
  apiDeleteBillnovaUser,
  apiDeleteResUser,
  apiGetBillnovaUsers,
  apiGetResUsers,
  apiUpdateBillnovaUser,
  apiUpdateResUser,
} from "../data/userApi";
import { mockBillnovaUsers, mockResUsers } from "../data/mockUsers";
import type { AdminUserType, BillnovaUser, ResUser } from "../types/user.types";

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === "true";

export function useUsers() {
  const [resUsers, setResUsers] = useState<ResUser[]>([]);
  const [billnovaUsers, setBillnovaUsers] = useState<BillnovaUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [toggling, setToggling] = useState<number | null>(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      if (USE_MOCK) {
        setResUsers(mockResUsers);
        setBillnovaUsers(mockBillnovaUsers);
      } else {
        const [res, bill] = await Promise.all([apiGetResUsers(), apiGetBillnovaUsers()]);
        setResUsers(res);
        setBillnovaUsers(bill);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al cargar usuarios.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchUsers();
  }, [fetchUsers]);

  const toggleUserActive = useCallback(
    async (id: number, userType: AdminUserType, nextActive: boolean) => {
      setToggling(id);
      setError(null);

      try {
        if (userType === "res") {
          const current = resUsers.find((user) => user.id === id);
          if (!current) return;
          const updated = await apiUpdateResUser(id, {
            name: current.name,
            login: current.login,
            email: current.email,
            role: current.role,
            active: nextActive,
          });
          setResUsers((prev) => prev.map((user) => (user.id === id ? updated : user)));
        } else {
          const current = billnovaUsers.find((user) => user.id === id);
          if (!current) return;
          const updated = await apiUpdateBillnovaUser(id, {
            name: current.name,
            email: current.email,
            role: current.role,
            active: nextActive,
            phone: current.phone,
            address: current.address,
            is_mobile_user: current.is_mobile_user,
            res_user_id: current.res_user_id,
          });
          setBillnovaUsers((prev) => prev.map((user) => (user.id === id ? updated : user)));
        }
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Error al actualizar usuario.");
      } finally {
        setToggling(null);
      }
    },
    [billnovaUsers, resUsers],
  );

  const removeUser = useCallback(
    async (id: number, userType: AdminUserType) => {
      setDeleting(id);
      setError(null);

      try {
        if (userType === "res") {
          await apiDeleteResUser(id);
          setResUsers((prev) => prev.filter((user) => user.id !== id));
        } else {
          await apiDeleteBillnovaUser(id);
          setBillnovaUsers((prev) => prev.filter((user) => user.id !== id));
        }
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Error al eliminar usuario.");
      } finally {
        setDeleting(null);
      }
    },
    [],
  );

  return {
    resUsers,
    billnovaUsers,
    loading,
    error,
    deleting,
    toggling,
    refresh: fetchUsers,
    removeUser,
    toggleUserActive,
  };
}
