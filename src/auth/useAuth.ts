import { useAuthStore } from '@/src/store/auth.temp';

export function useAuth() {
  const status = useAuthStore((state) => state.status);
  const initialize = useAuthStore((state) => state.initialize);
  const logout = useAuthStore((state) => state.logout);
  const setAuthFromResponse = useAuthStore((state) => state.setAuthFromResponse);

  return {
    status,
    isLoading: status === 'checking',
    isAuthenticated: status === 'authenticated',
    initialize,
    logout,
    setAuthFromResponse,
  };
}
