export interface ResUser {
  id: number;
  name: string;
  login?: string;
  email: string;
  active: boolean;
  created_at?: string;
}

export interface BillnovaUser {
  id: number;
  res_user_id: number;
  role?: "admin" | "moderator" | "seller" | "viewer";
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  is_mobile_user?: boolean;
  last_login?: string;
}

export type UserModalMode = "create" | "edit" | "view";

export interface UserModalState {
  open: boolean;
  mode: UserModalMode;
  userId?: number;
}

