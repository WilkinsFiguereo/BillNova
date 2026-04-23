export interface MobileProfile {
  uid: number;
  billnova_user_id?: number | null;
  name: string;
  login: string;
  email: string;
  phone?: string;
  address?: string;
  role?: string;
  company_id?: number | null;
  company_name?: string | null;
}

export interface MobileProfileResponse {
  ok: boolean;
  data?: MobileProfile;
  error?: string;
}

export interface UpdateMobileProfilePayload {
  name: string;
  email: string;
  phone?: string;
  address?: string;
  password?: string;
}
