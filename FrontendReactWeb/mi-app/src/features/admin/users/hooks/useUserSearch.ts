import { useMemo, useState } from "react";
import type { BillnovaUser, ResUser } from "../types/user.types";

export function useUserSearch(resUsers: ResUser[], billnovaUsers: BillnovaUser[]) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return resUsers;

    const byId = new Map<number, BillnovaUser>();
    for (const b of billnovaUsers) byId.set(b.res_user_id, b);

    return resUsers.filter((u) => {
      const b = byId.get(u.id);
      return (
        String(u.id).includes(q) ||
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        (b?.role?.toLowerCase().includes(q) ?? false)
      );
    });
  }, [resUsers, billnovaUsers, query]);

  return { query, setQuery, filtered };
}

