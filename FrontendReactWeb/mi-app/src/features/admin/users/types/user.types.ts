export type AdminUserType = "res" | "billnova";

export interface ResUser {
  id: number;
  name: string;
  login: string;
  email: string;
  role: string;
  active: boolean;
  createdAt?: string;
}

export interface BillnovaUser {
  id: number;
  name: string;
  login: string;
  email: string;
  role: string;
  active: boolean;
  phone?: string;
  address?: string;
  is_mobile_user?: boolean;
  res_user_id?: number | null;
  createdAt?: string;
}
