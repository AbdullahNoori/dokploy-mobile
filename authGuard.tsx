import { Redirect } from 'expo-router';
import type { ReactNode } from 'react';

import { useAuth } from '@/src/auth/useAuth';

export function AuthGate({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return null; // or splash

  if (!isAuthenticated) return <Redirect href="/(auth)" />;

  return children;
}
