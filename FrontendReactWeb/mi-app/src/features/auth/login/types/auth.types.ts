export interface AuthUser {
  uid: number;
  name: string;
  email: string;
  role?: AuthRole;
  sessionToken?: string;
  sessionExpiresAt?: string;
  phone?: string;
  companyName?: string;
}

export type AuthRole = "admin" | "moderation" | "seller" | "user";

export interface LoginPayload {
  username: string;
  password: string;
  rememberMe: boolean;
}

export interface LoginResponse {
  ok: boolean;
  uid?: number;
  name?: string;
  email?: string;
  role?: AuthRole;
  session_token?: string;
  session_expires_at?: string;
  code?: "ACCOUNT_NOT_VERIFIED" | "ACCOUNT_DISABLED";
  error?: string;
}

export interface SessionResponse {
  ok: boolean;
  uid?: number;
  name?: string;
  email?: string;
  role?: AuthRole;
  session_token?: string;
  session_expires_at?: string;
  error?: string;
}

export interface ForgotPasswordPayload {
  email: string;
  method: "otp" | "link";
}

export interface ForgotPasswordResponse {
  ok: boolean;
  message?: string;
  error?: string;
  method?: "otp" | "link";
  delivery?: "email" | "simulated";
  dev_otp?: string;
  dev_token?: string;
}

export interface ResetPasswordPayload {
  email: string;
  otp: string;
  token: string;
  newPassword: string;
  confirmPassword: string;
}

export interface VerifyEmailPayload {
  email: string;
  code: string;
}

export interface VerifyEmailResponse {
  ok: boolean;
  error?: string;
  code?: "OTP_TEMP_BLOCK" | "OTP_COOLDOWN" | "OTP_RESEND_LIMIT";
  retry_after_seconds?: number;
}

export interface ResendCodeResponse {
  ok: boolean;
  message?: string;
  error?: string;
  code?: "OTP_TEMP_BLOCK" | "OTP_COOLDOWN" | "OTP_RESEND_LIMIT";
  retry_after_seconds?: number;
  dev_code?: string;
}

export interface ActiveSession {
  id: number;
  is_current: boolean;
  remember_me: boolean;
  user_agent?: string;
  ip_address?: string;
  created_at?: string;
  last_seen_at?: string;
  expires_at?: string;
}

export interface DeviceSessionsResponse {
  ok: boolean;
  sessions?: ActiveSession[];
  error?: string;
}
