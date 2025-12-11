import { postRequest } from "../lib/http";

export type AuthUser = {
  id: string;
  email: string;
  full_name: string;
  first_name?: string;
  last_name?: string;
  is_active: boolean;
  is_verified: boolean;
  email_verified_from_provider: boolean;
  oauth_provider?: string;
  profile_picture?: string | null;
  created_at?: string;
  last_login_at?: string;
  roles: string[];
};

export type AuthTokensResponse = {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  user: AuthUser;
};

export type LoginPayload = {
  email: string;
  password: string;
  fingerprint?: Record<string, unknown>;
};

export function login(payload: LoginPayload) {
  return postRequest<AuthTokensResponse>("auth/login", payload);
}

export type SignupPayload = {
  email: string;
  full_name: string;
  password: string;
  fingerprint?: Record<string, unknown>;
};

export function signup(payload: SignupPayload) {
  return postRequest<{
    message: string;
    email: string;
    user_id: string;
  }>("auth/signup", payload);
}

export type VerifyEmailPayload = {
  email: string;
  otp: string;
};

export function verifyEmail(payload: VerifyEmailPayload) {
  return postRequest<AuthTokensResponse>("auth/verify-email", payload);
}

export type ResendVerificationPayload = {
  email: string;
};

export function resendVerification(payload: ResendVerificationPayload) {
  return postRequest<{ message?: string }>(
    "auth/resend-verification",
    payload
  );
}

export type InitiateResetPasswordPayload = {
  email: string;
};

export function initiateResetPassword(payload: InitiateResetPasswordPayload) {
  return postRequest<{ message?: string }>(
    "auth/initiate-reset-password",
    payload
  );
}

export type ConfirmResetPasswordPayload = {
  email: string;
  code: string;
  password: string;
};

export function confirmResetPassword(payload: ConfirmResetPasswordPayload) {
  return postRequest<{ message?: string }>(
    "auth/confirm-reset-password",
    payload
  );
}

export function logout() {
  return postRequest<void>("auth/logout");
}
