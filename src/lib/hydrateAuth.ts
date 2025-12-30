import { useAuthStore } from '../store/auth';
import { getToken } from './secureToken';

export async function hydrateAuth() {
  const token = await getToken();
  useAuthStore.getState().setToken(token);
  useAuthStore.getState().setHydrated();
}
