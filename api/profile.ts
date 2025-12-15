import { getRequest } from "../lib/http";

import { AuthUser } from "./auth";

export type Profile = AuthUser;

export function fetchProfile() {
  return getRequest<Profile>("auth/me");
}
