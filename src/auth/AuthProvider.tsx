import { useEffect, type ReactNode } from 'react';

import { useAuthStore } from '@/src/store/auth.temp';

export function AuthProvider({ children }: { children: ReactNode }) {
  const initialize = useAuthStore((state) => state.initialize);

  useEffect(() => {
    void initialize();
  }, [initialize]);

  return <>{children}</>;
}
