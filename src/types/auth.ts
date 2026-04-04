export type LoginPayload = {
  email: string;
  password: string;
};

export type SignupPayload = {
  email: string;
  password: string;
  name?: string;
};

export type VerifyEmail = {
  email: string;
  otp: string;
};

export type TwoFAMethod = {
  id?: string;
  type: string;
  label?: string;
};

export type Initiate2FAPayload = {
  email: string;
  password: string;
  method: string;
};

export type Verify2FAPayload = {
  email: string;
  code: string;
  method?: string;
};
