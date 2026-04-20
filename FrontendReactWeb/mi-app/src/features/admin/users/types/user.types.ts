export interface ResUser {
  id: number;
  name: string;
  email: string;
  role: string;
  active: boolean;
  createdAt?: string;
}

export interface BillnovaUser {
  id: number;
  name: string;
  email: string;
  role: string;
  active: boolean;
  phone?: string;
  address?: string;
  resUserId?: number;
  createdAt?: string;
}
