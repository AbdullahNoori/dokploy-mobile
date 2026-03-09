import useSWR from 'swr';

import {
  Initiate2FAPayload,
  LoginPayload,
  SignupPayload,
  TwoFAMethod,
  Verify2FAPayload,
  VerifyEmail,
} from '@/types/auth';
import { getRequest, postRequest } from '../lib/http';

/* 
/ --------------------------------------------------------------------
/ Login
/ --------------------------------------------------------------------
*/

interface LoginResponse {
  token: string;
}

export function login(payload: LoginPayload) {
  return postRequest<LoginResponse>('auth/login', payload);
}

interface LogoutResponse {
  message: string;
}

export function logout() {
  return postRequest<LogoutResponse>('auth/logout');
}

/* 
/ --------------------------------------------------------------------
/ Signup
/ --------------------------------------------------------------------
*/

interface ResendOTPResponse {
  message: string;
}

export function initializeSignup(payload: SignupPayload) {
  return postRequest('auth/register', payload);
}

export function verifyEmail(payload: VerifyEmail) {
  return postRequest('auth/register/verify-otp', payload);
}

export function resendOTP(email: string) {
  return postRequest<ResendOTPResponse>('auth/register/resend-otp', { email });
}

/* 
/ --------------------------------------------------------------------
/ 2FA
/ --------------------------------------------------------------------
*/

export function useGetAvailable2FAMethods() {
  return useSWR<TwoFAMethod[]>('auth/available-methods', getRequest);
}

export function initiate2FA(payload: Initiate2FAPayload) {
  return postRequest('auth/login/initiate-2fa', payload);
}

interface Verify2FAResponse {
  token: string;
}

export function verify2FA(payload: Verify2FAPayload) {
  return postRequest<Verify2FAResponse>('auth/login/verify-2fa', payload);
}
