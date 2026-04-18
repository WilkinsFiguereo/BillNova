"use client";
import { useState, useMemo } from "react";
import type { ResUser, BillnovaUser } from "../types/user.types";

interface FilteredUsers {
  resUsers: ResUser[];
  billnovaUsers: BillnovaUser[];
}

export function useUserSearch(
  resUsers: ResUser[],
  billnovaUsers: BillnovaUser[]
): {
  query: string;
  setQuery: (q: string) => void;
  filtered: FilteredUsers;
} {
  const [query, setQuery] = useState("");

  const filtered = useMemo<FilteredUsers>(() => {
    const q = query.trim().toLowerCase();

    if (!q) return { resUsers, billnovaUsers };

    const matchUser = (u: ResUser | BillnovaUser) =>
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.role.toLowerCase().includes(q);

    return {
      resUsers:      resUsers.filter(matchUser),
      billnovaUsers: billnovaUsers.filter(matchUser),
    };
  }, [query, resUsers, billnovaUsers]);

  return { query, setQuery, filtered };
}